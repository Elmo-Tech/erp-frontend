/**
 * Unified Status Helpers
 * Centralized status labels and colors matching backend enums
 */

// ============ Lead Status ============
export enum LeadStatus {
	NEW = "new",
	CONTACTED = "contacted",
	QUALIFIED = "qualified",
	PROPOSAL = "proposal",
	NEGOTIATION = "negotiation",
	WON = "won",
	LOST = "lost",
}

export const LeadStatusLabels: Record<LeadStatus, string> = {
	[LeadStatus.NEW]: "New",
	[LeadStatus.CONTACTED]: "Contacted",
	[LeadStatus.QUALIFIED]: "Qualified",
	[LeadStatus.PROPOSAL]: "Proposal",
	[LeadStatus.NEGOTIATION]: "Negotiation",
	[LeadStatus.WON]: "Won",
	[LeadStatus.LOST]: "Lost",
};

export const LeadStatusColors: Record<LeadStatus, string> = {
	[LeadStatus.NEW]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[LeadStatus.CONTACTED]: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
	[LeadStatus.QUALIFIED]: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
	[LeadStatus.PROPOSAL]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[LeadStatus.NEGOTIATION]: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
	[LeadStatus.WON]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[LeadStatus.LOST]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Lead Priority ============
export enum LeadPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	URGENT = "urgent",
}

export const LeadPriorityLabels: Record<LeadPriority, string> = {
	[LeadPriority.LOW]: "Low",
	[LeadPriority.MEDIUM]: "Medium",
	[LeadPriority.HIGH]: "High",
	[LeadPriority.URGENT]: "Urgent",
};

