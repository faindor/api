import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email().min(1),
	password: z.string().min(1),
});

export const registerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email().min(1),
	password: z.string().min(1),
});

export type GetUserByCredentialsParams = z.infer<typeof loginSchema>;
export type CreateUserParams = z.infer<typeof registerSchema>;
