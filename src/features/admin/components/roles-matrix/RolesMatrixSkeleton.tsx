/**
 * Skeleton loader for the RolesMatrix
 */

import { Skeleton } from "@/components/ui/skeleton";

export function RolesMatrixSkeleton() {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex gap-4">
				<Skeleton className="h-8 w-[200px]" />
				{[1, 2, 3].map((i) => (
					<Skeleton
						key={i}
						className="h-8 w-[120px]"
					/>
				))}
			</div>
			{/* Row skeletons */}
			{[1, 2, 3, 4, 5].map((row) => (
				<div
					key={row}
					className="flex gap-4"
				>
					<Skeleton className="h-6 w-[200px]" />
					{[1, 2, 3].map((col) => (
						<Skeleton
							key={col}
							className="h-6 w-[120px]"
						/>
					))}
				</div>
			))}
		</div>
	);
}
