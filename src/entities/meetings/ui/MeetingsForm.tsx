"use client";

/**
 * MeetingsForm — Polymorphic meeting scheduling form.
 *
 * Accepts `modelType` and `modelId` so it can be embedded in any detail page.
 * Renders as a collapsible card with a "+ Schedule Meeting" trigger.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, ChevronDown, ChevronUp, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { useCreateMeeting } from "../api/meetings.api";
import { createMeetingSchema, type CreateMeetingFormData } from "../model/meeting.schema";
import { MEETING_TYPES, MEETING_TYPE_LABELS, LOCATION_TYPES, LOCATION_TYPE_LABELS, MODEL_TYPE_TO_MORPH, type MeetingModelType } from "../model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface MeetingsFormProps {
	/** The type of the parent model (lead | client | project) */
	modelType: MeetingModelType;
	/** The ID of the parent model */
	modelId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MeetingsForm({ modelType, modelId }: MeetingsFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync, isPending } = useCreateMeeting(modelType, modelId);

	const form = useForm<CreateMeetingFormData>({
		resolver: zodResolver(createMeetingSchema),
		defaultValues: {
			meetingType: "discovery",
			title: "",
			date: "",
			time: "10:00",
			locationType: "online",
			locationDetails: "",
			internalAttendees: [],
			externalAttendees: [],
			description: "",
		},
	});

	const locationType = form.watch("locationType");
	const isOnline = locationType === "online";

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString();

			await mutateAsync({
				model_type: MODEL_TYPE_TO_MORPH[modelType],
				model_id: modelId,
				meeting_type: data.meetingType,
				title: data.title,
				description: data.description,
				scheduled_at: scheduledAt,
				location_type: data.locationType,
				location_details: data.locationDetails,
				// For now, internalAttendees are stored as strings (user IDs or emails)
				// Cast to numbers where possible; the backend should handle both.
				internal_attendees: data.internalAttendees.map(Number).filter((n) => !isNaN(n)),
				external_attendees: data.externalAttendees,
			});

			toast.success("Meeting scheduled successfully.");
			form.reset();
			setIsOpen(false);
		} catch {
			toast.error("Failed to schedule meeting.");
		}
	});

	return (
		<div className="rounded-xl border bg-card overflow-hidden">
			{/* Toggle header */}
			<button
				type="button"
				onClick={() => setIsOpen((v) => !v)}
				className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
			>
				<span className="flex items-center gap-2">
					<PlusIcon className="size-4 text-primary" />
					Schedule a Meeting
				</span>
				{isOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
			</button>

			{/* Form body */}
			{isOpen && (
				<div className="border-t px-4 py-4">
					<Form {...form}>
						<form
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							{/* Title + Type */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="e.g. Discovery Call"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="meetingType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Meeting Type</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{MEETING_TYPES.map((t) => (
														<SelectItem
															key={t}
															value={t}
														>
															{MEETING_TYPE_LABELS[t]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Date + Time */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Date</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="date"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="time"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Time</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="time"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Location */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="locationType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location Type</FormLabel>
											<Select
												value={field.value}
												onValueChange={(v) => {
													field.onChange(v);
													form.setValue("locationDetails", "");
												}}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select location" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{LOCATION_TYPES.map((t) => (
														<SelectItem
															key={t}
															value={t}
														>
															{LOCATION_TYPE_LABELS[t]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="locationDetails"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{isOnline ? "Meeting Link" : "Location Details"}</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														type={isOnline ? "url" : "text"}
														placeholder={isOnline ? "https://meet.google.com/…" : "Address, room, or notes"}
														className={cn(isOnline && "pr-9")}
													/>
													{isOnline && <Video className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Description */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description (optional)</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="Agenda, context, or notes for this meeting…"
												rows={2}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Actions */}
							<div className="flex justify-end gap-2 pt-1">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										form.reset();
										setIsOpen(false);
									}}
									disabled={isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isPending}
								>
									{isPending ? "Scheduling…" : "Schedule Meeting"}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			)}
		</div>
	);
}
