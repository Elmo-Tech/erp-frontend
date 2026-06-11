"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, MapPin, MessageSquare, Users } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import type { AggregatedCalendarItem, MeetingMeta } from "@/entities/calendar/model/types";

interface MeetingSheetProps {
	item: AggregatedCalendarItem | null;
	onOpenChange: (open: boolean) => void;
}

function titleCase(value: string | null | undefined) {
	if (!value) return "—";
	return value
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function formatTime(iso: string | null | undefined) {
	if (!iso) return "—";
	return format(new Date(iso), "hh:mm a");
}

function meetingRoute(meta: MeetingMeta): { href: string; label: string } | null {
	if (meta.projectId) return { href: `/dashboard/projects/${meta.projectId}`, label: "Open Project" };
	if (meta.clientId) return { href: `/dashboard/clients/${meta.clientId}/overview`, label: "Open Client" };
	if (meta.leadId) return { href: `/dashboard/leads/${meta.leadId}`, label: "Open Lead" };
	return null;
}

export function MeetingSheet({ item, onOpenChange }: MeetingSheetProps) {
	const router = useRouter();

	if (!item) return null;

	const meta = item.meta as MeetingMeta;
	const route = meetingRoute(meta);
	const notes = meta.notes ?? meta.description;
	const attendeeCount = (meta.internalAttendees?.length ?? 0) + (meta.externalAttendees?.length ?? 0);
	const isOnlineLink = meta.location === "online" && Boolean(meta.locationDetails);

	return (
		<Sheet
			open={Boolean(item)}
			onOpenChange={onOpenChange}
		>
			<SheetContent className="overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Clock className="size-4 text-blue-600" />
						{item.title}
					</SheetTitle>
					<SheetDescription>{[meta.subjectName, titleCase(meta.meetingType)].filter(Boolean).join(" / ") || "Meeting details"}</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-4 text-sm">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Date</div>
							<div className="mt-1 font-medium">{format(new Date(`${item.date}T00:00:00`), "MMM d, yyyy")}</div>
						</div>
						<div className="rounded-md border p-4">
							<div className="text-xs font-medium uppercase text-muted-foreground">Time</div>
							<div className="mt-1 font-medium tabular-nums">{formatTime(item.startTime)}</div>
						</div>
					</div>

					<div className="rounded-md border p-4">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant="outline"
								className="border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
							>
								{titleCase(meta.meetingType)}
							</Badge>
							{item.status ? <Badge variant="outline">{titleCase(item.status)}</Badge> : null}
							<Badge
								variant="secondary"
								className="gap-1"
							>
								<Users className="size-3" />
								{attendeeCount}
							</Badge>
						</div>
					</div>

					<div className="rounded-md border p-4">
						<div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
							<MapPin className="size-3" />
							Location
						</div>
						<div className="mt-2 break-words font-medium">
							{isOnlineLink ? (
								<a
									href={meta.locationDetails ?? undefined}
									target="_blank"
									rel="noreferrer"
									className="text-primary underline-offset-4 hover:underline"
								>
									{meta.locationDetails}
								</a>
							) : (
								meta.locationDetails || titleCase(meta.location)
							)}
						</div>
					</div>

					{notes ? (
						<div className="rounded-md border p-4">
							<div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
								<MessageSquare className="size-3" />
								Notes
							</div>
							<p className="mt-2 whitespace-pre-wrap leading-6">{notes}</p>
						</div>
					) : null}

					{route ? (
						<Button
							type="button"
							className="w-full gap-2"
							onClick={() => router.push(route.href)}
						>
							<ExternalLink className="size-4" />
							{route.label}
						</Button>
					) : null}
				</div>
			</SheetContent>
		</Sheet>
	);
}
