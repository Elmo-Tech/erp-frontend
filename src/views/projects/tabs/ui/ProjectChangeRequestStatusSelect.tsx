"use client";

import type { ChangeRequestStatusValue } from "@/features/projects/api/execution.api";

interface ProjectChangeRequestStatusSelectProps {
	currentStatus: ChangeRequestStatusValue;
	options: { value: ChangeRequestStatusValue; label: string }[];
	disabled?: boolean;
	onChange: (value: ChangeRequestStatusValue) => void;
}

export function ProjectChangeRequestStatusSelect({ currentStatus, options, disabled, onChange }: ProjectChangeRequestStatusSelectProps) {
	return (
		<select
			value={currentStatus}
			onChange={(event) => onChange(event.target.value as ChangeRequestStatusValue)}
			disabled={disabled}
			className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="Update status"
		>
			{options.map((option) => (
				<option
					key={option.value}
					value={option.value}
				>
					{option.label}
				</option>
			))}
		</select>
	);
}
