"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/textarea";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/shared/lib/utils";

interface FormTextareaProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	textareaClassName?: string;
	rows?: number;
}

export function FormTextarea<T extends FieldValues>({ control, name, label, placeholder, description, disabled = false, className, textareaClassName, rows = 3 }: FormTextareaProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>
						<Textarea
							placeholder={placeholder}
							disabled={disabled}
							rows={rows}
							className={cn(textareaClassName)}
							{...field}
							value={field.value ?? ""}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
