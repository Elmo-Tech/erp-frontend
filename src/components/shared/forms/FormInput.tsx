"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

interface FormInputProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	description?: string;
	type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "time";
	disabled?: boolean;
	className?: string;
	inputClassName?: string;
	min?: number;
	max?: number;
	step?: number | string;
	minDate?: Date;
	maxDate?: Date;
}

export function FormInput<T extends FieldValues>({ control, name, label, placeholder, description, type = "text", disabled = false, className, inputClassName, min, max, step, minDate, maxDate }: FormInputProps<T>) {
	// Use Calendar for date type
	if (type === "date") {
		return (
			<FormField
				control={control}
				name={name}
				render={({ field }) => {
					const selectedDate = field.value ? parseISO(field.value) : undefined;

					return (
						<FormItem className={cn("flex flex-col", className)}>
							{label && <FormLabel>{label}</FormLabel>}
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											disabled={disabled}
											className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground", inputClassName)}
										>
											{selectedDate ? format(selectedDate, "PPP") : <span>{placeholder || "Pick a date"}</span>}
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
										selected={selectedDate}
										onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
										disabled={(date) => {
											if (minDate && date < minDate) return true;
											if (maxDate && date > maxDate) return true;
											return false;
										}}
									/>
								</PopoverContent>
							</Popover>
							{description && <FormDescription>{description}</FormDescription>}
							<FormMessage />
						</FormItem>
					);
				}}
			/>
		);
	}

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
