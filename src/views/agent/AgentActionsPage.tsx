"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, CheckCircle2, Eye, History, Play, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { agentApi } from "@/entities/agent/api/agent.api";
import type { AgentAction, AgentActionRequest } from "@/entities/agent/model/types";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

const ACTION_OPTIONS: Array<{ value: AgentAction; label: string }> = [
	{ value: "project.create_tasks", label: "Create Project Tasks" },
	{ value: "project.start_timer", label: "Start Task Timer" },
	{ value: "reports.get", label: "Get Report" },
];

const PAYLOAD_TEMPLATES: Record<AgentAction, string> = {
	"project.create_tasks": JSON.stringify(
		{
			projectId: 1,
			tasks: [
				{
					title: "Prepare implementation checklist",
					description: "Scope the first delivery batch.",
					assigneeId: null,
					dueDate: "2026-06-10",
					milestoneId: null,
					estimatedHours: 3,
					deliverables: ["Checklist approved", "Delivery notes attached"],
				},
			],
		},
		null,
		2,
	),
	"project.start_timer": JSON.stringify(
		{
			projectId: 1,
			taskId: 1,
		},
		null,
		2,
	),
	"reports.get": JSON.stringify(
		{
			report: "overview",
			filters: {
				from: "2026-06-01",
				to: "2026-06-30",
			},
		},
		null,
		2,
	),
};

