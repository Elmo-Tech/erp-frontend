"use client";

import { Control, useWatch } from "react-hook-form";
import { FormInput, FormSelect, FormSwitch } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateHourlyRate, calculateMonthlyWorkHours } from "../../../lib/salary-rate";
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
	const salary = useWatch({ control, name: "salary" });
	const employeeName = useWatch({ control, name: "name" });
	const workHoursPerDay = Number(useWatch({ control, name: "workHoursPerDay" }) || 0);
	const monthlyWorkHours = calculateMonthlyWorkHours(workHoursPerDay);
	const hourlyRate = calculateHourlyRate(salary === "" ? null : Number(salary), workHoursPerDay);

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

			<div className="grid gap-4 md:grid-cols-3">
				<FormInput
					control={control}
					name="salary"
					label="Monthly Salary"
					type="number"
					min={0}
					step={100}
				/>
				<div className="space-y-2">
					<Label htmlFor="monthly-work-hours">Monthly Work Hours</Label>
					<Input
						id="monthly-work-hours"
						value={monthlyWorkHours.toFixed(2)}
						readOnly
						aria-readonly="true"
						className="bg-muted"
					/>
					<p className="text-xs text-muted-foreground">5 working days/week × average weeks/month</p>
				</div>
				<FormInput
					control={control}
					name="hourlyRate"
					label="Hourly Rate (manual)"
					type="number"
					min={0}
					step={0.25}
					description={hourlyRate ? `Auto fallback ${hourlyRate.toFixed(2)} — leave empty to use it` : "Used for overtime pay"}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<FormInput
					control={control}
					name="workHoursPerDay"
					label="Work Hours/Day"
					type="number"
					min={1}
					max={24}
				/>
				<FormInput
					control={control}
					name="workStartTime"
					label="Start Time"
					type="time"
				/>
				<FormInput
					control={control}
					name="graceDaysAllowed"
					label="Grace Days/Month"
					type="number"
					min={0}
					max={31}
				/>
			</div>

			<FormSwitch
				control={control}
				name="isActive"
				label="Active"
				description="Employee can access the system"
			/>
		</div>
	);
}
