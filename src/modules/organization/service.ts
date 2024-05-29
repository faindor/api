import { eq } from "drizzle-orm";

import db from "@shared/db";
import { CouldNotCreateError } from "@shared/types/errors";
import { Organizations } from "@shared/db/tables/organizations";
import type { CreateOrganizationPayload } from "./types/request";

export const findOrganizationById = async (id: number) => {
	const result = await db
		.select()
		.from(Organizations)
		.where(eq(Organizations.id, id));

	if (!result.length) return null;

	return result[0];
};

export const findOrganizationByDomain = async (domain: string) => {
	const result = await db
		.select()
		.from(Organizations)
		.where(eq(Organizations.domain, domain));

	if (!result.length) return null;

	return result[0];
};

export const createOrganization = async (
	organization: CreateOrganizationPayload,
) => {
	const result = await db
		.insert(Organizations)
		.values({
			domain: organization.domain,
		})
		.returning({ id: Organizations.id });

	if (!result.length) {
		throw new CouldNotCreateError(
			`Failed to create organization with domain: ${organization.domain} `,
		);
	}

	return result[0];
};