export const LeadPriorityColors: Record<LeadPriority, string> = {
	[LeadPriority.LOW]: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[LeadPriority.MEDIUM]: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[LeadPriority.HIGH]: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[LeadPriority.URGENT]: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Quotation Status ============
export enum QuotationStatus {
	DRAFT = "draft",
	SENT = "sent",
	VIEWED = "viewed",
	EXPIRED = "expired",
	NEGOTIATION = "negotiation",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export const QuotationStatusLabels: Record<QuotationStatus, string> = {
	[QuotationStatus.DRAFT]: "Draft",
	[QuotationStatus.SENT]: "Sent",
	[QuotationStatus.VIEWED]: "Viewed",
	[QuotationStatus.EXPIRED]: "Expired",
	[QuotationStatus.NEGOTIATION]: "Negotiation",
	[QuotationStatus.APPROVED]: "Approved",
	[QuotationStatus.REJECTED]: "Rejected",
};

export const QuotationStatusColors: Record<QuotationStatus, string> = {
	[QuotationStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[QuotationStatus.SENT]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[QuotationStatus.VIEWED]: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
	[QuotationStatus.EXPIRED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
	[QuotationStatus.NEGOTIATION]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[QuotationStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[QuotationStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Contract Status ============
export enum ContractStatus {
	DRAFT = "draft",
	PENDING_SIGNATURE = "pending_signature",
	SIGNED = "signed",
	ACTIVE = "active",
	COMPLETED = "completed",
	TERMINATED = "terminated",
}

export const ContractStatusLabels: Record<ContractStatus, string> = {
	[ContractStatus.DRAFT]: "Draft",
	[ContractStatus.PENDING_SIGNATURE]: "Pending Signature",
	[ContractStatus.SIGNED]: "Signed",
	[ContractStatus.ACTIVE]: "Active",
	[ContractStatus.COMPLETED]: "Completed",
	[ContractStatus.TERMINATED]: "Terminated",
};

export const ContractStatusColors: Record<ContractStatus, string> = {
	[ContractStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[ContractStatus.PENDING_SIGNATURE]: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
	[ContractStatus.SIGNED]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[ContractStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[ContractStatus.COMPLETED]: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
	[ContractStatus.TERMINATED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Project Status ============
export enum ProjectStatus {
	DRAFT = "draft",
	ACTIVE = "active",
	UI_UX = "ui_ux",
	DEVELOPMENT = "development",
	TESTING = "testing",
	COMPLETED = "completed",
	ON_HOLD = "on_hold",
	CANCELLED = "cancelled",
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
	[ProjectStatus.DRAFT]: "Draft",
	[ProjectStatus.ACTIVE]: "Active",
	[ProjectStatus.UI_UX]: "UI/UX Phase",
	[ProjectStatus.DEVELOPMENT]: "Development",
	[ProjectStatus.TESTING]: "Testing",
	[ProjectStatus.COMPLETED]: "Completed",
	[ProjectStatus.ON_HOLD]: "On Hold",
	[ProjectStatus.CANCELLED]: "Cancelled",
};

export const ProjectStatusColors: Record<ProjectStatus, string> = {
	[ProjectStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[ProjectStatus.ACTIVE]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[ProjectStatus.UI_UX]: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
	[ProjectStatus.DEVELOPMENT]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[ProjectStatus.TESTING]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[ProjectStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[ProjectStatus.ON_HOLD]: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
	[ProjectStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Task Status ============
export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	TESTING = "testing",
	COMPLETED = "completed",
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "To Do",
	[TaskStatus.IN_PROGRESS]: "In Progress",
	[TaskStatus.REVIEW]: "Review",
	[TaskStatus.TESTING]: "Testing",
	[TaskStatus.COMPLETED]: "Completed",
};

export const TaskStatusColors: Record<TaskStatus, string> = {
	[TaskStatus.TODO]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[TaskStatus.REVIEW]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[TaskStatus.TESTING]: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
	[TaskStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

// ============ Task Priority ============
export enum TaskPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	URGENT = "urgent",
}

export const TaskPriorityLabels: Record<TaskPriority, string> = {
	[TaskPriority.LOW]: "Low",
	[TaskPriority.MEDIUM]: "Medium",
	[TaskPriority.HIGH]: "High",
	[TaskPriority.URGENT]: "Urgent",
};

export const TaskPriorityColors: Record<TaskPriority, string> = {
	[TaskPriority.LOW]: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
	[TaskPriority.MEDIUM]: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[TaskPriority.HIGH]: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[TaskPriority.URGENT]: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Invoice Status ============
export enum InvoiceStatus {
	DRAFT = "draft",
	SENT = "sent",
	PAID = "paid",
	OVERDUE = "overdue",
	CANCELLED = "cancelled",
}

export const InvoiceStatusLabels: Record<InvoiceStatus, string> = {
	[InvoiceStatus.DRAFT]: "Draft",
	[InvoiceStatus.SENT]: "Sent",
	[InvoiceStatus.PAID]: "Paid",
	[InvoiceStatus.OVERDUE]: "Overdue",
	[InvoiceStatus.CANCELLED]: "Cancelled",
};

export const InvoiceStatusColors: Record<InvoiceStatus, string> = {
	[InvoiceStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[InvoiceStatus.SENT]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[InvoiceStatus.PAID]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[InvoiceStatus.OVERDUE]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
	[InvoiceStatus.CANCELLED]: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
};

// ============ Milestone Status ============
export enum MilestoneStatus {
	PENDING = "pending",
	DUE = "due",
	INVOICED = "invoiced",
	PAID = "paid",
	OVERDUE = "overdue",
}

export const MilestoneStatusLabels: Record<MilestoneStatus, string> = {
	[MilestoneStatus.PENDING]: "Pending",
	[MilestoneStatus.DUE]: "Due",
	[MilestoneStatus.INVOICED]: "Invoiced",
	[MilestoneStatus.PAID]: "Paid",
	[MilestoneStatus.OVERDUE]: "Overdue",
};

export const MilestoneStatusColors: Record<MilestoneStatus, string> = {
	[MilestoneStatus.PENDING]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[MilestoneStatus.DUE]: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
	[MilestoneStatus.INVOICED]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[MilestoneStatus.PAID]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[MilestoneStatus.OVERDUE]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Client Status ============
export enum ClientStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
	SUSPENDED = "suspended",
}

export const ClientStatusLabels: Record<ClientStatus, string> = {
	[ClientStatus.ACTIVE]: "Active",
	[ClientStatus.INACTIVE]: "Inactive",
	[ClientStatus.SUSPENDED]: "Suspended",
};

export const ClientStatusColors: Record<ClientStatus, string> = {
	[ClientStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[ClientStatus.INACTIVE]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[ClientStatus.SUSPENDED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

// ============ Task Type ============
export enum TaskType {
	MAIN = "main",
	WEEKLY = "weekly",
	SUBTASK = "subtask",
}

export const TaskTypeLabels: Record<TaskType, string> = {
	[TaskType.MAIN]: "Main Task",
	[TaskType.WEEKLY]: "Weekly Task",
	[TaskType.SUBTASK]: "Subtask",
};

export const TaskTypeColors: Record<TaskType, string> = {
	[TaskType.MAIN]: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
	[TaskType.WEEKLY]: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
	[TaskType.SUBTASK]: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
};

// ============ Task Category ============
export enum TaskCategory {
	BACKEND = "backend",
	FRONTEND = "frontend",
	API = "api",
	DATABASE = "database",
	UI = "ui",
	UX = "ux",
	UI_UX = "ui_ux",
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

// ============ Deliverable Status ============
export enum DeliverableStatus {
	PENDING = "pending",
	SUBMITTED = "submitted",
	UNDER_REVIEW = "under_review",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export const DeliverableStatusLabels: Record<DeliverableStatus, string> = {
	[DeliverableStatus.PENDING]: "Pending",
	[DeliverableStatus.SUBMITTED]: "Submitted",
	[DeliverableStatus.UNDER_REVIEW]: "Under Review",
	[DeliverableStatus.APPROVED]: "Approved",
	[DeliverableStatus.REJECTED]: "Rejected",
};

export const DeliverableStatusColors: Record<DeliverableStatus, string> = {
	[DeliverableStatus.PENDING]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[DeliverableStatus.SUBMITTED]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[DeliverableStatus.UNDER_REVIEW]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[DeliverableStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[DeliverableStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

export const TaskCategoryLabels: Record<TaskCategory, string> = {
	[TaskCategory.BACKEND]: "Backend Development",
	[TaskCategory.FRONTEND]: "Frontend Development",
	[TaskCategory.API]: "API Development",
	[TaskCategory.DATABASE]: "Database Work",
	[TaskCategory.UI]: "User Interface",
	[TaskCategory.UX]: "User Experience",
	[TaskCategory.UI_UX]: "UI/UX Design",
	[TaskCategory.COMPONENT]: "Component Development",
	[TaskCategory.STYLING]: "Styling & CSS",
	[TaskCategory.DESIGN]: "Design Work",
	[TaskCategory.PROTOTYPE]: "Prototyping",
	[TaskCategory.WIREFRAME]: "Wireframing",
	[TaskCategory.MOBILE]: "Mobile Development",
	[TaskCategory.IOS]: "iOS Development",
	[TaskCategory.ANDROID]: "Android Development",
	[TaskCategory.REACT_NATIVE]: "React Native",
	[TaskCategory.DEPLOYMENT]: "Deployment",
	[TaskCategory.INFRASTRUCTURE]: "Infrastructure",
	[TaskCategory.CI_CD]: "CI/CD Pipeline",
	[TaskCategory.MONITORING]: "Monitoring & Logging",
	[TaskCategory.TESTING]: "Testing",
	[TaskCategory.AUTOMATION]: "Test Automation",
	[TaskCategory.BUG_FIX]: "Bug Fix",
	[TaskCategory.QUALITY_ASSURANCE]: "Quality Assurance",
	[TaskCategory.SERVER]: "Server Management",
	[TaskCategory.GENERAL]: "General Task",
};

export const TaskCategoryColors: Record<TaskCategory, string> = {
	[TaskCategory.BACKEND]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[TaskCategory.API]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[TaskCategory.DATABASE]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[TaskCategory.SERVER]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	[TaskCategory.FRONTEND]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[TaskCategory.UI]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[TaskCategory.COMPONENT]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[TaskCategory.STYLING]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
	[TaskCategory.DESIGN]: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
	[TaskCategory.PROTOTYPE]: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
	[TaskCategory.WIREFRAME]: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
	[TaskCategory.UX]: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
	[TaskCategory.UI_UX]: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
	[TaskCategory.MOBILE]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[TaskCategory.IOS]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[TaskCategory.ANDROID]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[TaskCategory.REACT_NATIVE]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	[TaskCategory.DEPLOYMENT]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[TaskCategory.INFRASTRUCTURE]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[TaskCategory.CI_CD]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[TaskCategory.MONITORING]: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
	[TaskCategory.TESTING]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[TaskCategory.AUTOMATION]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[TaskCategory.BUG_FIX]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[TaskCategory.QUALITY_ASSURANCE]: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
	[TaskCategory.GENERAL]: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
};

// ============ Helper Functions ============
export function getStatusLabel<T extends string>(status: T, labels: Record<T, string>): string {
	return labels[status] || status;
}

export function getStatusColor<T extends string>(status: T, colors: Record<T, string>): string {
	return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

// ============ Project Status Transitions ============
export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
	[ProjectStatus.DRAFT]: [ProjectStatus.ACTIVE],
	[ProjectStatus.ACTIVE]: [ProjectStatus.UI_UX, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.UI_UX]: [ProjectStatus.DEVELOPMENT, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.DEVELOPMENT]: [ProjectStatus.TESTING, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.TESTING]: [ProjectStatus.COMPLETED, ProjectStatus.DEVELOPMENT, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
	[ProjectStatus.COMPLETED]: [],
	[ProjectStatus.ON_HOLD]: [],
	[ProjectStatus.CANCELLED]: [],
};

export function getAvailableProjectTransitions(currentStatus: ProjectStatus, previousStatus?: ProjectStatus | null): ProjectStatus[] {
	if (currentStatus === ProjectStatus.ON_HOLD && previousStatus) {
		return [previousStatus];
	}
	const baseTransitions = PROJECT_STATUS_TRANSITIONS[currentStatus] || [];
	if (currentStatus !== ProjectStatus.COMPLETED && currentStatus !== ProjectStatus.CANCELLED) {
		const transitionsWithCancel = [...baseTransitions];
		if (!transitionsWithCancel.includes(ProjectStatus.CANCELLED)) {
			transitionsWithCancel.push(ProjectStatus.CANCELLED);
		}
		return transitionsWithCancel;
	}
	return baseTransitions;
}

export function canProjectTransitionTo(currentStatus: ProjectStatus, targetStatus: ProjectStatus, previousStatus?: ProjectStatus | null): boolean {
	if (currentStatus === targetStatus) return false;
	if (currentStatus === ProjectStatus.ON_HOLD && previousStatus) {
		return targetStatus === previousStatus;
	}
	if (targetStatus === ProjectStatus.CANCELLED && currentStatus !== ProjectStatus.COMPLETED) {
		return true;
	}
	const allowedTransitions = PROJECT_STATUS_TRANSITIONS[currentStatus] || [];
	return allowedTransitions.includes(targetStatus);
}

// ============ Task Status Transitions ============
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
	[TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
	[TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.TODO],
	[TaskStatus.REVIEW]: [TaskStatus.TESTING, TaskStatus.IN_PROGRESS],
	[TaskStatus.TESTING]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS],
	[TaskStatus.COMPLETED]: [],
};

export function getAvailableTaskTransitions(currentStatus: TaskStatus): TaskStatus[] {
	return TASK_STATUS_TRANSITIONS[currentStatus] || [];
}

export function canTaskTransitionTo(currentStatus: TaskStatus, targetStatus: TaskStatus): boolean {
	if (currentStatus === targetStatus) return false;
	const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus] || [];
	return allowedTransitions.includes(targetStatus);
}
