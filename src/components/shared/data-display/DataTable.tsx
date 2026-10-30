"use client";

import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationInfo } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface Column<T> {
	key: string;
	header: string;
	render: (item: T) => ReactNode;
	className?: string;
}

interface DataTableProps<T> {
	title?: string;
	titleBadge?: string;
	columns: Column<T>[];
	data: T[];
	keyExtractor: (item: T) => string | number;
	isLoading?: boolean;
	error?: Error | null;
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	onRowClick?: (item: T) => void;
	emptyState?: {
		icon?: LucideIcon;
		title: string;
		description?: string;
		action?: { label: string; onClick: () => void };
	};
	headerActions?: ReactNode;
	className?: string;
}

export function DataTable<T>({ title, titleBadge, columns, data, keyExtractor, isLoading = false, error, pagination, onPageChange, onRowClick, emptyState, headerActions, className }: DataTableProps<T>) {
	// Loading state
	if (isLoading) {
		return (
			<Card className={className}>
				{title && (
					<CardHeader>
						<CardTitle>{title}</CardTitle>
					</CardHeader>
				)}
				<CardContent>
					<LoadingState
						variant="table"
						rows={5}
					/>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card className={className}>
				<CardContent className="py-8">
					<EmptyState
						title="Error loading data"
						description={error.message}
					/>
				</CardContent>
			</Card>
		);
	}

	// Empty state
	if (!data || data.length === 0) {
		return (
			<Card className={className}>
				{(title || headerActions) && (
					<CardHeader className="flex flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
						{title && <CardTitle>{title}</CardTitle>}
						{headerActions}
					</CardHeader>
				)}
				<CardContent>
					<EmptyState
						icon={emptyState?.icon}
						title={emptyState?.title || "No data found"}
						description={emptyState?.description}
						action={emptyState?.action}
					/>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			{(title || headerActions) && (
				<CardHeader className="flex flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
					<div className="flex items-center gap-2">
						{title && <CardTitle>{title}</CardTitle>}
						{titleBadge && <Badge variant="secondary">{titleBadge}</Badge>}
					</div>
					{headerActions}
				</CardHeader>
			)}
			<CardContent>
				<div className="overflow-hidden rounded-xl border">
					<Table>
						<TableHeader>
							<TableRow>
								{columns.map((col) => (
									<TableHead
										key={col.key}
										className={col.className}
									>
										{col.header}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((item) => (
								<TableRow
									key={keyExtractor(item)}
									className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
									onClick={() => onRowClick?.(item)}
								>
									{columns.map((col) => (
										<TableCell
											key={col.key}
											className={col.className}
										>
											{col.render(item)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{pagination && onPageChange && (
					<Pagination
						pagination={pagination}
						onPageChange={onPageChange}
						className="mt-4"
					/>
				)}
			</CardContent>
		</Card>
	);
}
