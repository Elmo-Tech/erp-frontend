"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { format, startOfMonth } from "date-fns";
import { CalendarCheck, Check, ChevronDown, CircleAlert, Clock3, RotateCcw, Search, ShieldCheck, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { AttendanceFilters, AttendanceRecord, AttendanceStatus } from "@/entities/hr/model/types";
import { useAttendanceRecords, useUpdateAttendance } from "@/features/hr/model/use-hr-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
	present: "Present",
	late: "Late",
	absent: "Absent",
	excused: "Excused",
};

const STATUS_CLASSES: Record<AttendanceStatus, string> = {
	present: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
	late: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
	absent: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
	excused: "border-border bg-muted text-muted-foreground",
};

function initialFilters(): AttendanceFilters {
	const today = new Date();

	return {
		from: format(startOfMonth(today), "yyyy-MM-dd"),
		to: format(today, "yyyy-MM-dd"),
		page: 1,
	};
}

export function AttendanceManagementWidget() {
	const [filters, setFilters] = useState<AttendanceFilters>(initialFilters);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search.trim());
	const queryFilters = useMemo(() => ({ ...filters, search: deferredSearch || undefined }), [deferredSearch, filters]);
	const attendanceQuery = useAttendanceRecords(queryFilters);
	const updateAttendance = useUpdateAttendance();
	const records = attendanceQuery.data?.data ?? [];
	const counts = attendanceCounts(records);
	const columns = attendanceColumns((record, treatment) => {
		updateAttendance.mutate(
			{ id: record.id, payload: { lateTreatment: treatment } },
			{
				onSuccess: () => toast.success("Attendance treatment updated"),
				onError: (error) => toast.error(attendanceErrorMessage(error)),
			},
		);
	});

	const updateFilter = <Key extends keyof AttendanceFilters>(key: Key, value: AttendanceFilters[Key]) => {
		setFilters((current) => ({ ...current, [key]: value, page: 1 }));
	};

	return (
		<section className="space-y-5">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Attendance Management</h1>
				<p className="text-sm text-muted-foreground">Review exceptions, apply late treatments, and open an employee’s full performance report.</p>
			</div>

			<AttendanceSnapshot counts={counts} total={records.length} />

			<DataTable<AttendanceRecord>
				title="Attendance records"
				titleBadge={attendanceQuery.data ? String(attendanceQuery.data.meta.total) : undefined}
				columns={columns}
				data={records}
				keyExtractor={(record) => record.id}
				isLoading={attendanceQuery.isLoading}
				error={attendanceQuery.error}
				filters={
					<AttendanceFiltersBar
						filters={filters}
						search={search}
						onSearchChange={(value) => {
							setSearch(value);
							setFilters((current) => ({ ...current, page: 1 }));
						}}
						onFilterChange={updateFilter}
						onReset={() => {
							setSearch("");
							setFilters(initialFilters());
						}}
					/>
				}
				pagination={attendanceQuery.data ? {
					total: attendanceQuery.data.meta.total,
					count: attendanceQuery.data.meta.count,
					perPage: attendanceQuery.data.meta.per_page,
					currentPage: attendanceQuery.data.meta.current_page,
					totalPages: attendanceQuery.data.meta.last_page,
				} : undefined}
				onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
				emptyState={{
					icon: CalendarCheck,
					title: "No matching attendance records",
					description: "Try a wider date range or clear one of the filters.",
				}}
			/>
		</section>
	);
}

function AttendanceFiltersBar({ filters, search, onSearchChange, onFilterChange, onReset }: {
	filters: AttendanceFilters;
	search: string;
	onSearchChange: (value: string) => void;
	onFilterChange: <Key extends keyof AttendanceFilters>(key: Key, value: AttendanceFilters[Key]) => void;
	onReset: () => void;
}) {
	return (
		<div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_160px_160px_160px_auto]">
			<label className="relative">
				<span className="sr-only">Search employee</span>
				<Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
				<Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search employee…" className="pl-9" />
			</label>
			<Select value={filters.status ?? "all"} onValueChange={(value) => onFilterChange("status", value === "all" ? undefined : value as AttendanceStatus)}>
				<SelectTrigger className="w-full"><SelectValue placeholder="All statuses" /></SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All statuses</SelectItem>
					{Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
				</SelectContent>
			</Select>
			<Input type="date" aria-label="From date" value={filters.from ?? ""} onChange={(event) => onFilterChange("from", event.target.value || undefined)} />
			<Input type="date" aria-label="To date" value={filters.to ?? ""} onChange={(event) => onFilterChange("to", event.target.value || undefined)} />
			<Button type="button" variant="outline" size="sm" className="h-9" onClick={onReset}><RotateCcw className="size-3.5" />Reset</Button>
		</div>
	);
}

