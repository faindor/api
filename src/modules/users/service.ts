import { eq } from "drizzle-orm";

import {
	createOrganization,
	findOrganizationByDomain,
} from "@modules/organizations/service";
import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Users } from "@shared/db/tables/users";
import {
	CouldNotCreateError,
	CouldNotUpdateError,
	InvalidPasswordError,
	NotFoundError,
} from "@shared/types/errors";
import { UserRoles } from "@shared/types/roles";
import type { RegisterPayload } from "./types/request";

export const findUserById = async (id: number) => {
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
		.where(eq(Users.id, id));

	if (!result.length) return null;

	return result[0];
};

export const findUserByEmail = async (email: string) => {
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

	if (!result.length) return null;

	return result[0];
};

export const findUserByCredentials = async (
	email: string,
	password: string,
) => {
	const user = await findUserByEmail(email);

	if (!user) {
		throw new NotFoundError(`There is no user with the email: ${email}`);
	}

	const arePasswordsEqual = await Bun.password.verify(password, user.password);

	if (!arePasswordsEqual) {
		throw new InvalidPasswordError(
			`Invalid credentials for the email: ${email}`,
		);
	}

	return user;
};

export const createUser = async (user: RegisterPayload) => {
	let organizationId = null;

	// Only uses the domain (i.e "example" from "example@example.com")
	const organizationDomain = user.email.split("@")[1];
	const existingOrganization =
		await findOrganizationByDomain(organizationDomain);

	// Creates the organization if it doesn't exist
	if (!existingOrganization) {
		const createdOrganization = await createOrganization({
			domain: organizationDomain,
		});
		organizationId = createdOrganization.id;
	} else {
		organizationId = existingOrganization.id;
	}

	const result = await db
		.insert(Users)
		.values({
			name: user.name,
			email: user.email,
			password: await Bun.password.hash(user.password),
			role: UserRoles.USER,
			organizationId: organizationId,
		})
		.returning();

	if (!result.length) {
		throw new CouldNotCreateError(
			`Failed to create user with email: ${user.email} and name: ${user.name}`,
		);
	}

	return result[0];
};
