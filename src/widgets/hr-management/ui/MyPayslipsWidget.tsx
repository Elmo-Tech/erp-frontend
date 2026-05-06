"use client";

import { useState } from "react";
import { Receipt, ChevronRight } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { useMyPayslips } from "@/features/hr/model/use-hr-actions";
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
// Payslip detail slide-over
// ─────────────────────────────────────────────────────────────────────────────

interface PayslipDetailSheetProps {
	payslip: Payslip | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function PayslipDetailSheet({ payslip, open, onOpenChange }: PayslipDetailSheetProps) {
	if (!payslip) return null;

	const statusCfg = STATUS_CONFIG[payslip.status] ?? {
		label: payslip.status,
		variant: "outline" as const,
	};

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent className="overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Receipt className="h-5 w-5" />
						Payslip Details
					</SheetTitle>
					<SheetDescription>
						Period: {payslip.period} • {payslip.employee?.name ?? "—"}
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 px-4 flex flex-col gap-6">
					{/* ── Status ── */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Status</span>
						<Badge
							variant={statusCfg.variant}
							className="capitalize"
						>
							{statusCfg.label}
						</Badge>
					</div>

					<Separator />

					{/* ── Salary Breakdown ── */}
					<div className="flex flex-col gap-3">
						<h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Salary Breakdown</h3>

						{/* Row helper — label left, amount right */}
						{/* 1. Base Salary */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-foreground">Base Salary</span>
							<span className="text-sm font-semibold tabular-nums">{formatCurrency(payslip.baseSalary)}</span>
						</div>

						{/* 2. Gamification Bonus — always shown */}
						<div className="flex items-start justify-between">
							<div className="flex flex-col">
								<span className="text-sm text-foreground">Gamification Bonus</span>
								<span className="text-xs text-muted-foreground">{payslip.pointsEarned} pts earned this period</span>
							</div>
							<span className={payslip.pointsBonusAmount > 0 ? "text-sm font-semibold tabular-nums text-green-600 dark:text-green-400" : "text-sm font-semibold tabular-nums text-muted-foreground"}>
								{payslip.pointsBonusAmount > 0 ? `+${formatCurrency(payslip.pointsBonusAmount)}` : formatCurrency(0)}
							</span>
						</div>

						{/* 3. Lateness Deduction — always shown */}
						<div className="flex items-start justify-between">
							<div className="flex flex-col">
								<span className="text-sm text-foreground">Lateness Deduction</span>
								<span className="text-xs text-muted-foreground">{payslip.latenessMinutes} min late this period</span>
							</div>
							<span className={payslip.latenessDeductionAmount > 0 ? "text-sm font-semibold tabular-nums text-red-600 dark:text-red-400" : "text-sm font-semibold tabular-nums text-muted-foreground"}>
								{payslip.latenessDeductionAmount > 0 ? `−${formatCurrency(payslip.latenessDeductionAmount)}` : formatCurrency(0)}
							</span>
						</div>

						{/* 4. Divider */}
						<Separator />

						{/* 5. Net Salary — prominent */}
						<div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
							<div className="flex flex-col">
								<span className="text-base font-semibold">Net Salary</span>
								<span className="text-xs text-muted-foreground">Base + Bonus − Deductions</span>
							</div>
							<span className="text-xl font-bold tabular-nums text-primary">{formatCurrency(payslip.netSalary)}</span>
						</div>
					</div>

					<Separator />

					{/* ── Metadata ── */}
					<div className="space-y-1 text-xs text-muted-foreground">
						<p>
							<strong>Generated:</strong> {new Date(payslip.createdAt).toLocaleString()}
						</p>
						<p>
							<strong>Last Updated:</strong> {new Date(payslip.updatedAt).toLocaleString()}
						</p>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onViewDetails: (payslip: Payslip) => void): Column<Payslip>[] {
	return [
		{
			key: "period",
			header: "Period",
			render: (p) => <span className="whitespace-nowrap text-sm font-medium">{p.period}</span>,
		},
		{
			key: "netSalary",
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
				<Button
					variant="ghost"
					size="sm"
					className="gap-1 text-xs"
					onClick={(e) => {
						e.stopPropagation();
						onViewDetails(p);
					}}
				>
					View Details
					<ChevronRight className="h-3 w-3" />
				</Button>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function MyPayslipsWidget() {
	const { data, isLoading, error } = useMyPayslips();
	const payslips = data?.data ?? [];

	const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const handleViewDetails = (payslip: Payslip) => {
		setSelectedPayslip(payslip);
		setSheetOpen(true);
	};

	const columns = buildColumns(handleViewDetails);

	return (
		<section className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">My Payslips</h1>
				<p className="text-sm text-muted-foreground">View your monthly payslips, including salary breakdown and deductions.</p>
			</div>

			<DataTable<Payslip>
				title="Payslip History"
				titleBadge={data ? String(payslips.length) : undefined}
				columns={columns}
				data={payslips}
				keyExtractor={(p) => p.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Receipt,
					title: "No payslips available",
					description: "Your payslips will appear here once they are generated by HR.",
				}}
			/>

			<PayslipDetailSheet
				payslip={selectedPayslip}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
			/>
		</section>
	);
}
