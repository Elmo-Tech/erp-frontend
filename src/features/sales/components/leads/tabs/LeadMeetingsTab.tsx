"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarPlus, Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { LeadMeeting, MeetingStatus } from "../../../types/lead";

interface LeadMeetingsTabProps {
	meetings: LeadMeeting[] | undefined;
	isLoading: boolean;
	onScheduleMeeting: () => void;
	onCompleteWithFeedback: (meeting: LeadMeeting) => void;
}

export function LeadMeetingsTab({ meetings, isLoading, onScheduleMeeting, onCompleteWithFeedback }: LeadMeetingsTabProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Meetings</CardTitle>
					<CardDescription>Scheduled meetings with this lead</CardDescription>
				</div>
				<Button onClick={onScheduleMeeting}>
					<CalendarPlus className="h-4 w-4 mr-2" />
					Schedule Meeting
				</Button>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<Skeleton
								key={i}
								className="h-20 w-full"
							/>
						))}
					</div>
				) : meetings && meetings.length > 0 ? (
					<div className="space-y-3">
						{meetings.map((meeting) => (
							<div
								key={meeting.meetingId}
								className="flex gap-4 p-4 border rounded-lg"
							>
								<div className="shrink-0">
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
										<Calendar className="h-5 w-5 text-primary" />
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<p className="font-medium">{meeting.title}</p>
										<div className="flex items-center gap-2">
											{meeting.status === MeetingStatus.SCHEDULED && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => onCompleteWithFeedback(meeting)}
													className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
												>
													<CheckCircle className="h-3 w-3 mr-1" />
													Complete with Feedback
												</Button>
											)}
											<Badge
												variant="outline"
												className="capitalize"
											>
												{meeting.location.replace("_", " ")}
											</Badge>
										</div>
									</div>
									<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{format(new Date(meeting.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{meeting.durationMinutes} min
										</span>
									</div>
									{meeting.meetingLink && (
										<a
											href={meeting.meetingLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-primary hover:underline mt-1 inline-block"
										>
											Join Meeting
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center py-8 text-muted-foreground">No meetings scheduled</p>
				)}
			</CardContent>
		</Card>
	);
}
