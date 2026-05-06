"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DollarSign, Plus, MoreHorizontal, CheckCircle, CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Can } from "@/shared/ui/Can";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { GeneratePayrollModal } from "@/features/hr/ui/GeneratePayrollModal";
import { useAdminPayslips, useApprovePayslip, useMarkPayslipPaid, useDeleteDraftPayslip } from "@/features/hr/model/use-hr-actions";
import type { Payslip, PayslipStatus } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(amount);
}

const STATUS_CONFIG: Record<PayslipStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	approved: { label: "Approved", variant: "default" },
	paid: { label: "Paid", variant: "outline" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Row actions dropdown — only rendered for actionable statuses
// ─────────────────────────────────────────────────────────────────────────────

interface PayslipRowActionsProps {
	payslip: Payslip;
	onApprove: (id: number) => void;
	onMarkPaid: (id: number) => void;
	onDelete: (payslip: Payslip) => void;
}

function PayslipRowActions({ payslip, onApprove, onMarkPaid, onDelete }: PayslipRowActionsProps) {
	const isDraft = payslip.status === "draft";
	const isApproved = payslip.status === "approved";

	if (!isDraft && !isApproved) return null;

	return (
		<Can permission="manage_payroll">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
					>
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Payslip actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{isDraft && (
						<DropdownMenuItem
							className="gap-2"
							onClick={() => onApprove(payslip.id)}
						>
							<CheckCircle className="h-4 w-4 text-green-600" />
							Approve
						</DropdownMenuItem>
					)}
					{isApproved && (
						<DropdownMenuItem
							className="gap-2"
							onClick={() => onMarkPaid(payslip.id)}
						>
							<CreditCard className="h-4 w-4 text-blue-600" />
							Mark as Paid
						</DropdownMenuItem>
					)}
					{isDraft && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 text-destructive focus:text-destructive"
								onClick={() => onDelete(payslip)}
							>
								<Trash2 className="h-4 w-4" />
								Delete Draft
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</Can>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onApprove: (id: number) => void, onMarkPaid: (id: number) => void, onDelete: (payslip: Payslip) => void): Column<Payslip>[] {
	return [
		{
			key: "employee",
			header: "Employee",
			render: (p) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8 shrink-0">
						<AvatarImage src={p.employee?.avatar ?? undefined} />
						<AvatarFallback>{p.employee?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{p.employee?.name ?? "—"}</p>
						<p className="truncate text-xs text-muted-foreground">{p.employee?.email ?? "—"}</p>
					</div>
				</div>
			),
		},
		{
			key: "period",
			header: "Period",
			render: (p) => <span className="text-sm font-medium tabular-nums">{p.period}</span>,
		},
		{
			key: "net_salary",
			header: "Net Salary",
			className: "text-right",
			render: (p) => <span className="text-sm font-semibold tabular-nums">{formatCurrency(p.netSalary)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (p) => {
				const cfg = STATUS_CONFIG[p.status] ?? {
					label: p.status,
					variant: "outline" as const,
				};
				return (
					<Badge
						variant={cfg.variant}
						className="capitalize text-xs"
					>
						{cfg.label}
					</Badge>
				);
			},
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (p) => (
				<PayslipRowActions
					payslip={p}
					onApprove={onApprove}
					onMarkPaid={onMarkPaid}
					onDelete={onDelete}
				/>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function PayrollManagementWidget() {
	const { data, isLoading, error } = useAdminPayslips();
	const approvePayslip = useApprovePayslip();
	const markPaid = useMarkPayslipPaid();
	const deleteDraft = useDeleteDraftPayslip();

	const payslips = data?.data ?? [];

	const [generateOpen, setGenerateOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Payslip | null>(null);

	const handleApprove = async (id: number) => {
		try {
			await approvePayslip.mutateAsync(id);
			toast.success("Payslip approved");
		} catch {
			toast.error("Failed to approve payslip");
		}
	};

	const handleMarkPaid = async (id: number) => {
		try {
			await markPaid.mutateAsync(id);
			toast.success("Payslip marked as paid");
		} catch {
			toast.error("Failed to mark payslip as paid");
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await deleteDraft.mutateAsync(deleteTarget.id);
			toast.success("Draft payslip deleted");
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete payslip");
		}
	};

	const columns = buildColumns(handleApprove, handleMarkPaid, setDeleteTarget);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Payroll Management</h1>
					<p className="text-sm text-muted-foreground">Generate, approve, and manage employee payslips.</p>
				</div>
				<Can permission="manage_payroll">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={() => setGenerateOpen(true)}
					>
						<Plus className="h-4 w-4" />
						Generate Payslip
					</Button>
				</Can>
			</div>

			<DataTable<Payslip>
				title="All Payslips"
				titleBadge={data ? String(payslips.length) : undefined}
				columns={columns}
				data={payslips}
				keyExtractor={(p) => p.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: DollarSign,
					title: "No payslips found",
					description: "Generate payslips for employees to get started.",
					action: { label: "Generate Payslip", onClick: () => setGenerateOpen(true) },
				}}
			/>

			<GeneratePayrollModal
				open={generateOpen}
				onClose={() => setGenerateOpen(false)}
			/>

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete draft payslip"
				description={
					<span>
						Delete the draft payslip for <span className="font-medium text-foreground">{deleteTarget?.employee?.name}</span> ({deleteTarget?.period})? This action cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				isLoading={deleteDraft.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</section>
	);
}
