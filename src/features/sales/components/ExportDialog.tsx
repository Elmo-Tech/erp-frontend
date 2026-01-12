"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useExportLeads, useExportProposals, useExportQuotations } from "../hooks/useGlobalSearch";
import { CalendarIcon, Download, Loader2, FileSpreadsheet, FileJson } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ExportFormat } from "../types/search";
import { toast } from "sonner";

type ExportType = "leads" | "proposals" | "quotations";

interface ExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultType?: ExportType;
}

export function ExportDialog({ open, onOpenChange, defaultType = "leads" }: ExportDialogProps) {
	const [exportType, setExportType] = useState<ExportType>(defaultType);
	const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [status, setStatus] = useState<string>("");

	const exportLeads = useExportLeads();
	const exportProposals = useExportProposals();
	const exportQuotations = useExportQuotations();

	const isLoading = exportLeads.isPending || exportProposals.isPending || exportQuotations.isPending;

	const handleExport = async () => {
		const filters = {
			status: status || undefined,
			startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
			endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
		};

		try {
			switch (exportType) {
				case "leads":
					await exportLeads.mutateAsync({ filters, format: exportFormat });
					break;
				case "proposals":
					await exportProposals.mutateAsync({ filters, format: exportFormat });
					break;
				case "quotations":
					await exportQuotations.mutateAsync({ filters, format: exportFormat });
					break;
			}

			toast.success(`${exportType} exported successfully`);
			onOpenChange(false);
		} catch {
			toast.error("Failed to export data");
		}
	};

	const statusOptions: Record<ExportType, { value: string; label: string }[]> = {
		leads: [
			{ value: "", label: "All Statuses" },
			{ value: "new", label: "New" },
			{ value: "contacted", label: "Contacted" },
			{ value: "qualified", label: "Qualified" },
			{ value: "proposal_sent", label: "Proposal Sent" },
			{ value: "quotation_sent", label: "Quotation Sent" },
			{ value: "negotiation", label: "Negotiation" },
			{ value: "won", label: "Won" },
			{ value: "lost", label: "Lost" },
		],
		proposals: [
			{ value: "", label: "All Statuses" },
			{ value: "draft", label: "Draft" },
			{ value: "sent", label: "Sent" },
			{ value: "approved", label: "Approved" },
			{ value: "rejected", label: "Rejected" },
			{ value: "expired", label: "Expired" },
		],
		quotations: [
			{ value: "", label: "All Statuses" },
			{ value: "draft", label: "Draft" },
			{ value: "sent", label: "Sent" },
			{ value: "approved", label: "Approved" },
			{ value: "rejected", label: "Rejected" },
		],
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						Export Data
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Export Type */}
					<div className="space-y-2">
						<Label>Export Type</Label>
						<Select
							value={exportType}
							onValueChange={(v) => {
								setExportType(v as ExportType);
								setStatus("");
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="leads">Leads</SelectItem>
								<SelectItem value="proposals">Proposals</SelectItem>
								<SelectItem value="quotations">Quotations</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Format */}
					<div className="space-y-2">
						<Label>Format</Label>
						<div className="flex gap-2">
							<Button
								type="button"
								variant={exportFormat === "csv" ? "default" : "outline"}
								size="sm"
								onClick={() => setExportFormat("csv")}
								className="flex-1 gap-2"
							>
								<FileSpreadsheet className="h-4 w-4" />
								CSV
							</Button>
							<Button
								type="button"
								variant={exportFormat === "json" ? "default" : "outline"}
								size="sm"
								onClick={() => setExportFormat("json")}
								className="flex-1 gap-2"
							>
								<FileJson className="h-4 w-4" />
								JSON
							</Button>
						</div>
					</div>

					{/* Status Filter */}
					<div className="space-y-2">
						<Label>Status Filter</Label>
						<Select
							value={status}
							onValueChange={setStatus}
						>
							<SelectTrigger>
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent>
								{statusOptions[exportType].map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Range */}
					<div className="space-y-2">
						<Label>Date Range (Optional)</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="w-full justify-start text-left font-normal"
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
											</>
										) : (
											format(dateRange.from, "MMM d, yyyy")
										)
									) : (
										<span className="text-muted-foreground">Select date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start"
							>
								<Calendar
									mode="range"
									selected={dateRange}
									onSelect={setDateRange}
									numberOfMonths={2}
								/>
							</PopoverContent>
						</Popover>
						{dateRange && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setDateRange(undefined)}
								className="text-xs"
							>
								Clear dates
							</Button>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={handleExport}
						disabled={isLoading}
						className="gap-2"
					>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
						Export
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
