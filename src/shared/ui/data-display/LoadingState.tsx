import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface LoadingStateProps {
	variant?: "table" | "cards" | "list" | "default";
	rows?: number;
	className?: string;
}

export function LoadingState({ variant = "default", rows = 5, className }: LoadingStateProps) {
	if (variant === "table") {
		return (
			<div className={cn("flex flex-col gap-3", className)}>
				<Skeleton className="h-10 w-full" />
				{Array.from({ length: rows }).map((_, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	if (variant === "cards") {
		return (
			<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
				{Array.from({ length: rows }).map((_, i) => (
					<Skeleton key={i} className="h-32 w-full" />
				))}
			</div>
		);
	}

	if (variant === "list") {
		return (
			<div className={cn("flex flex-col gap-4", className)}>
				{Array.from({ length: rows }).map((_, i) => (
					<div key={i} className="flex items-center gap-4">
						<Skeleton className="h-12 w-12 rounded-full shrink-0" />
						<div className="space-y-2 w-full">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col items-center justify-center p-8", className)}>
			<Skeleton className="h-8 w-8 rounded-full mb-4" />
			<Skeleton className="h-4 w-32" />
		</div>
	);
}
