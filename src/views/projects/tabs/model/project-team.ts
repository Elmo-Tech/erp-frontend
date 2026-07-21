import { z } from "zod";
import type { AddMemberPayload } from "@/features/projects/api/execution.api";
import type { InternalUser } from "@/entities/user/model/types";

const fallbackRoleConfig = {
	label: "",
	className: "bg-muted/70 text-muted-foreground border-border",
};

export const projectMemberRoleOptions = [
	{ value: "manager", label: "Manager" },
	{ value: "tech_lead", label: "Tech Lead" },
	{ value: "developer", label: "Developer" },
	{ value: "qa", label: "QA" },
	{ value: "designer", label: "Designer" },
];

const projectMemberRoleConfig: Record<string, { label: string; className: string }> = {
	manager: {
		label: "Manager",
		className: "bg-violet-50 text-violet-700 border-violet-200",
	},
	tech_lead: {
		label: "Tech Lead",
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	developer: {
		label: "Developer",
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
	qa: {
		label: "QA",
		className: "bg-amber-50 text-amber-700 border-amber-200",
	},
	designer: {
		label: "Designer",
		className: "bg-pink-50 text-pink-700 border-pink-200",
	},
};

export const addProjectMemberSchema = z.object({
	userId: z.string().min(1, "Please select a user"),
	role: z.string().min(1, "Please select a role"),
});

export type AddProjectMemberFormData = z.infer<typeof addProjectMemberSchema>;

export const addProjectMemberFormDefaults: AddProjectMemberFormData = {
	userId: "",
	role: "developer",
};

export function getProjectMemberRoleConfig(role: string) {
	return projectMemberRoleConfig[role.toLowerCase()] ?? { ...fallbackRoleConfig, label: role };
}

export function getProjectMemberInitials(name: string): string {
	return name
		.split(" ")
		.slice(0, 2)
		.map((namePart) => namePart[0])
		.join("")
		.toUpperCase();
}

export function buildInternalUserOptions(users: InternalUser[]) {
	return users.map((user) => ({
		value: String(user.id),
		label: user.name,
	}));
}

export function mapAddProjectMemberFormToPayload(formData: AddProjectMemberFormData): AddMemberPayload {
	return {
		userId: Number(formData.userId),
		role: formData.role,
	};
}
