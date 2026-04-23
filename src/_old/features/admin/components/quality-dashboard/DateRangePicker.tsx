/**
 * Date Range Picker Component for Quality Dashboard
 */

"use client";

import { Label } from "@/shared/ui/label";
import { DatePicker } from "@/shared/ui/forms/DatePicker";

interface DateRangePickerProps {
	dateFrom?: string;
	dateTo?: string;
	onDateFromChange: (date: string) => void;
	onDateToChange: (date: string) => void;
}

export function DateRangePicker({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateRangePickerProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-2">
			<div className="flex-1">
				<Label
					htmlFor="dateFrom"
					className="text-xs"
				>
					From
				</Label>
				<DatePicker
					value={dateFrom || ""}
					onChange={onDateFromChange}
					placeholder="Select date"
				/>
			</div>
			<div className="flex-1">
				<Label
					htmlFor="dateTo"
					className="text-xs"
				>
					To
				</Label>
				<DatePicker
					value={dateTo || ""}
					onChange={onDateToChange}
					placeholder="Select date"
				/>
			</div>
		</div>
	);
}
