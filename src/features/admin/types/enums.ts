/**
 * Enum Types for User Specialization and Task Categories
 */

/**
 * User specialization enum option
 */
export interface UserSpecializationOption {
	value: string;
	label: string;
	color: string;
}

/**
 * Task category enum option
 */
export interface TaskCategoryOption {
	value: string;
	label: string;
	color: string;
}

/**
 * User specialization values
 */
export enum UserSpecialization {
	BACKEND = "backend",
	FRONTEND = "frontend",
	FULLSTACK = "fullstack",
	UI_UX = "ui_ux",
	MOBILE = "mobile",
	DEVOPS = "devops",
	QA = "qa",
}

/**
 * Task category values
 */
export enum TaskCategory {
	BACKEND = "backend",
	FRONTEND = "frontend",
	API = "api",
	DATABASE = "database",
	UI = "ui",
	COMPONENT = "component",
	STYLING = "styling",
	DESIGN = "design",
	PROTOTYPE = "prototype",
	WIREFRAME = "wireframe",
	MOBILE = "mobile",
	IOS = "ios",
	ANDROID = "android",
	REACT_NATIVE = "react_native",
	DEPLOYMENT = "deployment",
	INFRASTRUCTURE = "infrastructure",
	CI_CD = "ci_cd",
	MONITORING = "monitoring",
	TESTING = "testing",
	AUTOMATION = "automation",
	BUG_FIX = "bug_fix",
	QUALITY_ASSURANCE = "quality_assurance",
	SERVER = "server",
	GENERAL = "general",
}

/**
 * Response structure for user specializations endpoint
 */
export interface UserSpecializationsResponse {
	data: UserSpecializationOption[];
}

/**
 * Response structure for task categories endpoint
 */
export interface TaskCategoriesResponse {
	data: TaskCategoryOption[];
}

/**
 * Response structure for compatible task categories endpoint
 */
export interface CompatibleTaskCategoriesResponse {
	data: TaskCategoryOption[];
}
