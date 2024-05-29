import { eq } from "drizzle-orm";

import db from "@shared/db";
import {
	type OrganizationInsert,
	Organizations,
} from "@shared/db/tables/organization";

export const findOrganizationByDomain = async (domain: string) => {
	const result = await db
		.select()
		.from(Organizations)
		.where(eq(Organizations.domain, domain));

	if (!result.length) return null;

	return result[0];
};

export const createOrganization = async (organization: OrganizationInsert) => {
	const result = await db
		.insert(Organizations)
		.values({
			domain: organization.domain,
		})
		.returning({ id: Organizations.id });
	return result[0].id;
};
