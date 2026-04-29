"use client";

import { CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { TeamPulseItem } from "@/widgets/dashboard-management/model/dashboard.api";

interface TeamDailyPulseWidgetProps {
	pulse?: TeamPulseItem[];
}

export function TeamDailyPulseWidget({ pulse = [] }: TeamDailyPulseWidgetProps) {
	return (
		<section className="overflow-hidden rounded-md border border-border bg-card">
			<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
				<div className="min-w-0">
					<h2 className="text-sm font-medium text-foreground">Daily pulse</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">{pulse.length} SOP submission{pulse.length === 1 ? "" : "s"} today</p>
				</div>
				<CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
			</div>

			{pulse.length ? (
				<div className="grid gap-0 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
					{pulse.map((item) => (
						<article
							key={item.id}
							className="min-w-0 p-4"
						>
							<div className="flex min-w-0 items-center gap-3">
								<Avatar className="size-8 border border-border">
									<AvatarImage
										src={item.user?.avatar_url ?? undefined}
										alt={item.user?.name ?? "Team member"}
									/>
									<AvatarFallback className="text-[11px] font-medium text-muted-foreground">{getInitials(item.user?.name ?? item.user?.email)}</AvatarFallback>
								</Avatar>

								<div className="min-w-0">
									<p className="truncate text-sm font-medium leading-5 text-foreground">{item.user?.name || item.user?.email || "Team member"}</p>
									<p className="truncate text-xs text-muted-foreground">{formatSubmittedAt(item.submitted_at)}</p>
								</div>
							</div>

							<ol className="mt-3 space-y-2">
								{item.focus_items.slice(0, 3).map((focusItem, index) => (
									<li
										key={`${item.id}-${index}`}
										className="grid grid-cols-[20px_minmax(0,1fr)] gap-2 text-sm"
									>
										<span className="pt-0.5 text-xs tabular-nums text-muted-foreground">{index + 1}.</span>
										<span className="min-w-0 text-muted-foreground">{focusItem}</span>
									</li>
								))}
							</ol>
						</article>
					))}
				</div>
			) : (
				<div className="flex min-h-28 items-center justify-center px-4 text-center text-sm text-muted-foreground">No SOP submissions have been recorded today.</div>
			)}
		</section>
	);
}

function getInitials(value?: string | null) {
	if (!value) {
		return "TM";
	}

	return value
		.split(/\s|@/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

function formatSubmittedAt(value?: string | null) {
	if (!value) {
		return "Submitted today";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Submitted today";
	}

	return `Submitted ${new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(date)}`;
}
