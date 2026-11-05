"use client";

import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Pagination, PaginationInfo } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { cn } from "@/shared/lib/utils";
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
	rowActions?: (item: T) => ReactNode;
	filters?: ReactNode;
	emptyState?: {
		icon?: LucideIcon;
		title: string;
		description?: string;
		action?: { label: string; onClick: () => void };
	};
	headerActions?: ReactNode;
	className?: string;
}

export function DataTable<T>({ title, titleBadge, columns, data, keyExtractor, isLoading = false, error, pagination, onPageChange, onRowClick, rowActions, filters, emptyState, headerActions, className }: DataTableProps<T>) {
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
					{filters && <div className="mb-4">{filters}</div>}
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
					<CardHeader className="flex flex-row items-center justify-between">
						{title && <CardTitle>{title}</CardTitle>}
						{headerActions}
					</CardHeader>
				)}
				<CardContent>
					{filters && <div className="mb-4">{filters}</div>}
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
				<CardHeader className="flex flex-row items-center justify-between">
					<div className="flex items-center gap-2">
						{title && <CardTitle>{title}</CardTitle>}
						{titleBadge && <Badge variant="secondary">{titleBadge}</Badge>}
					</div>
					{headerActions}
				</CardHeader>
			)}
			<CardContent>
				{filters && <div className="mb-4">{filters}</div>}
				<div className="overflow-x-auto rounded-lg border border-border bg-surface">
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
								{rowActions && <TableHead className="w-0 text-right">Actions</TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((item) => (
								<TableRow
									key={keyExtractor(item)}
									className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
									role={onRowClick ? "button" : undefined}
									tabIndex={onRowClick ? 0 : undefined}
									onClick={() => onRowClick?.(item)}
									onKeyDown={(event) => {
										if (!onRowClick) return;
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											onRowClick(item);
										}
									}}
								>
									{columns.map((col) => (
										<TableCell
											key={col.key}
											className={col.className}
										>
											{col.render(item)}
										</TableCell>
									))}
									{rowActions && (
										<TableCell
											className="w-0 whitespace-nowrap text-right"
											onClick={(event) => event.stopPropagation()}
											onKeyDown={(event) => event.stopPropagation()}
										>
											{rowActions(item)}
										</TableCell>
									)}
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
