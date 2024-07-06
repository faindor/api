import { NeonDbError } from "@neondatabase/serverless";
import { CustomError, DBError } from "@shared/types/errors";

export const getStatusCode = (error: unknown) => {
	if (error instanceof CustomError) {
		return error.getCode();
	}

	return 500;
};

export const parseDBError = (error: unknown) => {
	if (error instanceof NeonDbError) {
		console.log("NeonDbError with code: ", error.code);
		return new DBError("There was an error with the database");
	}

	return error;
};
