import { count, eq } from "drizzle-orm";

import {
	createOrganization,
	getOrganizationByDomain,
} from "@modules/organizations/service";
import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Posts } from "@shared/db/tables/posts";
import { Users } from "@shared/db/tables/users";
import {
	CouldNotCreateError,
	InvalidPasswordError,
	NotFoundError,
} from "@shared/types/errors";
import { UserRoles } from "@shared/types/roles";
import type {
	CreateUserParams,
	GetUserByCredentialsParams,
} from "./types/request";

export const getPublicUserInfoById = async (id: number) => {
	const result = await db
		.select({
			id: Users.id,
			name: Users.name,
			email: Users.email,
			organization: {
				id: Organizations.id,
				domain: Organizations.domain,
			},
			publishedPosts: count(Posts.id),
		})
		.from(Users)
		.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
		.leftJoin(Posts, eq(Users.id, Posts.userId))
		.where(eq(Users.id, id));

	if (!result.length) return null;

	return result[0];
};

export const getUserById = async (id: number) => {
	const result = await db
		.select({
			id: Users.id,
			name: Users.name,
			email: Users.email,
			password: Users.password,
			role: Users.role,
			createdAt: Users.createdAt,
			deletedAt: Users.deletedAt,
			organization: Organizations,
		})
		.from(Users)
		.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
		.where(eq(Users.id, id));

	if (!result.length) return null;

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
			createdAt: Users.createdAt,
			deletedAt: Users.deletedAt,
			organization: Organizations,
		})
		.from(Users)
		.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
		.where(eq(Users.email, email));

	if (!result.length) return null;

	return result[0];
};

export const getUserByCredentials = async ({
	email,
	password,
}: GetUserByCredentialsParams) => {
	const user = await getUserByEmail(email);

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

export const createUser = async (user: CreateUserParams) => {
	let organizationId = null;

	// Only uses the domain (i.e "example" from "example@example.com")
	const organizationDomain = user.email.split("@")[1];
	const existingOrganization =
		await getOrganizationByDomain(organizationDomain);

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
		.returning({
			id: Users.id,
			name: Users.name,
			email: Users.email,
		});

	if (!result.length) {
		throw new CouldNotCreateError(
			`Failed to create user with email: ${user.email} and name: ${user.name}`,
		);
	}

	return result[0];
};
