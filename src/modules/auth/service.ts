import { eq } from "drizzle-orm";

import {
	createOrganization,
	findOrganizationByDomain,
} from "@modules/organization/service";
import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Users } from "@shared/db/tables/users";
import type { RegisterPayload } from "./types/request";

export const getUserById = async (id: number) => {
	const result = await db.select().from(Users).where(eq(Users.id, id));

	return result[0];
};

export const getUserByEmail = async (email: string) => {
	const result = await db
		.select({
			id: Users.id,
			name: Users.name,
			email: Users.email,
			password: Users.password,
			role: Users.role,
			organization: Organizations,
		})
		.from(Users)
		.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
		.where(eq(Users.email, email));

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
		.insert(Users)
		.values({
			name: user.name,
			email: user.email,
			password: await Bun.password.hash(user.password),
			role: "USER",
			organizationId: organizationId,
		})
		.returning();
	return result;
};
