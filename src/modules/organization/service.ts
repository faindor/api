import { eq } from "drizzle-orm";

import db from "@shared/db";
import {
	type OrganizationCreate,
	organizationSchema,
} from "@shared/db/schema/organization";

export const findOrganizationByDomain = async (domain: string) => {
	const result = await db
		.select()
		.from(organizationSchema)
		.where(eq(organizationSchema.domain, domain));

	if (!result.length) return null;

	return result[0];
};

export const createOrganization = async (organization: OrganizationCreate) => {
	const result = await db
		.insert(organizationSchema)
		.values({
			domain: organization.domain,
		})
		.returning({ id: organizationSchema.id });
	return result[0].id;
};
