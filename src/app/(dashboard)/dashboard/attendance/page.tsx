"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceDashboard } from "@/features/dashboard/components/AttendanceDashboard";
import { useAttendanceHistory } from "@/features/dashboard/hooks/useAttendance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertCircle } from "lucide-react";

export default function AttendancePage() {
	const { data: historyData, isLoading, error } = useAttendanceHistory();

	const formatTime = (timeString: string | null): string => {
		if (!timeString) return "--:--";
		try {
			const date = new Date(timeString);
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
		} catch {
			return "--:--";
		}
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Attendance</h1>
				<p className="text-muted-foreground">Track your daily attendance and work hours</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Today's Status Widget */}
				<div className="lg:col-span-1">
					<AttendanceDashboard />
				</div>

				{/* Attendance History */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Attendance History
							</CardTitle>
							<CardDescription>Your recent attendance records</CardDescription>
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
							) : !historyData?.records || historyData.records.length === 0 ? (
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
											<TableHead>Worked</TableHead>
											<TableHead>Idle</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{historyData.records.map((record) => (
											<TableRow key={record.attendanceId}>
												<TableCell className="font-medium">{formatDate(record.date)}</TableCell>
												<TableCell>{formatTime(record.clockIn)}</TableCell>
												<TableCell>{formatTime(record.clockOut)}</TableCell>
												<TableCell className="text-green-600">{record.workedDuration}</TableCell>
												<TableCell className="text-orange-500">{record.idleDuration}</TableCell>
												<TableCell>{record.lateMinutes > 0 ? <Badge variant="destructive">Late {record.lateMinutes}m</Badge> : <Badge variant="secondary">On Time</Badge>}</TableCell>
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
