import { Hono } from "hono";

import { InvalidPayloadError } from "@shared/types/errors";
import type { CreateOrganizationPayload } from "./types/request";
import { createOrganization, findOrganizationById } from "./service";

const organizationApp = new Hono();

organizationApp.get("/:id", async (c) => {
	const rawId = c.req.param("id");
	const parsedId = Number(rawId);
	if (!parsedId) {
		return c.json(
			{ error: new Error(`Invalid organization id: ${rawId}`) },
			{ status: 400 },
		);
	}

	const organization = await findOrganizationById(parsedId);
	return c.json(organization);
});

organizationApp.post("/", async (c) => {
	try {
		const payload = await c.req.json<CreateOrganizationPayload>();

		if (!payload.domain) {
			throw new InvalidPayloadError(
				"Domain is required to create an organization",
			);
		}

		const createdOrganization = await createOrganization(payload);

		return c.json(createdOrganization);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

export default organizationApp;
