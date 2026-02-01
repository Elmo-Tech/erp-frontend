"use client";

import { Control } from "react-hook-form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormSwitch } from "@/components/shared/forms/FormSwitch";
import { FormCheckboxGroup } from "@/components/shared/forms/FormCheckboxGroup";
import { TagInput } from "@/components/shared/forms/TagInput";
import { usePermissions } from "../../../hooks/usePermissions";

interface UserFormFieldsProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	isEditing: boolean;
	roleOptions: { value: string; label: string }[];
	specializationOptions: { value: string; label: string }[];
}

export function UserFormFields({ control, isEditing, roleOptions, specializationOptions }: UserFormFieldsProps) {
	const { canViewInternalCosts, canManageInternalCosts } = usePermissions();

	// Only show internal cost field if user has permission to view/manage internal costs
	const showInternalCostField = canViewInternalCosts || canManageInternalCosts;
	const canEditInternalCost = canManageInternalCosts;

	return (
		<div className="space-y-4">
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

			<FormInput
				control={control}
				name="password"
				label={isEditing ? "New Password (leave empty to keep current)" : "Password"}
				type="password"
				placeholder="••••••••"
			/>

			<FormInput
				control={control}
				name="password_confirmation"
				label="Confirm Password"
				type="password"
				placeholder="••••••••"
			/>

			<TagInput
				control={control}
				name="skills"
				label="Skills"
				placeholder="Type a skill and press Enter"
			/>

			<FormSelect
				control={control}
				name="specialization"
				label="Specialization"
				placeholder="Select specialization..."
				options={specializationOptions}
				description="Determines which tasks the user can see and work on"
			/>

			{/* Internal Hourly Cost Field - Only visible to users with proper permissions */}
			{showInternalCostField && (
				<FormInput
					control={control}
					name="internalHourlyCost"
					label="Internal Hourly Cost"
					type="number"
					step="0.01"
					min={0}
					placeholder="0.00"
					description="Internal cost per hour for profitability calculations (confidential)"
					disabled={!canEditInternalCost}
				/>
			)}

			<FormCheckboxGroup
				control={control}
				name="roles"
				label="Roles"
				options={roleOptions}
				columns={2}
			/>

			<FormSwitch
				control={control}
				name="isActive"
				label="Active Status"
				description="Inactive users cannot log in"
			/>
		</div>
	);
}
