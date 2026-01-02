"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
	variant?: "table" | "card" | "list" | "form";
	rows?: number;
	className?: string;
}

export function LoadingState({ variant = "table", rows = 5, className }: LoadingStateProps) {
	if (variant === "table") {
		return (
			<div className={cn("space-y-3", className)}>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4"
					>
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-16" />
					</div>
				))}
			</div>
		);
	}

	if (variant === "card") {
		return (
			<div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className="border rounded-lg p-4 space-y-3"
					>
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				))}
			</div>
		);
	}

	if (variant === "list") {
		return (
			<div className={cn("space-y-4", className)}>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4"
					>
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	// Form variant
	return (
		<div className={cn("space-y-4", className)}>
			{Array.from({ length: rows }).map((_, i) => (
				<div
					key={i}
					className="space-y-2"
				>
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
			))}
		</div>
	);
}
