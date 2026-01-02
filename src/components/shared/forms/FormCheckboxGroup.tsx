"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface CheckboxOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface FormCheckboxGroupProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	description?: string;
	options: CheckboxOption[];
	disabled?: boolean;
	className?: string;
	columns?: 1 | 2 | 3 | 4;
}

export function FormCheckboxGroup<T extends FieldValues>({ control, name, label, description, options, disabled = false, className, columns = 1 }: FormCheckboxGroupProps<T>) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-2",
		3: "grid-cols-3",
		4: "grid-cols-4",
	};

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const values: string[] = field.value || [];

				const handleToggle = (optionValue: string, checked: boolean) => {
					if (checked) {
						field.onChange([...values, optionValue]);
					} else {
						field.onChange(values.filter((v) => v !== optionValue));
					}
				};

				return (
					<FormItem className={className}>
						{label && <FormLabel>{label}</FormLabel>}
						<FormControl>
							<div className={cn("grid gap-2 border rounded-md p-3", gridCols[columns])}>
								{options.map((option) => (
									<div
										key={option.value}
										className="flex items-center gap-2"
									>
										<Checkbox
											id={`${name}-${option.value}`}
											checked={values.includes(option.value)}
											onCheckedChange={(checked) => handleToggle(option.value, checked as boolean)}
											disabled={disabled || option.disabled}
										/>
										<label
											htmlFor={`${name}-${option.value}`}
											className="text-sm cursor-pointer"
										>
											{option.label}
										</label>
									</div>
								))}
								{options.length === 0 && <p className="text-sm text-muted-foreground">No options available</p>}
							</div>
						</FormControl>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
