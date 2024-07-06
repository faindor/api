export abstract class CustomError extends Error {
	public code = 500;
	public reasons: string[] = [];
	public context = "";

	constructor(reason: string | string[], code = 500, context = "") {
		super();
		this.reasons = this.parseReason(reason);
		this.code = code;
		this.name = this.constructor.name;
		this.context = context;
	}

	private parseReason(reason: string | string[]) {
		if (typeof reason === "string") {
			return [reason];
		}

		return reason;
	}

	public getCode() {
		return this.code;
	}

	public getParsedError() {
		return {
			name: this.name,
			code: this.code,
			reasons: this.reasons,
			context: this.context,
		};
	}
}

export class NotFoundError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 404, context);
	}
}

export class CouldNotCreateError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 500, context);
	}
}

export class CouldNotUpdateError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 500, context);
	}
}

export class CouldNotDeleteError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 500, context);
	}
}

export class AuthorizationError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 401, context);
	}
}

export class InvalidCredentialsError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 400, context);
	}
}

export class ValidationError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 400, context);
	}
}

export class DBError extends CustomError {
	constructor(reason: string | string[], context?: string) {
		super(reason, 500, context);
	}
}
