import { eq } from "drizzle-orm";

import db from "@shared/db";
import { type UserCreate, userSchema } from "@shared/db/schema/user";
import {
	createOrganization,
	findOrganizationByDomain,
} from "@modules/organization/service";

export const getUserById = async (id: number) => {
	const result = await db
		.select()
		.from(userSchema)
		.where(eq(userSchema.id, id));

	return result[0];
};

export const createUser = async (user: UserCreate) => {
	// Creates the organization if it doesn't exist
	let organizationId = null;
	// Only uses the domain (i.e "example" from "example@example.com")
	const organizationDomain = user.email.split("@")[1].split(".")[0];
	const existingOrganization =
		await findOrganizationByDomain(organizationDomain);
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
			password: user.password,
			role: "user",
			organizationId: organizationId,
		})
		.returning();
	return result;
};
