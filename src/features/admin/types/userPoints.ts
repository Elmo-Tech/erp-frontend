export interface UserPoint {
	userPointId: number;
	userId: number;
	pointsChange: number;
	pointsBefore: number;
	pointsAfter: number;
	reason: string;
	type: "manual" | "automatic";
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserWithPoints {
	userId: number;
	name: string;
	email: string;
	avatar: string;
	totalPoints: number;
	isActive: boolean;
	createdAt: string;
}

export interface LeaderboardUser {
	userId: number;
	name: string;
	avatar: string;
	totalPoints: number;
	rank: number;
}

export interface PointsStatistics {
	totalUsers: number;
	totalPoints: number;
	averagePoints: number;
	monthlyActivity: number;
	topUser: {
		name: string;
		points: number;
	} | null;
}

export interface AddPointsFormData {
	userId: number;
	points: number;
	reason: string;
}

export interface DeductPointsFormData {
	userId: number;
	points: number;
	reason: string;
}

export interface SetPointsFormData {
	userId: number;
	points: number;
	reason: string;
}

export interface UserPointsFilters {
	search?: string;
	isActive?: boolean;
	sortBy?: "total_points" | "name" | "created_at";
	sortOrder?: "asc" | "desc";
}

export interface UserPointsHistoryResponse {
	pointsHistory: UserPoint[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}

export interface UsersWithPointsResponse {
	users: UserWithPoints[];
	pagination: {
		total: number;
		count: number;
		perPage: number;
		currentPage: number;
		totalPages: number;
	};
}
