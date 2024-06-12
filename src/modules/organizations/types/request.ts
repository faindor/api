import { z } from "zod";

export const createOrganizationSchema = z.object({
	domain: z.string().min(1),
});

export type CreateOrganizationParams = z.infer<typeof createOrganizationSchema>;
