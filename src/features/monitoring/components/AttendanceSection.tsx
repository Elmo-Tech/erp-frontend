import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceData } from "../types/employeeReview";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface AttendanceSectionProps {
	attendance: AttendanceData;
}

export function AttendanceSection({ attendance }: AttendanceSectionProps) {
	return (
		<div className="space-y-6">
			{/* Attendance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Days</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{attendance.totalDays}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Late Days</CardTitle>
						<AlertCircle className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{attendance.lateDays}</div>
						<p className="text-xs text-muted-foreground">{attendance.totalLateMinutes} minutes total</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Idle Time</CardTitle>
						<Clock className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{(attendance.totalIdleMinutes / 60).toFixed(1)}h</div>
						<p className="text-xs text-muted-foreground">{attendance.totalIdleMinutes} minutes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Idle/Day</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{attendance.averageIdlePerDay.toFixed(1)}m</div>
					</CardContent>
				</Card>
			</div>

			{/* Attendance Records */}
			<Card>
				<CardHeader>
					<CardTitle>Attendance Records</CardTitle>
				</CardHeader>
				<CardContent>
					{attendance.attendanceList.length > 0 ? (
						<div className="max-h-96 overflow-y-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Clock In</TableHead>
										<TableHead>Clock Out</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Late (min)</TableHead>
										<TableHead className="text-right">Idle (min)</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{attendance.attendanceList.map((record, index) => (
										<TableRow key={index}>
											<TableCell className="font-medium">{record.date}</TableCell>
											<TableCell>
												{record.clockIn
													? new Date(record.clockIn).toLocaleTimeString("en-US", {
															hour: "2-digit",
															minute: "2-digit",
													  })
													: "N/A"}
											</TableCell>
											<TableCell>
												{record.clockOut
													? new Date(record.clockOut).toLocaleTimeString("en-US", {
															hour: "2-digit",
															minute: "2-digit",
													  })
													: "N/A"}
											</TableCell>
											<TableCell>{record.isLate ? <Badge variant="destructive">Late</Badge> : <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">On Time</Badge>}</TableCell>
											<TableCell className="text-right">{record.lateMinutes > 0 ? <span className="text-orange-600 font-medium">{record.lateMinutes}</span> : <span className="text-muted-foreground">0</span>}</TableCell>
											<TableCell className="text-right">
												{record.idleMinutes > 0 ? (
													<span className={record.idleMinutes > 120 ? "text-red-600 font-medium" : "text-muted-foreground"}>{record.idleMinutes}</span>
												) : (
													<span className="text-muted-foreground">0</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<p className="text-center text-muted-foreground py-8">No attendance records found for this period</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
