/**
 * Tasks List Loading Skeleton
 */

export function TasksListSkeleton() {
	return (
		<div className="border rounded-xl overflow-hidden bg-card">
			<div className="grid grid-cols-[1fr_120px_140px_100px_50px] gap-4 px-4 py-3 bg-muted/50 border-b">
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className="h-4 bg-muted rounded animate-pulse"
					/>
				))}
			</div>
			<div className="divide-y">
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className="grid grid-cols-[1fr_120px_140px_100px_50px] gap-4 px-4 py-4"
					>
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 bg-muted rounded animate-pulse" />
							<div className="w-1 h-8 bg-muted rounded animate-pulse" />
							<div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
							<div className="flex-1 h-5 bg-muted rounded animate-pulse" />
						</div>
						<div className="flex -space-x-2">
							{[...Array(2)].map((_, j) => (
								<div
									key={j}
									className="w-7 h-7 bg-muted rounded-full animate-pulse"
								/>
							))}
						</div>
						<div className="h-5 bg-muted rounded animate-pulse w-20" />
						<div className="h-5 bg-muted rounded animate-pulse w-16" />
						<div className="h-8 w-8 bg-muted rounded animate-pulse" />
					</div>
				))}
			</div>
		</div>
	);
}
