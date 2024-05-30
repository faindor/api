import { Hono } from "hono";

import { InvalidPayloadError } from "@shared/types/errors";
import { createOrganization, findOrganizationById } from "./service";
import type { CreateOrganizationPayload } from "./types/request";
import { jwt } from "@shared/middleware/jwt";

const organizationApp = new Hono();

organizationApp.get("/:id", jwt, async (c) => {
	try {
		const rawId = c.req.param("id");
		const parsedId = Number(rawId);
		if (!parsedId) {
			throw new InvalidPayloadError(`Invalid organization id: ${rawId}`);
		}

		const organization = await findOrganizationById(parsedId);
		return c.json(organization);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

organizationApp.post("/", jwt, async (c) => {
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