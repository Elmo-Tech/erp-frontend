/**
 * Loading Skeleton Component
 * Skeleton loaders for kanban and list views
 */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
	view: "kanban" | "list";
}

export function LoadingSkeleton({ view }: LoadingSkeletonProps) {
	if (view === "kanban") {
		return <KanbanSkeleton />;
	}
	return <ListSkeleton />;
}

function KanbanSkeleton() {
	return (
		<div className="flex gap-4 overflow-x-auto pb-4">
			{[...Array(5)].map((_, i) => (
				<div
					key={i}
					className="shrink-0 w-80"
				>
					<Skeleton className="h-14 rounded-t-xl" />
					<div className="space-y-2 p-2 border-x border-b rounded-b-xl min-h-[400px]">
						{[...Array(3)].map((_, j) => (
							<Skeleton
								key={j}
								className="h-36 rounded-lg"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function ListSkeleton() {
	return (
		<Card>
			<CardContent className="p-0">
				{[...Array(8)].map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4 p-4 border-b last:border-0"
					>
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-10 w-1" />
						<Skeleton className="h-4 w-4 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-6 w-20" />
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-12" />
					</div>
				))}
			</CardContent>
		</Card>
	);
}
