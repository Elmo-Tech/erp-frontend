"use client";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Checkbox } from "@/shared/ui/checkbox";

interface FormCheckboxProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
	control: Control<TFieldValues>;
	name: TName;
	label: string;
	description?: string;
	disabled?: boolean;
}

export function FormCheckbox<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ control, name, label, description, disabled }: FormCheckboxProps<TFieldValues, TName>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex flex-row items-start space-x-3 space-y-0">
					<FormControl>
						<Checkbox
							checked={field.value}
							onCheckedChange={field.onChange}
							disabled={disabled}
						/>
					</FormControl>
					<div className="space-y-1 leading-none">
						<FormLabel className="cursor-pointer">{label}</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</div>
				</FormItem>
			)}
		/>
	);
}
