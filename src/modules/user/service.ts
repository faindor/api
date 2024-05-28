import { eq } from "drizzle-orm";

import {
	createOrganization,
	findOrganizationByDomain,
} from "@modules/organization/service";
import db from "@shared/db";
import { userSchema } from "@shared/db/schema/user";
import type { CreateUserPayload } from "./types/request";

export const getUserById = async (id: number) => {
	const result = await db
		.select()
		.from(userSchema)
		.where(eq(userSchema.id, id));

	return result[0];
};

export const createUser = async (user: CreateUserPayload) => {
	let organizationId = null;
	// Only uses the domain (i.e "example" from "example@example.com")
	const organizationDomain = user.email.split("@")[1];
	const existingOrganization =
		await findOrganizationByDomain(organizationDomain);
	// Creates the organization if it doesn't exist
	if (!existingOrganization) {
		organizationId = await createOrganization({ domain: organizationDomain });
	} else {
		organizationId = existingOrganization.id;
	}

	const result = await db
		.insert(userSchema)
		.values({
			name: user.name,
			email: user.email,
			password: await Bun.password.hash(user.password),
			role: "user",
			organizationId: organizationId,
		})
		.returning();
	return result;
};
