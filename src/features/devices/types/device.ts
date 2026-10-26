export interface Device {
	deviceId: number;
	name: string;
	vendor: string;
	model: string | null;
	location: string | null;
	ipAddress: string;
	port: number;
	username: string | null;
	hasPassword: boolean;
	verifyTls: boolean;
	isActive: boolean;
	autoSync: boolean;
	syncIntervalMinutes: number;
	webhookUrl: string | null;
	isOnline: boolean;
	lastEventAt: string | null;
	lastSeenAt: string | null;
	lastSyncedAt: string | null;
	lastStatus: string | null;
	lastError: string | null;
	linkedUsersCount: number;
	deviceUsers?: DeviceUser[] | null;
}

export interface DeviceUser {
	deviceUserId: number;
	userId: number;
	deviceEmployeeNo: string;
	cardNo: string | null;
	fingerprintEnrolled: boolean;
	lastSyncedAt: string | null;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar: string | null;
	} | null;
}

export interface DeviceEvent {
	eventId: number;
	externalId: string | null;
	userId: number | null;
	deviceEmployeeNo: string | null;
	eventType: string | null;
	verifyMode: string | null;
	cardNo: string | null;
	doorNo: number | null;
	isAuthorized: boolean;
	occurredAt: string | null;
	user?: {
		userId: number;
		name: string;
		avatar: string | null;
	} | null;
}

export interface DeviceFormData {
	name: string;
	vendor?: string;
	model?: string | null;
	location?: string | null;
	ipAddress: string;
	port?: number;
	username?: string | null;
	password?: string | null;
	verifyTls?: boolean;
	isActive?: boolean;
	autoSync?: boolean;
	syncIntervalMinutes?: number;
}

export interface DeviceConnectionInfo {
	reachable: boolean;
	deviceName: string | null;
	deviceId: string | null;
	model: string | null;
	serialNumber: string | null;
	firmware: string | null;
}

export interface DevicePushResult {
	pushed: number;
	failed: number;
	errors: string[];
}

export interface DeviceEventPage {
	events: DeviceEvent[];
	total: number;
	currentPage: number;
	lastPage: number;
}
