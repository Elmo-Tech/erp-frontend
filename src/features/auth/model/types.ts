export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	data: {
		tokenDetails: {
			expiresIn: number;
		};
		profile: {
			userId: number;
			name: string;
			email: string;
			avatar: string;
		};
		role: string;
		permissions: Array<{
			permissionName: string;
			access: boolean;
		}>;
	};
}

export interface ApiError {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
}
