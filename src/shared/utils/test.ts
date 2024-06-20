import { sign } from "hono/jwt";

import { UserRoles } from "@shared/types/roles";

type GetTestTokenParams = {
	invalid: boolean;
};

export const getTestJWT = async (params?: GetTestTokenParams) => {
	const tokenContent = {
		userId: 1,
		userRole: UserRoles.USER,
		// If an invalid token is requested, the user role is set to null
		userDomain: params?.invalid ? null : "@test.com",
	};
	return await sign(tokenContent, Bun.env.JWT_SECRET);
};
