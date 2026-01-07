"use client";

import { Control } from "react-hook-form";
import { FormInput, FormSelect, FormSwitch } from "@/components/shared";

interface EmployeeFormFieldsProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	isEditing: boolean;
	roleOptions: { value: string; label: string }[];
	specializationOptions: { value: string; label: string }[];
}

export function EmployeeFormFields({ control, isEditing, roleOptions, specializationOptions }: EmployeeFormFieldsProps) {
	return (
		<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
			<div className="grid grid-cols-2 gap-4">
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

			<div className="grid grid-cols-2 gap-4">
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

			<div className="grid grid-cols-2 gap-4">
				<FormInput
					control={control}
					name="salary"
					label="Monthly Salary"
					type="number"
					min={0}
					step={100}
				/>
				<FormInput
					control={control}
					name="internalHourlyCost"
					label="Internal Hourly Cost"
					type="number"
					min={0}
					step={1}
				/>
			</div>

			<div className="grid grid-cols-3 gap-4">
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
