import { describe, expect, test } from "bun:test";

import { AuthorizationError } from "@shared/types/errors";
import { getTestJWT } from "@shared/utils/test";
import app from "../../../index";
import { jwt } from "../jwt";

describe("jwt middleware", () => {
	app.get("/protected_route_test", jwt, async (c) => {
		return c.json({ loggedUser: c.get("loggedUser") }, { status: 200 });
	});

	const getLatestsPostsRequest = (headers?: HeadersInit) => {
		return app.request("/protected_route_test", {
			method: "GET",
			headers: headers,
		});
	};

	test("should throw an error if no authorization header is provided", async () => {
		const res = await getLatestsPostsRequest();
		expect(res.status).toBe(401);
	});

	test("should throw an error if the token is missing", async () => {
		const res = await getLatestsPostsRequest({
			Authorization: "Bearer ",
		});
		expect(res.status).toBe(401);
	});

	test("should throw an error if any field in the token is missing", async () => {
		const testJWT = await getTestJWT({ invalid: true });
		const res = await getLatestsPostsRequest({
			Authorization: `Bearer ${testJWT}`,
		});
		expect(res.status).toBe(401);
	});

	test("should resolve successfully if the token is valid", async () => {
		const testJWT = await getTestJWT();
		const res = await getLatestsPostsRequest({
			Authorization: `Bearer ${testJWT}`,
		});
		expect(res.status).toBe(200);
	});
});
