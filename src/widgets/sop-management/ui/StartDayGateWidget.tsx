"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sunrise } from "lucide-react";
import { useSopCheckinCompleted, useTodayDirective } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface StartDayGateWidgetProps {
	className?: string;
}

export function StartDayGateWidget({ className }: StartDayGateWidgetProps) {
	const directiveQuery = useTodayDirective();
	const directive = directiveQuery.data;
	const completed = useSopCheckinCompleted(directive?.id);

	if (directiveQuery.isLoading) {
		return <Skeleton className={cn("h-[106px] w-full rounded-md", className)} />;
	}

	if (directiveQuery.error || !directive || completed) {
		return null;
	}

	const phaseCount = directive.phases?.length ?? 0;

	return (
		<section className={cn("relative overflow-hidden rounded-md border border-primary/30 bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),transparent_46%,hsl(var(--muted)))] px-4 py-4 shadow-sm", className)}>
			<div className="absolute inset-y-0 left-0 w-1 bg-primary" />
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex min-w-0 gap-3">
					<div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-background text-primary shadow-xs">
						<Sunrise className="size-4" />
					</div>

					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<h2 className="text-sm font-semibold leading-5">Start your day</h2>
							<span className="rounded-sm border bg-background/80 px-1.5 py-0.5 text-[11px] text-muted-foreground">
								{phaseCount} {phaseCount === 1 ? "phase" : "phases"}
							</span>
						</div>
						<p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">{directive.description || "Review the morning SOP and lock your top three priorities before the dashboard opens up."}</p>
						<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
							<CheckCircle2 className="size-3.5 text-primary" />
							<span>{directive.title}</span>
						</div>
					</div>
				</div>

				<Button
					asChild
					size="sm"
					className="shrink-0"
				>
					<Link href="/dashboard/sop">
						Start Your Day
						<ArrowRight data-icon="inline-end" />
					</Link>
				</Button>
			</div>
		</section>
	);
}
