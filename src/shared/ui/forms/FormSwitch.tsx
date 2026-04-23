"use client";

import { FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/shared/ui/form";
import { Switch } from "@/shared/ui/switch";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/shared/lib/utils";

interface FormSwitchProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label: string;
	description?: string;
	disabled?: boolean;
	className?: string;
}

export function FormSwitch<T extends FieldValues>({ control, name, label, description, disabled = false, className }: FormSwitchProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("flex items-center justify-between rounded-lg border p-3", className)}>
					<div className="space-y-0.5">
						<FormLabel>{label}</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
					</div>
					<FormControl>
						<Switch
							checked={field.value}
							onCheckedChange={field.onChange}
							disabled={disabled}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
}
