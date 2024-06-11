import { z } from "zod";

export type LoginPayload = {
	email: string;
	password: string;
};

export type RegisterPayload = {
	name: string;
	email: string;
	password: string;
};

export const getUserSchema = z.number().int().positive().safe();
