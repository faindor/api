import { CustomError } from "@shared/types/errors";

export const getStatusCode = (error: unknown) => {
	if (error instanceof CustomError) {
		return error.getCode();
	}

	return 500;
};
