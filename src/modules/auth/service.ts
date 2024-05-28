import { eq } from "drizzle-orm";

import {
	createOrganization,
	findOrganizationByDomain,
} from "@modules/organization/service";
import db from "@shared/db";
import { organizationSchema } from "@shared/db/schema/organization";
import { userSchema } from "@shared/db/schema/user";
import type { RegisterPayload } from "./types/request";

export const getUserById = async (id: number) => {
	const result = await db
		.select()
		.from(userSchema)
		.where(eq(userSchema.id, id));

	return result[0];
};

export const getUserByEmail = async (email: string) => {
	const result = await db
		.select({
			id: userSchema.id,
			name: userSchema.name,
			email: userSchema.email,
			password: userSchema.password,
			role: userSchema.role,
			organization: organizationSchema,
		})
		.from(userSchema)
		.leftJoin(
			organizationSchema,
			eq(userSchema.organizationId, organizationSchema.id),
		)
		.where(eq(userSchema.email, email));

	return result[0];
};

export const getUserByCredentials = async (email: string, password: string) => {
	const user = await getUserByEmail(email);

	const arePasswordsEqual = await Bun.password.verify(password, user.password);

	return arePasswordsEqual && user;
};

export const createUser = async (user: RegisterPayload) => {
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
