"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface FormSelectProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	description?: string;
	options: SelectOption[];
	disabled?: boolean;
	className?: string;
	onValueChange?: (value: string) => void;
}

export function FormSelect<T extends FieldValues>({ control, name, label, placeholder = "Select an option", description, options, disabled = false, className, onValueChange }: FormSelectProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					{label && <FormLabel>{label}</FormLabel>}
					<Select
						value={field.value?.toString() ?? ""}
						onValueChange={(value) => {
							field.onChange(value);
							onValueChange?.(value);
						}}
						disabled={disabled}
					>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{options.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									disabled={option.disabled}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
