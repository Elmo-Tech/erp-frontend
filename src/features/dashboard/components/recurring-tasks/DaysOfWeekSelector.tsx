"use client";

import { DAYS_OF_WEEK } from "../../types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DaysOfWeekSelectorProps {
	selectedDays: number[];
	onChange: (days: number[]) => void;
}

export function DaysOfWeekSelector({ selectedDays, onChange }: DaysOfWeekSelectorProps) {
	const toggleDay = (day: number) => {
		if (selectedDays.includes(day)) {
			onChange(selectedDays.filter((d) => d !== day));
		} else {
			onChange([...selectedDays, day].sort());
		}
	};

	const selectAll = () => {
		onChange([0, 1, 2, 3, 4, 5, 6]);
	};

	const selectWeekdays = () => {
		onChange([1, 2, 3, 4, 5]);
	};

	const selectWeekend = () => {
		onChange([0, 6]);
	};

	const clearAll = () => {
		onChange([]);
	};

	return (
		<div className="space-y-3">
			<Label>Days of Week</Label>

			{/* Quick Select Buttons */}
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={selectWeekdays}
				>
					Weekdays
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={selectWeekend}
				>
					Weekend
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={selectAll}
				>
					All Days
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={clearAll}
				>
					Clear
				</Button>
			</div>

			{/* Day Buttons */}
			<div className="grid grid-cols-7 gap-2">
				{DAYS_OF_WEEK.map((day) => {
					const isSelected = selectedDays.includes(day.value);
					return (
						<Button
							key={day.value}
							type="button"
							variant={isSelected ? "default" : "outline"}
							size="sm"
							onClick={() => toggleDay(day.value)}
							className={cn("h-12 flex flex-col items-center justify-center", isSelected && "ring-2 ring-primary ring-offset-2")}
						>
							<span className="text-xs font-medium">{day.label.substring(0, 3)}</span>
						</Button>
					);
				})}
			</div>

			{/* Selected Days Display */}
			{selectedDays.length > 0 && <p className="text-sm text-muted-foreground">Selected: {selectedDays.map((d) => DAYS_OF_WEEK[d].label).join(", ")}</p>}

			{selectedDays.length === 0 && <p className="text-sm text-destructive">Please select at least one day</p>}
		</div>
	);
}
