export type LoginPayload = {
	email: string;
	password: string;
};

export type RegisterPayload = {
	name: string;
	email: string;
	password: string;
};

export type UpdateUserPayload = {
	id: number;
	name?: string;
	email?: string;
	password?: string;
};
