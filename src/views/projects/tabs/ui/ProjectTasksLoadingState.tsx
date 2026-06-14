import { Skeleton } from "@/shared/ui/skeleton";

export function ProjectTasksLoadingState() {
	return (
		<div className="flex flex-col gap-4">
			{[1, 2].map((section) => (
				<div
					key={section}
					className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4"
				>
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-5 w-16" />
					</div>
					<Skeleton className="h-1.5 w-full" />
					<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
						{[1, 2, 3].map((task) => (
							<Skeleton
								key={task}
								className="h-36 rounded-xl"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