function AttendanceSnapshot({ counts, total }: { counts: Record<AttendanceStatus | "grace", number>; total: number }) {
	const segments = [
		{ label: "Present", value: counts.present, className: "bg-emerald-500", icon: Check },
		{ label: "Late", value: counts.late, className: "bg-amber-500", icon: Clock3 },
		{ label: "Absent", value: counts.absent, className: "bg-red-500", icon: UserRoundX },
		{ label: "Grace used", value: counts.grace, className: "bg-primary", icon: ShieldCheck },
	] as const;

	return (
		<div className="overflow-hidden rounded-lg border bg-card">
			<div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">Current page snapshot · {total} records</div>
			<div className="grid divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0">
				{segments.map((segment) => {
					const Icon = segment.icon;
					return <div key={segment.label} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-xs text-muted-foreground">{segment.label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{segment.value}</p></div><Icon className="size-4 text-muted-foreground" /></div>;
				})}
			</div>
			<div className="flex h-1.5 bg-muted" aria-label="Attendance status distribution">
				{segments.slice(0, 3).map((segment) => <span key={segment.label} className={segment.className} style={{ width: `${total ? (segment.value / total) * 100 : 0}%` }} />)}
			</div>
		</div>
	);
}

function attendanceColumns(onTreatment: (record: AttendanceRecord, treatment: "deduct" | "grace" | "excused") => void): Column<AttendanceRecord>[] {
	return [
		{ key: "employee", header: "Employee", render: (record) => <EmployeeCell record={record} /> },
		{ key: "date", header: "Date", render: (record) => <span className="whitespace-nowrap text-sm tabular-nums">{format(new Date(`${record.date}T00:00:00`), "dd MMM yyyy")}</span> },
		{ key: "schedule", header: "Schedule", render: (record) => <div className="whitespace-nowrap text-sm tabular-nums"><p>{formatTime(record.clockIn)} – {record.isClockedIn ? "Active" : formatTime(record.clockOut)}</p><p className="text-xs text-muted-foreground">Expected {formatTime(record.expectedClockIn)}</p></div> },
		{ key: "worked", header: "Worked", className: "text-right", render: (record) => <div className="text-right text-sm tabular-nums"><p className="font-medium">{formatMinutes(record.actualWorkedMinutes)}</p><p className="text-xs text-muted-foreground">of {formatMinutes(record.expectedWorkedMinutes)}</p></div> },
		{ key: "status", header: "Status", render: (record) => <div className="space-y-1"><Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[record.status])}>{STATUS_LABELS[record.status]}</Badge>{record.lateMinutes ? <p className="text-xs text-amber-700 dark:text-amber-300">{record.lateMinutes}m late</p> : null}</div> },
		{ key: "treatment", header: "Treatment", render: (record) => <TreatmentBadge record={record} /> },
		{ key: "actions", header: "", className: "text-right", render: (record) => <TreatmentMenu record={record} onTreatment={onTreatment} /> },
	];
}

function EmployeeCell({ record }: { record: AttendanceRecord }) {
	const name = record.user?.name ?? "Unknown employee";
	return (
		<div className="flex min-w-44 items-center gap-3">
			<Avatar className="size-8"><AvatarImage src={record.user?.avatar ?? undefined} /><AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
			<div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p>{record.user ? <Link href={`/dashboard/hr/admin/reports/${record.user.id}`} className="text-xs text-primary hover:underline">Open 360 report</Link> : null}</div>
		</div>
	);
}

function TreatmentBadge({ record }: { record: AttendanceRecord }) {
	if (record.usedGraceDay) return <Badge variant="outline" className="text-xs text-primary"><ShieldCheck className="size-3" />Grace day</Badge>;
	if (record.status === "excused") return <Badge variant="outline" className="text-xs"><Check className="size-3" />Excused</Badge>;
	if (record.deductionMinutes) return <Badge variant="outline" className="text-xs text-destructive"><CircleAlert className="size-3" />{record.deductionMinutes}m deducted</Badge>;
	return <span className="text-xs text-muted-foreground">No action</span>;
}

function TreatmentMenu({ record, onTreatment }: { record: AttendanceRecord; onTreatment: (record: AttendanceRecord, treatment: "deduct" | "grace" | "excused") => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm">Manage<ChevronDown className="size-3.5" /></Button></DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem disabled={!record.lateMinutes || record.usedGraceDay} onClick={() => onTreatment(record, "grace")}><ShieldCheck />Use grace day</DropdownMenuItem>
				<DropdownMenuItem disabled={!record.lateMinutes || Boolean(record.deductionMinutes)} onClick={() => onTreatment(record, "deduct")}><Clock3 />Apply deduction</DropdownMenuItem>
				<DropdownMenuItem disabled={record.status === "excused"} onClick={() => onTreatment(record, "excused")}><Check />Mark excused</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function attendanceCounts(records: AttendanceRecord[]) {
	return records.reduce<Record<AttendanceStatus | "grace", number>>((counts, record) => {
		counts[record.status] += 1;
		if (record.usedGraceDay) counts.grace += 1;
		return counts;
	}, { present: 0, late: 0, absent: 0, excused: 0, grace: 0 });
}

function formatTime(value: string | null) {
	if (!value) return "—";
	const date = value.includes("T") ? new Date(value) : new Date(`2000-01-01T${value}`);
	return format(date, "hh:mm a");
}

function formatMinutes(value: number | null) {
	if (value == null) return "—";
	return `${Math.floor(value / 60)}h ${value % 60}m`;
}

function attendanceErrorMessage(error: Error) {
	if (!isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) return "Could not update attendance.";
	return error.response?.data.errors?.lateTreatment?.[0] ?? error.response?.data.message ?? "Could not update attendance.";
}
