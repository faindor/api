import { eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { CouldNotCreateError } from "@shared/types/errors";
import type { CreateOrganizationPayload } from "./types/request";

export const getOrganizationByDomain = async (domain: string) => {
	const result = await db
		.select({
			id: Organizations.id,
			domain: Organizations.domain,
			createdAt: Organizations.createdAt,
			deletedAt: Organizations.deletedAt,
		})
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
