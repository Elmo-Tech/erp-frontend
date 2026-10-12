"use client";

import { Control, useWatch } from "react-hook-form";
import { FormInput, FormSelect, FormSwitch } from "@/components/shared";
import { EmployeeAvatarField } from "./EmployeeAvatarField";

interface EmployeeFormFieldsProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	isEditing: boolean;
	roleOptions: { value: string; label: string }[];
	specializationOptions: { value: string; label: string }[];
	avatarFile: File | null;
	currentAvatarUrl?: string | null;
	disabled?: boolean;
	onAvatarChange: (file: File | null) => void;
}

export function EmployeeFormFields({ control, isEditing, roleOptions, specializationOptions, avatarFile, currentAvatarUrl, disabled, onAvatarChange }: EmployeeFormFieldsProps) {
	const employeeName = useWatch({ control, name: "name" });

	return (
		<div className="space-y-5">
			<EmployeeAvatarField
				currentAvatarUrl={currentAvatarUrl}
				employeeName={employeeName}
				selectedFile={avatarFile}
				disabled={disabled}
				onChange={onAvatarChange}
			/>

			<div className="grid gap-4 md:grid-cols-2">
				<FormInput
					control={control}
					name="name"
					label="Name"
					placeholder="John Doe"
				/>
				<FormInput
					control={control}
					name="email"
					label="Email"
					type="email"
					placeholder="john@example.com"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FormInput
					control={control}
					name="password"
					label={isEditing ? "New Password (optional)" : "Password"}
					type="password"
					placeholder="••••••••"
				/>
				<FormSelect
					control={control}
					name="role"
					label="Role"
					placeholder="Select a role"
					options={roleOptions}
				/>
			</div>

			<FormSelect
				control={control}
				name="specialization"
				label="Specialization"
				placeholder="Select specialization..."
				options={specializationOptions}
				description="Determines which tasks the employee can see and work on"
			/>

			<p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Salary, hourly rate, and working hours are managed in the employee’s employment contract.</p>

			<FormSwitch
				control={control}
				name="isActive"
				label="Active"
				description="Employee can access the system"
			/>
		</div>
	);
}
