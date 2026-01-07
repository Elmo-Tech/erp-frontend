"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceDashboard } from "@/features/dashboard/components/AttendanceDashboard";
import { useAttendanceHistory, useAttendanceSummary } from "@/features/hr/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, AlertCircle, TrendingDown, Star, Timer } from "lucide-react";
import { formatTimeDisplay, formatDateDisplay } from "@/lib/dateUtils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AttendancePage() {
	const currentDate = new Date();
	const [year, setYear] = useState(currentDate.getFullYear());
	const [month, setMonth] = useState(currentDate.getMonth() + 1);

	const { data: historyData, isLoading, error } = useAttendanceHistory();
	const { data: summary } = useAttendanceSummary(year, month);

	const formatMinutes = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours === 0) return `${mins}m`;
		return `${hours}h ${mins}m`;
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Attendance</h1>
				<p className="text-muted-foreground">Track your daily attendance and work hours</p>
			</div>

			{/* Summary Cards */}
			{summary && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Days Present</span>
							</div>
							<p className="text-2xl font-bold mt-1">
								{summary.totalDays}/{summary.expectedWorkDays}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<Timer className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Hours Worked</span>
							</div>
							<p className="text-2xl font-bold mt-1">{summary.totalWorkedHours}h</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<Star className="h-4 w-4 text-yellow-500" />
								<span className="text-sm text-muted-foreground">Grace Days</span>
							</div>
							<p className="text-2xl font-bold mt-1">
								{summary.graceDaysUsed}/{summary.graceDaysUsed + summary.graceDaysRemaining}
							</p>
							<Progress
								value={(summary.graceDaysUsed / (summary.graceDaysUsed + summary.graceDaysRemaining)) * 100}
								className="h-1 mt-2"
							/>
						</CardContent>
					</Card>
					{summary.deductionAmount > 0 && (
						<Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
							<CardContent className="pt-6">
								<div className="flex items-center gap-2">
									<TrendingDown className="h-4 w-4 text-red-500" />
									<span className="text-sm text-red-600">Deductions</span>
								</div>
								<p className="text-2xl font-bold mt-1 text-red-600">{summary.deductionAmount.toLocaleString()}</p>
								<p className="text-xs text-red-500">{formatMinutes(summary.totalDeductionMinutes)} late</p>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Today's Status Widget */}
				<div className="lg:col-span-1">
					<AttendanceDashboard />
				</div>

				{/* Attendance History */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-5 w-5" />
										Attendance History
									</CardTitle>
									<CardDescription>Your recent attendance records</CardDescription>
								</div>
								<div className="flex gap-2">
									<Select
										value={month.toString()}
										onValueChange={(v) => setMonth(parseInt(v))}
									>
										<SelectTrigger className="w-[120px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{MONTHS.map((m, i) => (
												<SelectItem
													key={i}
													value={(i + 1).toString()}
												>
													{m}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={year.toString()}
										onValueChange={(v) => setYear(parseInt(v))}
									>
										<SelectTrigger className="w-[90px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{[2024, 2025, 2026].map((y) => (
												<SelectItem
													key={y}
													value={y.toString()}
												>
													{y}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{error ? (
								<div className="flex items-center gap-2 text-destructive py-8 justify-center">
									<AlertCircle className="h-5 w-5" />
									<span>Failed to load attendance history</span>
								</div>
							) : isLoading ? (
								<div className="space-y-3">
									{[1, 2, 3, 4, 5].map((i) => (
										<Skeleton
											key={i}
											className="h-12 w-full"
										/>
									))}
								</div>
							) : !historyData?.attendances || historyData.attendances.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
									<Clock className="h-12 w-12 mb-4" />
									<p>No attendance records yet</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Clock In</TableHead>
											<TableHead>Clock Out</TableHead>
											<TableHead>Late</TableHead>
											<TableHead>Deduction</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{historyData.attendances.map((record) => (
											<TableRow key={record.attendanceId}>
												<TableCell className="font-medium">{formatDateDisplay(record.date)}</TableCell>
												<TableCell>{formatTimeDisplay(record.clockIn)}</TableCell>
												<TableCell>{formatTimeDisplay(record.clockOut)}</TableCell>
												<TableCell className={record.lateMinutes > 0 ? "text-orange-500" : ""}>{record.lateMinutes > 0 ? formatMinutes(record.lateMinutes) : "-"}</TableCell>
												<TableCell className={record.deductionMinutes > 0 ? "text-red-500" : ""}>{record.deductionMinutes > 0 ? formatMinutes(record.deductionMinutes) : "-"}</TableCell>
												<TableCell>
													{record.usedGraceDay ? (
														<Badge
															variant="outline"
															className="text-yellow-600 border-yellow-300"
														>
															Grace Day
														</Badge>
													) : record.deductionMinutes > 0 ? (
														<Badge variant="destructive">Deducted</Badge>
													) : record.lateMinutes > 0 ? (
														<Badge variant="secondary">Late</Badge>
													) : (
														<Badge variant="default">On Time</Badge>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