export default function AgentActionsPage() {
	const queryClient = useQueryClient();
	const [action, setAction] = useState<AgentAction>("project.create_tasks");
	const [payloadText, setPayloadText] = useState(PAYLOAD_TEMPLATES["project.create_tasks"]);
	const [command, setCommand] = useState("");
	const [lastPreviewKey, setLastPreviewKey] = useState<string | null>(null);
	const [parsedPreview, setParsedPreview] = useState<unknown | null>(null);

	const logsQuery = useQuery({
		queryKey: ["agent", "logs"],
		queryFn: agentApi.logs,
		staleTime: 30_000,
	});

	const request = useMemo(() => buildRequest(action, payloadText), [action, payloadText]);
	const requestKey = request.ok ? JSON.stringify(request.value) : null;

	const previewMutation = useMutation({
		mutationFn: async () => {
			if (!request.ok) throw new Error(request.error);
			return agentApi.preview(request.value);
		},
		onSuccess: () => {
			setLastPreviewKey(requestKey);
			setParsedPreview(null);
			queryClient.invalidateQueries({ queryKey: ["agent", "logs"] });
			toast.success("Preview ready");
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Preview failed"),
	});

	const parseMutation = useMutation({
		mutationFn: () => agentApi.parse(command.trim()),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["agent", "logs"] });

			if (data.parsed.clarificationNeeded || data.parsed.action === "unknown") {
				setLastPreviewKey(null);
				setParsedPreview(null);
				toast.info(data.parsed.clarificationQuestion ?? "I need more details before preparing an action.");
				return;
			}

			setAction(data.parsed.action);
			const nextPayloadText = JSON.stringify(data.parsed.payload, null, 2);
			setPayloadText(nextPayloadText);
			setLastPreviewKey(JSON.stringify({ action: data.parsed.action, payload: data.parsed.payload }));
			setParsedPreview(data.preview);
			previewMutation.reset();
			executeMutation.reset();
			toast.success("Command parsed and previewed");
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Command parsing failed"),
	});

	const executeMutation = useMutation({
		mutationFn: async () => {
			if (!request.ok) throw new Error(request.error);
			return agentApi.execute(request.value);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agent", "logs"] });
			toast.success("Action executed");
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Execution failed"),
	});

	const activePreview = previewMutation.data?.preview ?? parsedPreview;
	const canExecute = Boolean(request.ok && requestKey === lastPreviewKey && activePreview);

	const changeAction = (value: AgentAction) => {
		setAction(value);
		setPayloadText(PAYLOAD_TEMPLATES[value]);
		setLastPreviewKey(null);
		setParsedPreview(null);
		previewMutation.reset();
		executeMutation.reset();
	};

	return (
		<ProtectedDashboardRoute requiredPermission="use_ai_agent">
			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
					<div className="min-w-0">
						<h1 className="text-2xl font-semibold tracking-tight">AI Agent Actions</h1>
						<p className="text-sm text-muted-foreground">Run permission-scoped project, timer, and report actions with preview and audit logs.</p>
					</div>
					<Badge variant="outline" className="w-fit gap-1.5">
						<Bot className="size-3.5" />
						Preview before execute
					</Badge>
				</div>

				<div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
					<Card>
						<CardHeader>
							<CardTitle>Action Console</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							<div className="grid gap-2 rounded-md border bg-muted/20 p-3">
								<Label htmlFor="agent-command">Natural language command</Label>
								<Textarea
									id="agent-command"
									value={command}
									onChange={(event) => setCommand(event.target.value)}
									placeholder="Example: اعمل تاسكين في مشروع Website Relaunch وسلمهم يوم 2026-06-10"
									className="min-h-24"
								/>
								<div className="flex flex-wrap items-center gap-2">
									<Button
										type="button"
										variant="secondary"
										onClick={() => parseMutation.mutate()}
										disabled={parseMutation.isPending || command.trim().length < 3}
									>
										<Sparkles data-icon="inline-start" />
										Parse Command
									</Button>
									{parseMutation.data?.parsed.clarificationNeeded ? (
										<p className="text-sm text-muted-foreground">{parseMutation.data.parsed.clarificationQuestion}</p>
									) : null}
								</div>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="agent-action">Action</Label>
								<Select value={action} onValueChange={(value) => changeAction(value as AgentAction)}>
									<SelectTrigger id="agent-action" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ACTION_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="agent-payload">Payload</Label>
								<Textarea
									id="agent-payload"
									value={payloadText}
									onChange={(event) => {
										setPayloadText(event.target.value);
										setLastPreviewKey(null);
										setParsedPreview(null);
									}}
									className="min-h-72 font-mono text-sm"
									spellCheck={false}
								/>
							</div>

							{!request.ok ? <p className="text-sm text-destructive">{request.error}</p> : null}

							<div className="flex flex-wrap gap-2">
								<Button onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending || !request.ok}>
									<Eye data-icon="inline-start" />
									Preview
								</Button>
								<Button onClick={() => executeMutation.mutate()} disabled={executeMutation.isPending || !canExecute}>
									<Play data-icon="inline-start" />
									Execute
								</Button>
								<Button variant="outline" onClick={() => changeAction(action)}>
									<RotateCcw data-icon="inline-start" />
									Reset
								</Button>
							</div>
						</CardContent>
					</Card>

					<div className="flex flex-col gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle2 className="size-4" />
									Preview / Result
								</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="max-h-[360px] overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
									{JSON.stringify(executeMutation.data?.result ?? activePreview ?? { status: "idle" }, null, 2)}
								</pre>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<History className="size-4" />
									Recent Logs
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-2">
								{logsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading logs...</p> : null}
								{logsQuery.data?.logs.length === 0 ? <p className="text-sm text-muted-foreground">No agent actions yet.</p> : null}
								{logsQuery.data?.logs.slice(0, 8).map((log) => (
									<div key={log.logId} className="rounded-md border p-3">
										<div className="flex items-center justify-between gap-2">
											<span className="truncate text-sm font-medium">{log.action}</span>
											<Badge variant={log.status === "executed" ? "default" : "outline"}>{log.status}</Badge>
										</div>
										<p className="mt-1 text-xs text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "No timestamp"}</p>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</ProtectedDashboardRoute>
	);
}

function buildRequest(action: AgentAction, payloadText: string): { ok: true; value: AgentActionRequest } | { ok: false; error: string } {
	try {
		const payload = JSON.parse(payloadText);
		if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
			return { ok: false, error: "Payload must be a JSON object." };
		}

		return { ok: true, value: { action, payload } as AgentActionRequest };
	} catch {
		return { ok: false, error: "Payload is not valid JSON." };
	}
}
