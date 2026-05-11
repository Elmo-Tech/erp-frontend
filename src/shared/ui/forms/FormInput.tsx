"use client";

import type { ReactNode } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/shared/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

interface FormInputProps<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> {
	control: Control<TFieldValues, unknown, TTransformedValues>;
	name: FieldPath<TFieldValues>;
	label?: string;
	placeholder?: string;
	description?: string;
	type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "time";
	disabled?: boolean;
	readOnly?: boolean;
	autoComplete?: string;
	className?: string;
	inputClassName?: string;
	endAdornment?: ReactNode;
	min?: number;
	max?: number;
	step?: number | string;
	minDate?: Date;
	maxDate?: Date;
	/** Optional extra onChange handler called AFTER RHF field.onChange */
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormInput<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({
	control,
	name,
	label,
	placeholder,
	description,
	type = "text",
	disabled = false,
	readOnly = false,
	autoComplete,
	className,
	inputClassName,
	endAdornment,
	min,
	max,
	step,
	minDate,
	maxDate,
	onChange: onChangeProp,
}: FormInputProps<TFieldValues, TTransformedValues>) {
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
					<div className={cn("relative", endAdornment && "flex items-center")}>
						<FormControl>
							<Input
								type={type}
								placeholder={placeholder}
								disabled={disabled}
								readOnly={readOnly}
								autoComplete={autoComplete}
								min={min}
								max={max}
								step={step}
								className={cn(endAdornment && "pr-10", inputClassName)}
								{...field}
								value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
								onChange={(e) => {
									if (type === "number") {
										const val = e.target.value;
										field.onChange(val === "" ? "" : Number(val));
									} else {
										field.onChange(e.target.value);
									}
									onChangeProp?.(e);
								}}
							/>
						</FormControl>
						{endAdornment ? <div className="absolute right-1 top-1/2 -translate-y-1/2">{endAdornment}</div> : null}
					</div>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
