"use client";

import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, LogOut, CheckCircle2, AlertCircle, CalendarDays, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { cn } from "@/shared/lib/utils";
import { useAttendanceSummary, useMyAttendance, useTodayAttendance, useCheckOutMutation, useUpdateAttendance } from "@/features/hr/model/use-hr-actions";
import type { AttendanceRecord, AttendanceStatus } from "@/entities/hr/model/types";
import { useAuthStore } from "@/entities/user/model/auth.store";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
    if (!iso) return "—";
    return format(new Date(iso), "hh:mm a");
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "dd MMM yyyy");
}

function formatMinutes(value: number | null | undefined): string {
    if (value == null) return "—";
    return `${Math.floor(value / 60)}h ${value % 60}m`;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    present: { label: "Present", variant: "default" },
    late: { label: "Late", variant: "secondary" },
    absent: { label: "Absent", variant: "destructive" },
    excused: { label: "Excused", variant: "outline" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Today's attendance hero card
// ─────────────────────────────────────────────────────────────────────────────

function TodayAttendanceCard() {
    const { data: today, isLoading } = useTodayAttendance();
    const checkOut = useCheckOutMutation();

    const handleCheckOut = () => {
        checkOut.mutate(undefined, {
            onSuccess: () => toast.success("Checked out successfully"),
            onError: () => toast.error("Failed to check out. Please try again."),
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-36" />
                </CardContent>
            </Card>
        );
    }

    // Not clocked in
    if (!today) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        Today&apos;s Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm">Not clocked in yet for today.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Clocked in — awaiting check-out
    if (today.isClockedIn) {
        return (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Today&apos;s Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">Clocked in at</p>
                        <p className="text-2xl font-bold tabular-nums text-green-700 dark:text-green-300">{formatTime(today.clockIn)}</p>
                        {today.isLate && (
                            <Badge variant="secondary" className="w-fit text-xs">
                                Late by {today.lateMinutes} min
                            </Badge>
                        )}
                    </div>
                    <Button size="lg" variant="destructive" className="shrink-0 gap-2" onClick={handleCheckOut} disabled={checkOut.isPending}>
                        <LogOut className="h-4 w-4" />
                        {checkOut.isPending ? "Checking out…" : "Check Out"}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Fully checked out
    return (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Today&apos;s Attendance
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-6">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Clock In</p>
                    <p className="text-lg font-semibold tabular-nums">{formatTime(today.clockIn)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Clock Out</p>
                    <p className="text-lg font-semibold tabular-nums">{formatTime(today.clockOut)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Worked</p>
                    <p className="text-lg font-semibold tabular-nums">{today.totalWorkedMinutes != null ? `${Math.floor(today.totalWorkedMinutes / 60)}h ${today.totalWorkedMinutes % 60}m` : "—"}</p>
                </div>
                <div className="flex items-end">
                    <Badge variant={STATUS_CONFIG[today.status]?.variant ?? "outline"} className="capitalize">
                        {STATUS_CONFIG[today.status]?.label ?? today.status}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Historical table columns
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(canManageAttendance: boolean, onTreatment: (record: AttendanceRecord, treatment: "deduct" | "grace" | "excused") => void): Column<AttendanceRecord>[] {
    return [
        {
            key: "user.name",
            header: "User",
            render: (rec) => <span className="whitespace-nowrap text-sm">{rec.user?.name || "Unknown"}</span>,
        },
        {
            key: "date",
            header: "Date",
            render: (rec) => <span className="whitespace-nowrap text-sm">{formatDate(rec.date)}</span>,
        },
        {
            key: "clockIn",
            header: "Clock In",
            render: (rec) => <span className="text-sm tabular-nums">{formatTime(rec.clockIn)}</span>,
        },
        {
            key: "clockOut",
            header: "Clock Out",
            render: (rec) => <span className="text-sm tabular-nums">{formatTime(rec.clockOut)}</span>,
        },
        {
            key: "status",
            header: "Status",
            render: (rec) => {
                const cfg = STATUS_CONFIG[rec.status] ?? {
                    label: rec.status,
                    variant: "outline" as const,
                };
                return (
                    <Badge variant={cfg.variant} className="capitalize text-xs">
                        {cfg.label}
                    </Badge>
                );
            },
        },
        {
            key: "worked",
            header: "Actual",
            className: "text-right",
            render: (rec) => <span className={cn("text-sm tabular-nums", !rec.actualWorkedMinutes && "text-muted-foreground")}>{formatMinutes(rec.actualWorkedMinutes)}</span>,
        },
        {
            key: "stopped",
            header: "Stopped",
            className: "text-right",
            render: (rec) => <span className="text-sm tabular-nums text-muted-foreground">{formatMinutes(rec.stoppedMinutes)}</span>,
        },
        {
            key: "late",
            header: "Late",
            className: "text-right",
            render: (rec) => <span className={cn("text-sm tabular-nums", !rec.lateMinutes && "text-muted-foreground")}>{rec.lateMinutes ? `${rec.lateMinutes}m` : "—"}</span>,
        },
        {
            key: "admin",
            header: "",
            className: "text-right",
            render: (rec) =>
                canManageAttendance ? (
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onTreatment(rec, "deduct")}>
                            Deduct
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onTreatment(rec, "grace")}>
                            Grace
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onTreatment(rec, "excused")}>
                            Excuse
                        </Button>
                    </div>
                ) : null,
        },
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function MyAttendanceWidget() {
    const { data, isLoading, error } = useMyAttendance();
    const weekSummary = useAttendanceSummary("week");
    const monthSummary = useAttendanceSummary("month");
    const canManageAttendance = useAuthStore((s) => s.hasPermission("manage_attendance"));
    const updateAttendance = useUpdateAttendance();
    const records = data?.data ?? [];
    const columns = buildColumns(canManageAttendance, (record, lateTreatment) => {
        updateAttendance.mutate(
            { id: record.id, payload: { lateTreatment } },
            {
                onSuccess: () => toast.success("Attendance updated"),
                onError: () => toast.error("Failed to update attendance"),
            },
        );
    });

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Attendance</h1>
                <p className="text-sm text-muted-foreground">Track your daily clock-in/out records and attendance status.</p>
            </div>

            <TodayAttendanceCard />

            <div className="grid gap-3 md:grid-cols-2">
                <SummaryCard title="This week" summary={weekSummary.data} isLoading={weekSummary.isLoading} />
                <SummaryCard title="This month" summary={monthSummary.data} isLoading={monthSummary.isLoading} />
            </div>

            <DataTable<AttendanceRecord>
                title="Attendance History"
                titleBadge={data ? String(records.length) : undefined}
                columns={columns}
                data={records}
                keyExtractor={(rec) => rec.id}
                isLoading={isLoading}
                error={error}
                emptyState={{
                    icon: CalendarDays,
                    title: "No attendance records",
                    description: "Your attendance history will appear here once records are available.",
                }}
            />
        </section>
    );
}

function SummaryCard({ title, summary, isLoading }: { title: string; summary?: { expectedMinutes: number; actualWorkedMinutes: number; stoppedMinutes: number; lateMinutes: number }; isLoading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-xs text-muted-foreground">Actual / Expected</p>
                            <p className="text-sm font-semibold tabular-nums">
                                {formatMinutes(summary?.actualWorkedMinutes)} / {formatMinutes(summary?.expectedMinutes)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Stopped / Late</p>
                            <p className="text-sm font-semibold tabular-nums">
                                {formatMinutes(summary?.stoppedMinutes)} / {summary?.lateMinutes ?? 0}m
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
