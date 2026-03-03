"use client";

import { Calendar, Clock, MoreVertical, Play, Pause, Trash2 } from "lucide-react";
import { RecurringTaskConfig, FREQUENCY_LABELS } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RecurringTaskCardProps {
	config: RecurringTaskConfig;
	onEdit?: (config: RecurringTaskConfig) => void;
	onDelete?: (config: RecurringTaskConfig) => void;
	onToggleActive?: (config: RecurringTaskConfig) => void;
	onGenerateNow?: (config: RecurringTaskConfig) => void;
}

export function RecurringTaskCard({ config, onEdit, onDelete, onToggleActive, onGenerateNow }: RecurringTaskCardProps) {
	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM dd, yyyy");
		} catch {
			return dateString;
		}
	};

	const getFrequencyDisplay = () => {
		const label = FREQUENCY_LABELS[config.frequency];
		if (config.interval > 1) {
			return `Every ${config.interval} ${label.toLowerCase()}`;
		}
		return label;
	};

	const getDaysOfWeekDisplay = () => {
		if (!config.daysOfWeek || config.daysOfWeek.length === 0) return null;
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return config.daysOfWeek.map((day) => days[day]).join(", ");
	};

	return (
		<Card className={cn("transition-all hover:shadow-md", !config.isActive && "opacity-60 bg-muted/50")}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="font-semibold truncate">{config.templateTask?.title || `Task #${config.templateTaskId}`}</h3>
							<Badge variant={config.isActive ? "default" : "secondary"}>{config.isActive ? "Active" : "Inactive"}</Badge>
						</div>
						<p className="text-sm text-muted-foreground">{getFrequencyDisplay()}</p>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{onEdit && <DropdownMenuItem onClick={() => onEdit(config)}>Edit Configuration</DropdownMenuItem>}
							{onToggleActive && (
								<DropdownMenuItem onClick={() => onToggleActive(config)}>
									{config.isActive ? (
										<>
											<Pause className="mr-2 h-4 w-4" />
											Pause
										</>
									) : (
										<>
											<Play className="mr-2 h-4 w-4" />
											Activate
										</>
									)}
								</DropdownMenuItem>
							)}
							{onGenerateNow && config.isActive && (
								<DropdownMenuItem onClick={() => onGenerateNow(config)}>
									<Play className="mr-2 h-4 w-4" />
									Generate Now
								</DropdownMenuItem>
							)}
							{onDelete && (
								<DropdownMenuItem
									onClick={() => onDelete(config)}
									className="text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Frequency Details */}
				{config.frequency === "weekly" && getDaysOfWeekDisplay() && (
					<div className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">On:</span>
						<span className="font-medium">{getDaysOfWeekDisplay()}</span>
					</div>
				)}

				{config.dayOfMonth && (
					<div className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">Day:</span>
						<span className="font-medium">{config.dayOfMonth}</span>
					</div>
				)}

				{/* Date Range */}
				<div className="flex items-center gap-2 text-sm">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="text-muted-foreground">From:</span>
					<span className="font-medium">{formatDate(config.startDate)}</span>
					{config.endDate && (
						<>
							<span className="text-muted-foreground">to</span>
							<span className="font-medium">{formatDate(config.endDate)}</span>
						</>
					)}
				</div>

				{/* Next Occurrence */}
				{config.nextOccurrenceDate && config.isActive && (
					<div className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4 text-primary" />
						<span className="text-muted-foreground">Next:</span>
						<span className="font-medium text-primary">{formatDate(config.nextOccurrenceDate)}</span>
					</div>
				)}

				{/* Statistics */}
				<div className="flex items-center gap-4 pt-2 border-t">
					<div className="text-sm">
						<span className="text-muted-foreground">Generated: </span>
						<span className="font-semibold">{config.occurrenceCount}</span>
					</div>
					{config.maxOccurrences && (
						<div className="text-sm">
							<span className="text-muted-foreground">Max: </span>
							<span className="font-semibold">{config.maxOccurrences}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
