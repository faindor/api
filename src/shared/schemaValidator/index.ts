import { ValidationError } from "@shared/types/errors";
import type { z } from "zod";

type SchemaValidatorParams<T extends z.ZodType> = {
	schema: T;
	value: unknown;
	route: string;
};

export const schemaValidator = <T extends z.ZodType>({
	schema,
	value,
	route,
}: SchemaValidatorParams<T>): z.infer<T> => {
	const { success, data, error } = schema.safeParse(value);

	if (success) {
		return data;
	}

	console.error(error);

	throw new ValidationError(`Failed to validate the request at ${route}`);
};
