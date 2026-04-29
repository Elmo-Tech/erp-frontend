"use client";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

interface FormFileInputProps<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> {
	control: Control<TFieldValues, unknown, TTransformedValues>;
	name: FieldPath<TFieldValues>;
	label?: string;
	description?: string;
	accept?: string;
	disabled?: boolean;
	className?: string;
	inputClassName?: string;
}

export function FormFileInput<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({ control, name, label, description, accept, disabled = false, className, inputClassName }: FormFileInputProps<TFieldValues, TTransformedValues>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					{label ? <FormLabel>{label}</FormLabel> : null}
					<FormControl>
						<Input
							name={field.name}
							ref={field.ref}
							onBlur={field.onBlur}
							type="file"
							accept={accept}
							disabled={disabled}
							className={inputClassName}
							onChange={(event) => field.onChange(event.target.files?.[0])}
						/>
					</FormControl>
					{description ? <FormDescription>{description}</FormDescription> : null}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
