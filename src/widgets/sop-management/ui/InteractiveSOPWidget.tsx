"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, RefreshCcw, TriangleAlert } from "lucide-react";
import { SOPCheckinFlow } from "@/features/sop/ui/SOPCheckinFlow";
import { useSopCheckinCompleted, useTodayDirective } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const SKELETON_ROWS = [0, 1, 2];

export function InteractiveSOPWidget() {
	const directiveQuery = useTodayDirective();
	const directive = directiveQuery.data;
	const completed = useSopCheckinCompleted(directive?.id);

	return (
		<div className="mx-auto w-full space-y-4">
			<div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">Morning SOP</h1>
					<p className="mt-1 text-sm text-muted-foreground">Review the operating rhythm, acknowledge each phase, and commit your top priorities.</p>
				</div>
				<Button
					asChild
					variant="outline"
					size="sm"
				>
					<Link href="/dashboard">
						<ArrowLeft data-icon="inline-start" />
						Dashboard
					</Link>
				</Button>
			</div>

			{directiveQuery.isLoading ? (
				<div className="space-y-3 rounded-md border border-border bg-background p-3">
					<div className="flex items-start justify-between gap-4 border-b border-border px-1 pb-4 pt-1">
						<div className="space-y-2">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-4 w-80 max-w-full" />
						</div>
						<Skeleton className="h-6 w-24" />
					</div>
					{SKELETON_ROWS.map((item) => (
						<div
							key={item}
							className="grid grid-cols-[28px_1fr_16px] gap-3 rounded-md border border-border p-3"
						>
							<Skeleton className="size-7 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-36" />
								<Skeleton className="h-3 w-full" />
							</div>
							<Skeleton className="size-4 rounded-sm" />
						</div>
					))}
				</div>
			) : directiveQuery.error ? (
				<div className="rounded-md border border-destructive/25 bg-background p-4">
					<div className="flex gap-3">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/25 bg-destructive/4 text-destructive">
							<TriangleAlert className="size-4" />
						</div>
						<div className="min-w-0">
							<p className="text-sm font-medium">Unable to load today&apos;s SOP</p>
							<p className="mt-1 text-sm leading-6 text-muted-foreground">Refresh the directive and try again before starting the dashboard.</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-3"
								onClick={() => directiveQuery.refetch()}
							>
								<RefreshCcw data-icon="inline-start" />
								Retry
							</Button>
						</div>
					</div>
				</div>
			) : directive && !completed ? (
				<SOPCheckinFlow
					key={directive.id}
					directive={directive}
				/>
			) : directive && completed ? (
				<div className="rounded-md border border-primary/30 bg-primary/2.5 p-5">
					<div className="flex gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-background text-primary">
							<CheckCircle2 className="size-4" />
						</div>
						<div className="min-w-0">
							<p className="text-sm font-semibold">Today&apos;s SOP is complete</p>
							<p className="mt-1 text-sm leading-6 text-muted-foreground">Your check-in is recorded. Continue with the main dashboard.</p>
							<Button
								asChild
								size="sm"
								className="mt-3"
							>
								<Link href="/dashboard">
									Return to Dashboard
									<ArrowRight data-icon="inline-end" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			) : (
				<div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-center">
					<div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/30">
						<ClipboardCheck className="size-5 text-muted-foreground" />
					</div>
					<p className="text-sm font-medium">No SOP directive assigned</p>
					<p className="max-w-sm text-sm leading-6 text-muted-foreground">Your permissions do not currently match an active morning directive.</p>
				</div>
			)}
		</div>
	);
}
