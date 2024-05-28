export type RegisterPayload = {
	name: string;
	email: string;
	password: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};
