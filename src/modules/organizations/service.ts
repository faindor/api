import { eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { CouldNotCreateError } from "@shared/types/errors";
import type { CreateOrganizationParams } from "./types/request";
import { parseDBError } from "@shared/utils/error";

export const getOrganizationByDomain = async (domain: string) => {
	try {
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
	} catch (error) {
		throw parseDBError(error);
	}
};

export const createOrganization = async ({
	domain,
}: CreateOrganizationParams) => {
	try {
		const result = await db
			.insert(Organizations)
			.values({
				domain: domain,
			})
			.returning({ id: Organizations.id });

		if (!result.length) {
			throw new CouldNotCreateError(
				`Failed to create organization with domain: ${domain} `,
			);
		}

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};
