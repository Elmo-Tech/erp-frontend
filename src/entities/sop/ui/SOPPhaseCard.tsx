import { CheckCircle2, Clock3 } from "lucide-react";
import type { SOPPhase } from "@/entities/sop/model/types";
import { cn } from "@/shared/lib/utils";

interface SOPPhaseCardProps {
	phase: SOPPhase;
	index: number;
	active?: boolean;
	complete?: boolean;
	className?: string;
}

export function SOPPhaseCard({ phase, index, active = false, complete = false, className }: SOPPhaseCardProps) {
	return (
		<div className={cn("group grid grid-cols-[28px_1fr] gap-3 rounded-md border bg-background p-3 transition-colors", active ? "border-primary/40 bg-primary/[0.025]" : "border-border", className)}>
			<div className={cn("flex size-7 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums", complete ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary/50 text-primary" : "border-border text-muted-foreground")}>
				{complete ? <CheckCircle2 className="size-3.5" /> : index + 1}
			</div>

			<div className="min-w-0 space-y-2">
				<div className="flex min-w-0 items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="truncate text-sm font-medium leading-5">{phase.name}</h3>
						{phase.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{phase.description}</p>}
					</div>

					{(phase.minutes || phase.starts_at || phase.ends_at) && (
						<div className="flex shrink-0 items-center gap-1 rounded-md border bg-muted/40 px-1.5 py-1 text-[11px] text-muted-foreground">
							<Clock3 className="size-3" />
							<span>{phase.minutes ? `${phase.minutes}m` : [phase.starts_at, phase.ends_at].filter(Boolean).join("-")}</span>
						</div>
					)}
				</div>

				{phase.items?.length ? (
					<ul className="space-y-1 border-t pt-2">
						{phase.items.map((item) => (
							<li
								key={item}
								className="flex gap-2 text-xs leading-5 text-muted-foreground"
							>
								<span className="mt-2 size-1 rounded-full bg-muted-foreground/50" />
								<span>{item}</span>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</div>
	);
}
