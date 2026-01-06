"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/shared";
import { Task } from "@/features/dashboard/types/task";
import { TimeEntry } from "@/features/sales/types/timeEntry";
import { useTimeEntriesByTrackable, useUpdateTimeEntry } from "@/features/sales/hooks/useTimeEntries";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Clock, Pencil, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const editTimeEntrySchema = z.object({
	hours: z.number().min(0, "Hours must be 0 or greater"),
	minutes: z.number().min(0).max(59, "Minutes must be 0-59"),
	seconds: z.number().min(0).max(59, "Seconds must be 0-59"),
});

type EditTimeEntryFormData = z.infer<typeof editTimeEntrySchema>;

interface TaskTimeEntriesSectionProps {
	task: Task;
}

export function TaskTimeEntriesSection({ task }: TaskTimeEntriesSectionProps) {
	const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
	const { data: timeEntriesData, isLoading } = useTimeEntriesByTrackable("task", task.taskId);
	const updateTimeEntry = useUpdateTimeEntry();
	const { canEditTimeEntries } = usePermissions();

	const form = useForm<EditTimeEntryFormData>({
		resolver: zodResolver(editTimeEntrySchema),
		defaultValues: {
			hours: 0,
			minutes: 0,
			seconds: 0,
		},
	});

	const handleEdit = (entry: TimeEntry) => {
		setEditingEntry(entry);
		// For active timers, calculate duration from start time to now
		let totalMinutes = entry.durationMinutes || 0;
		if (!entry.endTime && entry.startTime) {
			const start = new Date(entry.startTime);
			const now = new Date();
			totalMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
		}
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		form.reset({
			hours,
			minutes,
			seconds: 0,
		});
	};

	const handleSubmit = async (data: EditTimeEntryFormData) => {
		if (!editingEntry) return;

		const totalMinutes = data.hours * 60 + data.minutes + Math.floor(data.seconds / 60);

		try {
			await updateTimeEntry.mutateAsync({
				id: editingEntry.timeEntryId,
				payload: {
					durationMinutes: totalMinutes,
				},
			});
			toast.success("Time entry updated successfully");
			setEditingEntry(null);
			form.reset();
		} catch {
			toast.error("Failed to update time entry");
		}
	};

	const formatDuration = (minutes?: number) => {
		if (!minutes) return "In progress";
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours === 0) return `${mins}m`;
		return `${hours}h ${mins}m`;
	};

	const timeEntries = timeEntriesData?.timeEntries || [];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">Time Entries</h4>
				<Badge variant="outline">{timeEntries.length} entries</Badge>
			</div>

			{timeEntries.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p className="text-sm">No time entries recorded yet</p>
				</div>
			) : (
				<div className="space-y-2">
					{timeEntries.map((entry) => (
						<div
							key={entry.timeEntryId}
							className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
						>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full bg-muted">
									<Clock className="h-4 w-4 text-muted-foreground" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">{format(new Date(entry.startTime), "MMM d, yyyy")}</span>
										{!entry.endTime && (
											<Badge
												variant="default"
												className="text-xs bg-green-600"
											>
												Active
											</Badge>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span>
											{format(new Date(entry.startTime), "HH:mm")}
											{entry.endTime && ` - ${format(new Date(entry.endTime), "HH:mm")}`}
										</span>
										<span>•</span>
										<span>{formatDuration(entry.durationMinutes)}</span>
										{entry.user && (
											<>
												<span>•</span>
												<span className="flex items-center gap-1">
													<User className="h-3 w-3" />
													{entry.user.name}
												</span>
											</>
										)}
									</div>
								</div>
							</div>
							{canEditTimeEntries && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(entry)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}
				</div>
			)}

			{/* Edit Time Entry Dialog */}
			<FormDialog
				open={!!editingEntry}
				onOpenChange={(open) => {
					if (!open) {
						setEditingEntry(null);
						form.reset();
					}
				}}
				title="Edit Time Entry"
				submitLabel="Save Changes"
				onSubmit={form.handleSubmit(handleSubmit)}
				isLoading={updateTimeEntry.isPending}
			>
				<Form {...form}>
					<div className="space-y-4 py-4">
						<p className="text-sm text-muted-foreground">Adjust the duration for this time entry</p>
						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="hours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hours</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="minutes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Minutes</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												max={59}
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="seconds"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Seconds</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												max={59}
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</Form>
			</FormDialog>
		</div>
	);
}
