import type { ElementType, ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface StatTrend {
	value: string;
	direction?: "up" | "down" | "neutral";
}

interface StatTileProps {
	label: string;
	value: ReactNode;
	icon?: ElementType;
	/** Short qualifier for the value, e.g. "this week". */
	hint?: ReactNode;
	/** Only pass a trend when the backend supplies a real comparison. */
	trend?: StatTrend;
	isLoading?: boolean;
	className?: string;
}

/** Compact KPI tile: label, prominent value, optional real comparison. */
export function StatTile({ label, value, icon: Icon, hint, trend, isLoading, className }: StatTileProps) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-2 p-4 sm:p-5", className)}>
			<div className="flex items-center justify-between gap-3">
				<p className="truncate text-[0.8125rem] font-medium text-muted-foreground">{label}</p>
				{Icon && (
					<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary" aria-hidden="true">
						<Icon className="size-3.5" strokeWidth={2} />
					</span>
				)}
			</div>
			{isLoading ? (
				<span className="h-8 w-24 animate-pulse rounded-md bg-muted" aria-label="Loading" />
			) : (
				<p className="truncate text-[1.625rem] leading-8 font-semibold tracking-[-0.02em] tabular-nums text-foreground">{value}</p>
			)}
			{(trend || hint) && (
				<div className="flex min-w-0 items-center gap-2 text-xs">
					{trend && <TrendChip trend={trend} />}
					{hint && <span className="truncate text-muted-foreground">{hint}</span>}
				</div>
			)}
		</div>
	);
}

function TrendChip({ trend }: { trend: StatTrend }) {
	const isUp = trend.direction === "up";
	const isDown = trend.direction === "down";
	const Icon = isDown ? TrendingDown : TrendingUp;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium tabular-nums",
				isUp ? "bg-success-soft text-success" : isDown ? "bg-destructive-soft text-destructive" : "bg-muted text-muted-foreground",
			)}
		>
			{(isUp || isDown) && <Icon className="size-3" aria-hidden="true" />}
			{trend.value}
		</span>
	);
}

/** Groups tiles into a single bordered strip with hairline dividers. */
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<section
			className={cn(
				// 1px gaps over a border-coloured backdrop draw hairline dividers at any column count.
				"grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-[var(--shadow-card)] sm:grid-cols-2 [&>*]:bg-card",
				className,
			)}
		>
			{children}
		</section>
	);
}
