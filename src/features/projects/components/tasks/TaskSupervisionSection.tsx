"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AlertCircle, Check, CircleHelp, Clock3, Loader2, Play, RotateCcw, Square, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import {
	useActiveTaskSupervisionSession,
	useCreateTaskHelpRequest,
	useHeartbeatTaskSupervisionSession,
	useSetTaskSupervisor,
	useStartTaskSupervisionSession,
	useStopTaskSupervisionSession,
	useTaskSupervision,
	useUpdateTaskHelpRequest,
} from "@/features/dashboard/hooks/useTaskSupervision";
import { formatSupervisionDuration, getSupervisionElapsedSeconds, getViableSupervisorCandidates, taskHelpRequestStatusLabels } from "@/features/dashboard/lib/taskSupervision";
import type { Task } from "@/features/dashboard/types/task";
import type { TaskHelpRequest, TaskHelpRequestStatus, TaskSupervisionUser } from "@/features/dashboard/types/taskSupervision";
import { useProjectMembers } from "@/features/projects/hooks/useProjectMembers";
import { useAuthStore } from "@/store/authStore";

const NO_SUPERVISOR_VALUE = "none";
const NO_HELP_REQUEST_VALUE = "none";

const helpRequestStatusClasses: Record<TaskHelpRequestStatus, string> = {
	open: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
	acknowledged: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
	resolved: "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
	cancelled: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

interface TaskSupervisionSectionProps {
	task: Task;
}

function toSupervisorUser(userId: number, user?: { userId: number; name: string; email: string; avatar?: string }): TaskSupervisionUser {
	return user ? { ...user } : { userId, name: `User ${userId}` };
}

function getErrorMessage(error: unknown, fallback: string): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

export function TaskSupervisionSection({ task }: TaskSupervisionSectionProps) {
	const [helpMessage, setHelpMessage] = useState("");
	const [selectedHelpRequestId, setSelectedHelpRequestId] = useState(NO_HELP_REQUEST_VALUE);
	const [sessionNotes, setSessionNotes] = useState("");
	const [stopReason, setStopReason] = useState("");
	const [resolvingRequestId, setResolvingRequestId] = useState<number | null>(null);
	const [resolutionNote, setResolutionNote] = useState("");
	const [now, setNow] = useState(() => Date.now());
	const { user, role } = useAuthStore();
	const { canManageTaskTeam } = usePermissions();
	const isAdminOrSuperAdmin = role === "admin" || role === "super-admin";
	const canAssignSupervisor = isAdminOrSuperAdmin || canManageTaskTeam;
	const supervisionQuery = useTaskSupervision(task.taskId);
	const activeSessionQuery = useActiveTaskSupervisionSession(!!user);
	const { data: membersData, isLoading: isMembersLoading, isError: isMembersError, refetch: refetchMembers } = useProjectMembers(task.projectId, canAssignSupervisor);
	const setSupervisor = useSetTaskSupervisor();
	const createHelpRequest = useCreateTaskHelpRequest();
	const updateHelpRequest = useUpdateTaskHelpRequest();
	const startSession = useStartTaskSupervisionSession();
	const heartbeatSession = useHeartbeatTaskSupervisionSession();
	const stopSession = useStopTaskSupervisionSession();

	const supervision = supervisionQuery.data;
	const supervisor = supervision?.supervisor ?? task.supervisor ?? null;
	const isAssignee = task.assignedTo === user?.userId || task.assignees?.some((assignee) => assignee.userId === user?.userId) === true;
	const isSupervisor = supervisor?.userId === user?.userId;
	const activeSession = activeSessionQuery.data;
	const activeSessionForTask = activeSession?.taskId === task.taskId && activeSession.supervisorId === user?.userId ? activeSession : null;
	const hasActiveSessionOnOtherTask = activeSession?.isActive === true && activeSession.supervisorId === user?.userId && activeSession.taskId !== task.taskId;
	const canControlActiveSession = isSupervisor || !!activeSessionForTask;

	const projectMemberCandidates =
		membersData?.members.map((member) =>
			toSupervisorUser(member.userId, member.user)
		) ?? [];
	const taskTeamCandidates = [
		...(task.assignees?.map((assignee) => toSupervisorUser(assignee.userId, assignee.user)) ?? []),
		...(task.teamAssignees?.map((assignee) => toSupervisorUser(assignee.userId, assignee.user)) ?? []),
	];
	const supervisorCandidates = getViableSupervisorCandidates([...projectMemberCandidates, ...taskTeamCandidates, supervisor]);
	const helpRequests = supervision?.helpRequests ?? [];
	const selectableHelpRequests = helpRequests.filter((request) => request.status === "open" || request.status === "acknowledged");

	useEffect(() => {
		setHelpMessage("");
		setSelectedHelpRequestId(NO_HELP_REQUEST_VALUE);
		setSessionNotes("");
		setStopReason("");
		setResolvingRequestId(null);
		setResolutionNote("");
	}, [task.taskId]);

	useEffect(() => {
		if (!activeSessionForTask) {
			setNow(Date.now());
			return;
		}

		const elapsedInterval = window.setInterval(() => setNow(Date.now()), 1_000);
		const heartbeatInterval = window.setInterval(() => heartbeatSession.mutate({ sessionId: activeSessionForTask.sessionId }), 30_000);

		return () => {
			window.clearInterval(elapsedInterval);
			window.clearInterval(heartbeatInterval);
		};
	}, [activeSessionForTask, heartbeatSession.mutate]);

	const handleSupervisorChange = async (value: string) => {
		try {
			await setSupervisor.mutateAsync({
				taskId: task.taskId,
				projectId: task.projectId,
				payload: { supervisorId: value === NO_SUPERVISOR_VALUE ? null : Number(value) },
			});
			toast.success(value === NO_SUPERVISOR_VALUE ? "Supervisor removed" : "Supervisor assigned");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update supervisor"));
		}
	};

	const handleCreateHelpRequest = async () => {
		const message = helpMessage.trim();
		if (!message) return;

		try {
			await createHelpRequest.mutateAsync({ taskId: task.taskId, payload: { message } });
			setHelpMessage("");
			toast.success("Supervisor help requested");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to request supervisor help"));
		}
	};

	const handleHelpRequestStatus = async (request: TaskHelpRequest, status: Exclude<TaskHelpRequestStatus, "open">, note?: string) => {
		try {
			await updateHelpRequest.mutateAsync({
				taskId: task.taskId,
				helpRequestId: request.helpRequestId,
				payload: { status, ...(note?.trim() ? { resolutionNote: note.trim() } : {}) },
			});
			if (status === "acknowledged") {
				setSelectedHelpRequestId(String(request.helpRequestId));
			}
			if (status === "resolved") {
				setResolvingRequestId(null);
				setResolutionNote("");
			}
			toast.success(`Help request ${taskHelpRequestStatusLabels[status].toLowerCase()}`);
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update help request"));
		}
	};

	const handleStartSession = async () => {
		try {
			await startSession.mutateAsync({
				taskId: task.taskId,
				payload: {
					...(selectedHelpRequestId !== NO_HELP_REQUEST_VALUE ? { helpRequestId: Number(selectedHelpRequestId) } : {}),
					...(sessionNotes.trim() ? { notes: sessionNotes.trim() } : {}),
				},
			});
			setSessionNotes("");
			toast.success("Supervision session started");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to start supervision session"));
		}
	};

	const handleStopSession = async () => {
		if (!activeSessionForTask) return;

		try {
			await stopSession.mutateAsync({
				taskId: task.taskId,
				sessionId: activeSessionForTask.sessionId,
				payload: stopReason.trim() ? { stopReason: stopReason.trim() } : {},
			});
			setStopReason("");
			toast.success("Supervision session stopped");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to stop supervision session"));
		}
	};

	if (supervisionQuery.isLoading) {
		return (
			<div className="flex min-h-32 items-center justify-center rounded-lg border bg-muted/30">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				<span className="ml-2 text-sm text-muted-foreground">Loading supervision</span>
			</div>
		);
	}

	if (supervisionQuery.isError) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Supervision could not be loaded</AlertTitle>
				<AlertDescription className="flex flex-wrap items-center gap-3">
					<span>Try again to load the latest supervisor help requests and sessions.</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => supervisionQuery.refetch()}
					>
						<RotateCcw className="mr-1 h-3.5 w-3.5" />
						Retry
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h4 className="flex items-center gap-2 text-sm font-medium">
						<UserRoundCheck className="h-4 w-4" />
						Task Supervision
					</h4>
					<p className="mt-1 text-xs text-muted-foreground">Supervisor help and sessions are separate from task work tracking.</p>
				</div>
				{supervisor ? <Badge variant="secondary">Supervisor: {supervisor.name}</Badge> : <Badge variant="outline">No supervisor assigned</Badge>}
			</div>

			<Alert>
				<Clock3 className="h-4 w-4" />
				<AlertDescription>Supervision time does not affect work time, time entries, or the work timer.</AlertDescription>
			</Alert>

			{canAssignSupervisor && (
				<div className="rounded-lg border p-4">
					<div className="mb-3">
						<Label htmlFor={`task-supervisor-${task.taskId}`}>Assigned supervisor</Label>
						<p className="mt-1 text-xs text-muted-foreground">Choose from the task team and current project members.</p>
					</div>
					<Select
						value={supervisor ? String(supervisor.userId) : NO_SUPERVISOR_VALUE}
						onValueChange={handleSupervisorChange}
						disabled={setSupervisor.isPending || isMembersLoading}
					>
						<SelectTrigger id={`task-supervisor-${task.taskId}`}>
							<SelectValue placeholder="Select a supervisor" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={NO_SUPERVISOR_VALUE}>No supervisor</SelectItem>
							{supervisorCandidates.map((candidate) => (
								<SelectItem key={candidate.userId} value={String(candidate.userId)}>
									{candidate.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{isMembersError && (
						<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span>Project members could not be loaded. Available task-team members are still shown.</span>
							<Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => refetchMembers()}>
								Retry members
							</Button>
						</div>
					)}
					{!isMembersLoading && supervisorCandidates.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No viable project or task-team users are currently available.</p>}
				</div>
			)}

			{isAssignee && (
				<div className="rounded-lg border p-4">
					<Label htmlFor={`supervision-help-message-${task.taskId}`}>Request supervisor help</Label>
					<p className="mt-1 text-xs text-muted-foreground">Describe what you need help with. This does not start or stop work time.</p>
					<Textarea
						id={`supervision-help-message-${task.taskId}`}
						className="mt-3"
						placeholder="Describe the blocker or guidance needed"
						value={helpMessage}
						onChange={(event) => setHelpMessage(event.target.value)}
						rows={3}
					/>
					<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						{!supervisor && <span className="text-xs text-muted-foreground">No supervisor is assigned yet. Your request will remain visible for assignment and follow-up.</span>}
						<Button type="button" className="sm:ml-auto" onClick={handleCreateHelpRequest} disabled={!helpMessage.trim() || createHelpRequest.isPending}>
							{createHelpRequest.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleHelp className="mr-2 h-4 w-4" />}
							Request help
						</Button>
					</div>
				</div>
			)}

			{canControlActiveSession && (
				<div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h5 className="flex items-center gap-2 text-sm font-medium">
								<Clock3 className="h-4 w-4 text-primary" />
								Supervision timer
							</h5>
							<p className="mt-1 text-xs text-muted-foreground">Only the assigned supervisor can run this timer. It does not affect work time.</p>
						</div>
						{activeSessionForTask && (
							<div className="rounded-md bg-background px-3 py-2 font-mono text-lg font-semibold text-primary">
								<span className="mr-2 text-xs font-sans font-normal text-muted-foreground">Supervision time</span>
								{formatSupervisionDuration(getSupervisionElapsedSeconds(activeSessionForTask.startedAt, now))}
							</div>
						)}
					</div>

					{activeSessionForTask ? (
						<div className="mt-4 space-y-3">
							<Textarea value={stopReason} onChange={(event) => setStopReason(event.target.value)} placeholder="Stop reason (optional)" rows={2} />
							<Button type="button" variant="destructive" onClick={handleStopSession} disabled={stopSession.isPending}>
								{stopSession.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}
								Stop supervision
							</Button>
						</div>
					) : (
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							<Select value={selectedHelpRequestId} onValueChange={setSelectedHelpRequestId}>
								<SelectTrigger>
									<SelectValue placeholder="Link a help request (optional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NO_HELP_REQUEST_VALUE}>No linked help request</SelectItem>
									{selectableHelpRequests.map((request) => (
										<SelectItem key={request.helpRequestId} value={String(request.helpRequestId)}>
											{request.message}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Textarea value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} placeholder="Session notes (optional)" rows={2} />
							<Button type="button" className="sm:col-span-2 sm:justify-self-start" onClick={handleStartSession} disabled={startSession.isPending || hasActiveSessionOnOtherTask}>
								{startSession.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
								{hasActiveSessionOnOtherTask ? "Active supervision on another task" : "Start supervision"}
							</Button>
						</div>
					)}
					{activeSessionQuery.isError && <p className="mt-3 text-xs text-destructive">The active supervision session could not be refreshed. <button type="button" className="underline" onClick={() => activeSessionQuery.refetch()}>Retry</button></p>}
				</div>
			)}

			<div>
				<div className="mb-3 flex items-center justify-between gap-3">
					<div>
						<h5 className="text-sm font-medium">Help requests</h5>
						<p className="text-xs text-muted-foreground">{helpRequests.length === 0 ? "No help requests yet." : `${helpRequests.length} request${helpRequests.length === 1 ? "" : "s"}`}</p>
					</div>
					<Button type="button" variant="ghost" size="sm" onClick={() => supervisionQuery.refetch()} disabled={supervisionQuery.isFetching}>
						<RotateCcw className={`mr-1 h-3.5 w-3.5 ${supervisionQuery.isFetching ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
				{helpRequests.length === 0 ? (
					<div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">No supervisor help has been requested for this task.</div>
				) : (
					<div className="space-y-3">
						{helpRequests.map((request) => {
							const canCancel = isAssignee && request.requesterId === user?.userId && (request.status === "open" || request.status === "acknowledged");
							const isResolving = resolvingRequestId === request.helpRequestId;

							return (
								<div key={request.helpRequestId} className="rounded-lg border p-4">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0">
											<p className="whitespace-pre-wrap text-sm">{request.message}</p>
											<p className="mt-2 text-xs text-muted-foreground">
												{request.requester?.name || `User ${request.requesterId}`} requested help on {format(new Date(request.createdAt), "MMM d, yyyy 'at' HH:mm")}
											</p>
										</div>
										<Badge variant="outline" className={helpRequestStatusClasses[request.status]}>{taskHelpRequestStatusLabels[request.status]}</Badge>
									</div>

									{request.resolutionNote && <p className="mt-3 rounded-md bg-muted/60 p-3 text-sm">{request.resolutionNote}</p>}
									{isResolving && (
										<div className="mt-3 space-y-2">
											<Textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="Resolution note (optional)" rows={2} />
											<div className="flex flex-wrap gap-2">
												<Button type="button" size="sm" onClick={() => handleHelpRequestStatus(request, "resolved", resolutionNote)} disabled={updateHelpRequest.isPending}>
													<Check className="mr-1 h-3.5 w-3.5" />
													Confirm resolution
												</Button>
												<Button type="button" variant="ghost" size="sm" onClick={() => { setResolvingRequestId(null); setResolutionNote(""); }}>
													Cancel
												</Button>
											</div>
										</div>
									)}
									{!isResolving && (isSupervisor || canCancel) && (
										<div className="mt-3 flex flex-wrap gap-2">
											{isSupervisor && request.status === "open" && (
												<Button type="button" size="sm" variant="outline" onClick={() => handleHelpRequestStatus(request, "acknowledged")} disabled={updateHelpRequest.isPending}>
													<Check className="mr-1 h-3.5 w-3.5" />
													Acknowledge
												</Button>
											)}
											{isSupervisor && (request.status === "open" || request.status === "acknowledged") && (
												<Button type="button" size="sm" onClick={() => { setResolvingRequestId(request.helpRequestId); setResolutionNote(""); }} disabled={updateHelpRequest.isPending}>
													Resolve
												</Button>
											)}
											{canCancel && (
												<Button type="button" size="sm" variant="ghost" onClick={() => handleHelpRequestStatus(request, "cancelled")} disabled={updateHelpRequest.isPending}>
													Cancel request
												</Button>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
