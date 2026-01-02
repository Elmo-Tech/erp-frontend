"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface FilterOption {
	value: string;
	label: string;
}

interface FilterSelectProps {
	value?: string;
	onChange: (value: string | undefined) => void;
	options: FilterOption[];
	placeholder?: string;
	allLabel?: string;
	icon?: LucideIcon;
	className?: string;
	disabled?: boolean;
}

export function FilterSelect({ value, onChange, options, placeholder = "Filter", allLabel = "All", icon: Icon, className, disabled = false }: FilterSelectProps) {
	const handleChange = (newValue: string) => {
		onChange(newValue === "all" ? undefined : newValue);
	};

	return (
		<Select
			value={value || "all"}
			onValueChange={handleChange}
			disabled={disabled}
		>
			<SelectTrigger className={cn("w-40", className)}>
				{Icon && <Icon className="h-4 w-4 mr-2" />}
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">{allLabel}</SelectItem>
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
