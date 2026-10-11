"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormTimePickerProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	minuteStep?: 1 | 5 | 10 | 15 | 30;
}

function splitTime(value: unknown): { hour: string; minute: string } {
	if (typeof value !== "string") return { hour: "", minute: "" };
	const match = value.match(/^(\d{1,2}):(\d{2})/);
	if (!match) return { hour: "", minute: "" };
	return { hour: match[1].padStart(2, "0"), minute: match[2] };
}

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));

export function FormTimePicker<T extends FieldValues>({ control, name, label, description, disabled = false, className, minuteStep = 1 }: FormTimePickerProps<T>) {
	const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, index) => String(index * minuteStep).padStart(2, "0"));

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const { hour, minute } = splitTime(field.value);
				const setPart = (part: "hour" | "minute", partValue: string) => {
					const nextHour = part === "hour" ? partValue : hour || "00";
					const nextMinute = part === "minute" ? partValue : minute || "00";
					field.onChange(`${nextHour}:${nextMinute}`);
				};

				return (
					<FormItem className={className}>
						{label && <FormLabel>{label}</FormLabel>}
						<div className="flex items-center gap-2">
							<Select value={hour} onValueChange={(value) => setPart("hour", value)} disabled={disabled}>
								<FormControl>
									<SelectTrigger aria-label={`${label ?? "Time"} hours`}>
										<SelectValue placeholder="HH" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{hours.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<span className="text-muted-foreground">:</span>
							<Select value={minute} onValueChange={(value) => setPart("minute", value)} disabled={disabled}>
								<FormControl>
									<SelectTrigger aria-label={`${label ?? "Time"} minutes`}>
										<SelectValue placeholder="MM" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{minutes.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
