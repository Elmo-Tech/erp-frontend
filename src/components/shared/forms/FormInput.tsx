"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormInputProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	description?: string;
	type?: "text" | "email" | "password" | "number" | "tel" | "url";
	disabled?: boolean;
	className?: string;
	inputClassName?: string;
	min?: number;
	max?: number;
	step?: number | string;
}

export function FormInput<T extends FieldValues>({ control, name, label, placeholder, description, type = "text", disabled = false, className, inputClassName, min, max, step }: FormInputProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>
						<Input
							type={type}
							placeholder={placeholder}
							disabled={disabled}
							min={min}
							max={max}
							step={step}
							className={cn(inputClassName)}
							{...field}
							value={field.value ?? ""}
							onChange={(e) => {
								if (type === "number") {
									const val = e.target.value;
									field.onChange(val === "" ? "" : Number(val));
								} else {
									field.onChange(e.target.value);
								}
							}}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
