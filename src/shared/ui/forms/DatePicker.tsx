"use client";

import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DatePickerProps {
	id?: string;
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	ariaLabel?: string;
	buttonType?: "button" | "submit" | "reset";
	dateFormat?: string;
	minDate?: Date;
	maxDate?: Date;
}

/**
 * Standalone DatePicker component for non-form usage
 * Uses Shadcn Calendar with Popover
 */
export function DatePicker({ id, value, onChange, placeholder = "Pick a date", disabled = false, className, ariaLabel, buttonType = "button", dateFormat = "PPP", minDate, maxDate }: DatePickerProps) {
	const selectedDate = value ? parseISO(value) : undefined;

	const handleSelect = (date: Date | undefined) => {
		if (date) {
			// Format as YYYY-MM-DD for consistency
			onChange(format(date, "yyyy-MM-dd"));
		} else {
			onChange("");
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type={buttonType}
					variant="outline"
					disabled={disabled}
					aria-label={ariaLabel}
					className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{selectedDate ? format(selectedDate, dateFormat) : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				align="start"
			>
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={handleSelect}
					disabled={(date) => {
						if (minDate && date < minDate) return true;
						if (maxDate && date > maxDate) return true;
						return false;
					}}
					className="rounded-md border shadow-sm"
					captionLayout="dropdown"
				/>
			</PopoverContent>
		</Popover>
	);
}
