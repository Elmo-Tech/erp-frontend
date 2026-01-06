"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface FormDatePickerProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	dateFormat?: string;
	minDate?: Date;
	maxDate?: Date;
}

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDateLocal = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export function FormDatePicker<T extends FieldValues>({ control, name, label, placeholder = "Pick a date", description, disabled = false, className, dateFormat = "PPP", minDate, maxDate }: FormDatePickerProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("flex flex-col", className)}>
					{label && <FormLabel>{label}</FormLabel>}
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant="outline"
									disabled={disabled}
									className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
								>
									{field.value ? format(new Date(field.value), dateFormat) : <span>{placeholder}</span>}
									<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent
							className="w-auto p-0"
							align="start"
						>
							<Calendar
								mode="single"
								selected={field.value ? new Date(field.value) : undefined}
								onSelect={(date) => field.onChange(date ? formatDateLocal(date) : null)}
								disabled={(date) => {
									if (minDate && date < minDate) return true;
									if (maxDate && date > maxDate) return true;
									return false;
								}}
								className="rounded-md border shadow-sm"
								captionLayout="dropdown"
								autoFocus
							/>
						</PopoverContent>
					</Popover>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
