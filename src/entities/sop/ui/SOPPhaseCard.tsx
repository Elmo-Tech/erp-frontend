import { CheckCircle2, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import type { SOPPhase } from "@/entities/sop/model/types";
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/shared/lib/utils";

interface SOPPhaseCardProps {
	phase: SOPPhase;
	index: number;
	checked: boolean;
	onCheckedChange?: (checked: boolean) => void;
	acknowledgementControl?: ReactNode;
	className?: string;
}

export function SOPPhaseCard({ phase, index, checked, onCheckedChange, acknowledgementControl, className }: SOPPhaseCardProps) {
	return (
		<div className={cn("group grid grid-cols-[28px_1fr_auto] gap-3 rounded-md border bg-background p-3 transition-[background-color,border-color] duration-200", checked ? "border-primary/45 bg-primary/[0.035]" : "border-border hover:border-foreground/20", className)}>
			<div className={cn("flex size-7 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums transition-colors", checked ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
				{checked ? <CheckCircle2 className="size-3.5" /> : index + 1}
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

			<div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
				<span className="sr-only">Acknowledge {phase.name}</span>
				{acknowledgementControl ?? (
					<Checkbox
						checked={checked}
						onCheckedChange={(value) => onCheckedChange?.(value === true)}
						aria-label={`Acknowledge ${phase.name}`}
						className="data-[state=checked]:shadow-none"
					/>
				)}
			</div>
		</div>
	);
}
