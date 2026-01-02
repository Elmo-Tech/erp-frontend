"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationInfo {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

interface PaginationProps {
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
	className?: string;
	showInfo?: boolean;
	maxVisiblePages?: number;
}

export function Pagination({ pagination, onPageChange, className, showInfo = true, maxVisiblePages = 5 }: PaginationProps) {
	const { total, perPage, currentPage, totalPages } = pagination;

	if (totalPages <= 1) return null;

	const startItem = (currentPage - 1) * perPage + 1;
	const endItem = Math.min(currentPage * perPage, total);

	// Calculate visible page numbers
	const getVisiblePages = () => {
		const pages: (number | "ellipsis")[] = [];
		const half = Math.floor(maxVisiblePages / 2);

		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end - start + 1 < maxVisiblePages) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}

		if (start > 1) {
			pages.push(1);
			if (start > 2) pages.push("ellipsis");
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) pages.push("ellipsis");
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className={cn("flex items-center justify-between", className)}>
			{showInfo && (
				<p className="text-sm text-muted-foreground">
					Showing {startItem} to {endItem} of {total}
				</p>
			)}

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
				>
					Previous
				</Button>

				<div className="flex items-center gap-1">
					{getVisiblePages().map((page, idx) =>
						page === "ellipsis" ? (
							<span
								key={`ellipsis-${idx}`}
								className="px-2 text-muted-foreground"
							>
								...
							</span>
						) : (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange(page)}
								className="w-8 h-8 p-0"
							>
								{page}
							</Button>
						)
					)}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
