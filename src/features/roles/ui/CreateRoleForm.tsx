"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Permission } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormMultiCombobox } from "@/shared/ui/forms/FormMultiCombobox";
import { createRoleSchema, type CreateRoleFormData } from "../model/role.schema";
import { useCreateRole } from "../model/use-role-actions";

// ─────────────────────────────────────────────────────────────────────────────
// Group order mirrors the seeder's PERMISSION CATALOGUE comments exactly
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_ORDER: string[] = [
	"Dashboard",
	"User Management",
	"Role Management",
	"Client Management",
	"Project Management",
	"Project Members",
	"Project Files",
	"Task Management",
	"Sales — Leads",
	"Sales — Quotations",
	"Sales — Contracts",
	"Invoice Management",
	"Wiki Management",
	"Time Tracking",
	"Attendance",
	"Employee Management",
	"SOP Management",
	"Meetings",
	"Client Portal",
	"Reports & Analytics",
	"Financial Data",
	"Settings",
	"Security & Audit",
	"Tags",
	"Other",
];

interface CreateRoleFormProps {
	permissions: Permission[];
	onSuccess?: () => void;
}

export function CreateRoleForm({ permissions, onSuccess }: CreateRoleFormProps) {
	const createRole = useCreateRole();

	const form = useForm<CreateRoleFormData>({
		resolver: zodResolver(createRoleSchema),
		defaultValues: { name: "", permissions: [] },
	});

	// Map Permission[] → MultiComboboxOption[] with group ordering
	const permissionOptions = (() => {
		// Build a map of group → options
		const map = permissions.reduce<Record<string, { value: string; label: string; group: string; description?: string }[]>>((acc, p) => {
			const g = p.group || "Other";
			(acc[g] ??= []).push({
				value: p.name,
				label: formatLabel(p.name),
				group: g,
				description: p.description || undefined,
			});
			return acc;
		}, {});

		// Return in seeder order
		return GROUP_ORDER.flatMap((g) => map[g] ?? []);
	})();

	const onSubmit = async (data: CreateRoleFormData) => {
		try {
			await createRole.mutateAsync({ name: data.name, permissions: data.permissions });
			toast.success(`Role "${data.name}" created`);
			form.reset();
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create role");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<FormInput
					control={form.control}
					name="name"
					label="Role name"
					placeholder="e.g. project-manager"
					description="Use lowercase letters, numbers, hyphens, or underscores."
				/>

				<FormMultiCombobox
					control={form.control}
					name="permissions"
					label="Permissions"
					placeholder="Select permissions…"
					searchPlaceholder="Search permissions…"
					emptyText="No permissions found."
					description="Search and select the permissions this role should have."
					options={permissionOptions}
					maxBadges={4}
				/>

				<Button
					type="submit"
					disabled={createRole.isPending}
					className="w-full"
				>
					{createRole.isPending && <Loader2 className="animate-spin" />}
					Create role
				</Button>
			</form>
		</Form>
	);
}

function formatLabel(name: string) {
	return name
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}
