"use client";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { cn } from "@/shared/lib/utils";

export interface FormTagOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface FormTagSelectorProps<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> {
	control: Control<TFieldValues, unknown, TTransformedValues>;
	name: FieldPath<TFieldValues>;
	options: FormTagOption[];
	label?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	listClassName?: string;
}

export function FormTagSelector<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({ control, name, options, label, description, disabled = false, className, listClassName }: FormTagSelectorProps<TFieldValues, TTransformedValues>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const selectedValues = Array.isArray(field.value) ? field.value.map(String) : [];

				return (
					<FormItem className={className}>
						{label && <FormLabel>{label}</FormLabel>}
						<FormControl>
							<ToggleGroup
								type="multiple"
								value={selectedValues}
								onValueChange={field.onChange}
								disabled={disabled}
								variant="outline"
								spacing={2}
								className={cn("flex w-full flex-wrap justify-start gap-2", listClassName)}
							>
								{options.map((option) => (
									<ToggleGroupItem
										key={option.value}
										value={option.value}
										disabled={option.disabled}
										className="h-8 rounded-full border px-3 text-xs font-medium data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
									>
										{option.label}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</FormControl>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
