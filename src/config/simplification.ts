export const TABLES_APP_NAME = "The Tables ERP";

export const moduleKeys = {
	dashboard: "dashboard",
	clients: "clients",
	projects: "projects",
	tasks: "tasks",
	wiki: "wiki",
	employees: "employees",
	myAttendance: "myAttendance",
	attendanceManagement: "attendanceManagement",
	reports: "reports",
	roles: "roles",
	settings: "settings",
	timers: "timers",
	profile: "profile",
	clientPortal: "clientPortal",
	sales: "sales",
	invoices: "invoices",
	performance: "performance",
	employeeReview: "employeeReview",
	points: "points",
	financials: "financials",
	uiApproval: "uiApproval",
	globalSearch: "globalSearch",
} as const;

export type ModuleKey = (typeof moduleKeys)[keyof typeof moduleKeys];

const enabledModules = new Set<ModuleKey>([
	moduleKeys.dashboard,
	moduleKeys.clients,
	moduleKeys.projects,
	moduleKeys.tasks,
	moduleKeys.wiki,
	moduleKeys.employees,
	moduleKeys.myAttendance,
	moduleKeys.attendanceManagement,
	moduleKeys.reports,
	moduleKeys.roles,
	moduleKeys.settings,
	moduleKeys.timers,
	moduleKeys.profile,
	moduleKeys.clientPortal,
]);

const disabledModules = new Set<ModuleKey>([
	moduleKeys.sales,
	moduleKeys.invoices,
	moduleKeys.performance,
	moduleKeys.employeeReview,
	moduleKeys.points,
	moduleKeys.financials,
	moduleKeys.uiApproval,
	moduleKeys.globalSearch,
]);

export const isModuleEnabled = (module: ModuleKey): boolean => enabledModules.has(module);

export const isModuleDisabled = (module: ModuleKey): boolean => disabledModules.has(module);

export interface SimplifiedNavItem {
	id: string;
	title: string;
	href: string;
	module: ModuleKey;
	permission?: string;
	roles?: string[];
}

export interface SimplifiedNavGroup {
	title: string;
	items: SimplifiedNavItem[];
}

export const dashboardNavGroups: SimplifiedNavGroup[] = [
	{
		title: "Overview",
		items: [
			{
				id: "dashboard",
				title: "Dashboard",
				href: "/dashboard",
				module: moduleKeys.dashboard,
				permission: "view_dashboard",
			},
		],
	},
	{
		title: "CRM",
		items: [
			{
				id: "clients",
				title: "Clients",
				href: "/dashboard/clients",
				module: moduleKeys.clients,
				permission: "view_clients",
			},
		],
	},
	{
		title: "Work",
		items: [
			{
				id: "projects",
				title: "Projects",
				href: "/dashboard/projects",
				module: moduleKeys.projects,
				permission: "view_projects",
			},
			{
				id: "my-tasks",
				title: "My Tasks",
				href: "/dashboard/my-tasks",
				module: moduleKeys.tasks,
			},
			{
				id: "wiki",
				title: "Wiki",
				href: "/dashboard/wiki",
				module: moduleKeys.wiki,
				permission: "view_wiki",
			},
		],
	},
	{
		title: "People & Attendance",
		items: [
			{
				id: "employees",
				title: "Employees",
				href: "/dashboard/employees",
				module: moduleKeys.employees,
				permission: "manage_employees",
			},
			{
				id: "my-attendance",
				title: "My Attendance",
				href: "/dashboard/my-attendance",
				module: moduleKeys.myAttendance,
				permission: "view_attendance",
			},
			{
				id: "attendance-management",
				title: "Attendance Management",
				href: "/dashboard/attendance",
				module: moduleKeys.attendanceManagement,
				permission: "view_all_attendance",
			},
		],
	},
	{
		title: "Administration",
		items: [
			{
				id: "reports",
				title: "Reports",
				href: "/dashboard/admin",
				module: moduleKeys.reports,
				permission: "view_admin_stats",
			},
			{
				id: "roles",
				title: "Roles & Permissions",
				href: "/dashboard/roles",
				module: moduleKeys.roles,
				permission: "manage_roles",
			},
			{
				id: "settings",
				title: "Settings",
				href: "/dashboard/settings",
				module: moduleKeys.settings,
			},
		],
	},
];

export const clientPortalNavItems: SimplifiedNavItem[] = [
	{
		id: "client-dashboard",
		title: "Dashboard",
		href: "/client",
		module: moduleKeys.clientPortal,
	},
	{
		id: "client-projects",
		title: "Projects",
		href: "/client/projects",
		module: moduleKeys.projects,
	},
];

const disabledRouteRedirects: Record<string, string> = {
	"/dashboard/sales": "/dashboard",
	"/dashboard/sales/manager": "/dashboard",
	"/dashboard/invoices": "/dashboard",
	"/dashboard/performance": "/dashboard",
	"/dashboard/performance/periods": "/dashboard",
	"/dashboard/employee-review": "/dashboard",
	"/dashboard/user-points": "/dashboard",
	"/client/invoices": "/client",
};

export const isRouteDisabled = (pathname: string): boolean => {
	return Object.keys(disabledRouteRedirects).some((route) => pathname === route || pathname.startsWith(`${route}/`));
};

export const getDisabledRouteRedirect = (pathname: string): string => {
	const matchedRoute = Object.keys(disabledRouteRedirects)
		.sort((a, b) => b.length - a.length)
		.find((route) => pathname === route || pathname.startsWith(`${route}/`));

	return matchedRoute ? disabledRouteRedirects[matchedRoute] : "/dashboard";
};

export const roleLabels: Record<string, string> = {
	"super-admin": "Super Admin",
	admin: "Admin",
	manager: "Manager",
	developer: "Employee",
	employee: "Employee",
	client: "Client",
	guest: "Guest",
};

export const getRoleLabel = (role?: string | null): string => {
	if (!role) return roleLabels.guest;
	return roleLabels[role] ?? role.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const canShowNavigationItem = (
	item: SimplifiedNavItem,
	context: {
		role: string | null;
		hasPermission: (permissionName: string) => boolean;
	}
): boolean => {
	if (!isModuleEnabled(item.module)) return false;
	if (item.permission && !context.hasPermission(item.permission)) return false;
	if (item.roles && (!context.role || !item.roles.includes(context.role))) return false;
	return true;
};
