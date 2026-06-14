"use client";

import { GitPullRequestArrow, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { StatusBadge, getStatusVariant } from "@/shared/ui/data-display/StatusBadge";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import type { ChangeRequest, ChangeRequestStatusValue } from "@/features/projects/api/execution.api";
import { changeRequestStatusOptions } from "../model/project-change-requests";
import { ProjectChangeRequestStatusSelect } from "./ProjectChangeRequestStatusSelect";

interface ProjectChangeRequestsTableProps {
	changeRequests: ChangeRequest[];
	currency: string;
	isLoading: boolean;
	error: Error | null;
	isUpdatingStatus: boolean;
	onCreateClick: () => void;
	onStatusChange: (changeRequest: ChangeRequest, status: ChangeRequestStatusValue) => void;
	onDeleteClick: (changeRequest: ChangeRequest) => void;
}

function buildChangeRequestColumns(currency: string): Column<ChangeRequest>[] {
	return [
		{
			key: "title",
			header: "Title",
			render: (changeRequest) => <span className="font-medium">{changeRequest.title}</span>,
		},
		{
			key: "description",
			header: "Description",
			className: "max-w-xs",
			render: (changeRequest) => <span className="line-clamp-2 text-sm text-muted-foreground">{changeRequest.description ?? "—"}</span>,
		},
		{
			key: "price",
			header: "Price",
			render: (changeRequest) => <span className="tabular-nums font-medium">{formatCurrency(changeRequest.price, currency)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (changeRequest) => (
				<StatusBadge
					label={changeRequest.statusLabel ?? changeRequest.status ?? "Draft"}
					variant={getStatusVariant(changeRequest.status ?? "draft")}
				/>
			),
		},
		{
			key: "createdAt",
			header: "Created",
			render: (changeRequest) => <span className="text-sm text-muted-foreground">{formatDateDisplay(changeRequest.createdAt)}</span>,
		},
	];
}

export function ProjectChangeRequestsTable({
	changeRequests,
	currency,
	isLoading,
	error,
	isUpdatingStatus,
	onCreateClick,
	onStatusChange,
	onDeleteClick,
}: ProjectChangeRequestsTableProps) {
	return (
		<DataTable
			title="Change Requests"
			titleBadge={changeRequests.length > 0 ? String(changeRequests.length) : undefined}
			columns={buildChangeRequestColumns(currency)}
			data={changeRequests}
			keyExtractor={(changeRequest) => changeRequest.changeRequestId}
			isLoading={isLoading}
			error={error}
			emptyState={{
				icon: GitPullRequestArrow,
				title: "No change requests yet",
				description: "Scope changes and additional work items will appear here once created.",
				action: { label: "New Change Request", onClick: onCreateClick },
			}}
			headerActions={
				<Can permission="manage_change_requests">
					<Button
						size="sm"
						onClick={onCreateClick}
					>
						<Plus />
						New Change Request
					</Button>
				</Can>
			}
			rowActions={(changeRequest) => (
				<div className="flex items-center justify-end gap-1">
					<Can permission="manage_change_requests">
						<ProjectChangeRequestStatusSelect
							currentStatus={changeRequest.status ?? "draft"}
							options={changeRequestStatusOptions}
							disabled={isUpdatingStatus}
							onChange={(status) => onStatusChange(changeRequest, status)}
						/>
					</Can>
					<Can permission="delete_change_requests">
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-muted-foreground hover:text-destructive"
							onClick={() => onDeleteClick(changeRequest)}
							aria-label="Delete change request"
						>
							<Trash2 className="size-4" />
						</Button>
					</Can>
				</div>
			)}
		/>
	);
}
