"use client";

import { RecurringFrequency, FREQUENCY_LABELS, FREQUENCY_DESCRIPTIONS } from "../../types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FrequencySelectorProps {
	frequency: RecurringFrequency;
	interval: number;
	onFrequencyChange: (frequency: RecurringFrequency) => void;
	onIntervalChange: (interval: number) => void;
}

export function FrequencySelector({ frequency, interval, onFrequencyChange, onIntervalChange }: FrequencySelectorProps) {
	const showIntervalInput = !["biweekly", "quarterly"].includes(frequency);

	const getIntervalLabel = () => {
		switch (frequency) {
			case "daily":
				return "Days";
			case "weekly":
				return "Weeks";
			case "monthly":
				return "Months";
			case "yearly":
				return "Years";
			default:
				return "Interval";
		}
	};

	return (
		<div className="space-y-4">
			{/* Frequency Selection */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Label>Frequency</Label>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-4 w-4 text-muted-foreground cursor-help" />
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs">{FREQUENCY_DESCRIPTIONS[frequency]}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<Select
					value={frequency}
					onValueChange={(v) => onFrequencyChange(v as RecurringFrequency)}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="daily">
							<div>
								<div className="font-medium">{FREQUENCY_LABELS.daily}</div>
								<div className="text-xs text-muted-foreground">Every day or every X days</div>
							</div>
						</SelectItem>
						<SelectItem value="weekly">
							<div>
								<div className="font-medium">{FREQUENCY_LABELS.weekly}</div>
								<div className="text-xs text-muted-foreground">Specific days of the week</div>
							</div>
						</SelectItem>
						<SelectItem value="biweekly">
							<div>
								<div className="font-medium">{FREQUENCY_LABELS.biweekly}</div>
								<div className="text-xs text-muted-foreground">Every 2 weeks</div>
							</div>
						</SelectItem>
						<SelectItem value="monthly">
							<div>
								<div className="font-medium">{FREQUENCY_LABELS.monthly}</div>
								<div className="text-xs text-muted-foreground">Specific day each month</div>
							</div>
						</SelectItem>
						<SelectItem value="quarterly">
							<div>
								<div className="font-medium">{FREQUENCY_LABELS.quarterly}</div>
								<div className="text-xs text-muted-foreground">Every 3 months</div>
							</div>
						</SelectItem>
						<SelectItem value="yearly">
							<div>
								<div className="font-medium">{FREQUENCY_LABELS.yearly}</div>
								<div className="text-xs text-muted-foreground">Once per year</div>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Interval Input (conditional) */}
			{showIntervalInput && (
				<div className="space-y-2">
					<Label>Repeat Every</Label>
					<div className="flex items-center gap-2">
						<Input
							type="number"
							min="1"
							value={interval}
							onChange={(e) => onIntervalChange(parseInt(e.target.value) || 1)}
							className="w-24"
						/>
						<span className="text-sm text-muted-foreground">{getIntervalLabel()}</span>
					</div>
					<p className="text-xs text-muted-foreground">
						{interval === 1
							? `Task will be generated every ${frequency === "daily" ? "day" : frequency === "weekly" ? "week" : frequency === "monthly" ? "month" : "year"}`
							: `Task will be generated every ${interval} ${getIntervalLabel().toLowerCase()}`}
					</p>
				</div>
			)}
		</div>
	);
}
