"use client";

import { Control, useWatch } from "react-hook-form";
import { FormInput, FormSelect, FormSwitch } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateHourlyRate, calculateMonthlyWorkHours } from "../../../lib/salary-rate";

interface EmployeeFormFieldsProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	isEditing: boolean;
	roleOptions: { value: string; label: string }[];
	specializationOptions: { value: string; label: string }[];
}

export function EmployeeFormFields({ control, isEditing, roleOptions, specializationOptions }: EmployeeFormFieldsProps) {
	const salary = useWatch({ control, name: "salary" });
	const workHoursPerDay = Number(useWatch({ control, name: "workHoursPerDay" }) || 0);
	const monthlyWorkHours = calculateMonthlyWorkHours(workHoursPerDay);
	const hourlyRate = calculateHourlyRate(salary === "" ? null : Number(salary), workHoursPerDay);

	return (
		<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
				<div className="space-y-2">
					<Label htmlFor="calculated-hourly-rate">Hourly Rate</Label>
					<Input
						id="calculated-hourly-rate"
						value={hourlyRate?.toFixed(2) ?? ""}
						placeholder="Calculated from salary"
						readOnly
						aria-readonly="true"
						className="bg-muted"
					/>
				</div>
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
