"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { EscalatedBlocker, useResolveEscalatedBlocker } from "@/widgets/dashboard-management/model/dashboard.api";

interface EscalatedBlockersWidgetProps {
	blockers?: EscalatedBlocker[];
}

export function EscalatedBlockersWidget({ blockers = [] }: EscalatedBlockersWidgetProps) {
	const resolveMutation = useResolveEscalatedBlocker();

	if (!blockers.length) {
		return null;
	}

	return (
		<section className="overflow-hidden rounded-md border border-destructive/40 bg-[linear-gradient(180deg,hsl(var(--destructive)/0.055),hsl(var(--card))_42%)]">
			<div className="flex items-center justify-between gap-3 border-b border-destructive/20 px-4 py-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full border border-destructive/40 bg-destructive/20 animate-pulse" />
						<h2 className="text-sm font-medium text-foreground">Escalation matrix</h2>
					</div>
					<p className="mt-0.5 text-xs text-muted-foreground">{blockers.length} founder-level blocker{blockers.length === 1 ? "" : "s"}</p>
				</div>
				<AlertCircle className="size-4 shrink-0 text-destructive/80" />
			</div>

			<div className="divide-y divide-destructive/10">
				{blockers.map((blocker) => {
					const isResolving = resolveMutation.isPending && resolveMutation.variables === blocker.dependency_id;

					return (
						<div
							key={blocker.dependency_id}
							className="grid gap-3 px-4 py-3 transition-colors hover:bg-destructive/[0.035] md:grid-cols-[minmax(0,1fr)_180px_auto]"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium leading-5 text-foreground">{blocker.title || "Untitled blocker"}</p>
								<p className="mt-0.5 truncate text-xs text-muted-foreground">
									{blocker.project || "No project"} · Blocked by {blocker.blocked_by?.title || "unresolved dependency"}
								</p>
							</div>

							<div className="min-w-0 text-xs text-muted-foreground md:text-right">
								<p className="truncate">Escalated by {blocker.escalated_by?.name || "PMO"}</p>
								<p className="mt-0.5 tabular-nums">{formatDateTime(blocker.escalated_at)}</p>
							</div>

							<Button
								type="button"
								size="sm"
								variant="outline"
								className={cn("h-8 justify-self-start border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive text-xs md:justify-self-end", isResolving && "pointer-events-none")}
								disabled={resolveMutation.isPending}
								onClick={() => {
									resolveMutation.mutate(blocker.dependency_id, {
										onSuccess: () => toast.success("Escalated blocker resolved"),
										onError: () => toast.error("Failed to resolve blocker"),
									});
								}}
							>
								{isResolving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
								Resolve
							</Button>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function formatDateTime(value?: string | null) {
	if (!value) {
		return "Not timestamped";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Not timestamped";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}
