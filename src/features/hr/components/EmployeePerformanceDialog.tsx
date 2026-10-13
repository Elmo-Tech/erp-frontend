"use client";

import { useState } from "react";
import { FormDialog } from "@/components/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Star, AlertTriangle, FolderKanban, TrendingDown } from "lucide-react";
import { useEmployeePerformance } from "../hooks";
import type { Employee } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeWorkTarget } from "./EmployeeHrSummary";

interface EmployeePerformanceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee: Employee | null;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function EmployeePerformanceDialog({ open, onOpenChange, employee }: EmployeePerformanceDialogProps) {
	const currentDate = new Date();
	const [year, setYear] = useState(currentDate.getFullYear());
	const [month, setMonth] = useState(currentDate.getMonth() + 1);

	const { data: performance, isLoading } = useEmployeePerformance(employee?.userId || 0, year, month, open && !!employee);

	const formatMinutes = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours === 0) return `${mins}m`;
		return `${hours}h ${mins}m`;
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Employee Performance"
			showFooter={false}
			size="xxl"
		>
			{employee && (
				<div className="space-y-4">
					{/* Employee Header */}
					<div className="flex items-center gap-4 pb-4 border-b">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={employee.avatar}
								alt={employee.name}
							/>
							<AvatarFallback className="text-lg">{employee.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="text-lg font-semibold">{employee.name}</h3>
							<p className="text-muted-foreground">{employee.email}</p>
							{employee.role && <Badge variant="outline">{employee.role}</Badge>}
						</div>
					</div>

					{/* Period Selector */}
					<div className="flex gap-2">
						<Select
							value={month.toString()}
							onValueChange={(v) => setMonth(parseInt(v))}
						>
							<SelectTrigger className="w-[140px]">
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
							<SelectTrigger className="w-[100px]">
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

					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					) : performance ? (
						<div className="grid gap-4">
							<EmployeeWorkTarget commitment={performance.workCommitment} />
							{/* Attendance Stats */}
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm flex items-center gap-2">
										<Clock className="h-4 w-4" />
										Attendance
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Days Present</span>
											<p className="font-medium">{performance.attendance.totalDays} days</p>
										</div>
										<div>
											<span className="text-muted-foreground">Total Late</span>
											<p className="font-medium text-orange-600">{formatMinutes(performance.attendance.totalLateMinutes)}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Idle Time</span>
											<p className="font-medium text-yellow-600">{formatMinutes(performance.attendance.totalIdleMinutes)}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Grace Days</span>
											<p className="font-medium">
												{performance.attendance.graceDaysUsed} used / {performance.attendance.graceDaysRemaining + performance.attendance.graceDaysUsed} total
											</p>
										</div>
									</div>
									<div>
										<div className="flex justify-between text-sm mb-1">
											<span>Grace Days Used</span>
											<span>
												{performance.attendance.graceDaysUsed}/{performance.attendance.graceDaysRemaining + performance.attendance.graceDaysUsed}
											</span>
										</div>
										<Progress
											value={(performance.attendance.graceDaysUsed / (performance.attendance.graceDaysRemaining + performance.attendance.graceDaysUsed)) * 100}
											className="h-2"
										/>
									</div>
								</CardContent>
							</Card>

							{/* Deductions */}
							{performance.deductions.totalMinutes > 0 && (
								<Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
											<TrendingDown className="h-4 w-4" />
											Deductions
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">Time Deducted</span>
												<p className="font-medium text-red-600">{formatMinutes(performance.deductions.totalMinutes)}</p>
											</div>
											<div>
												<span className="text-muted-foreground">Amount</span>
												<p className="font-medium text-red-600">{performance.deductions.totalAmount.toLocaleString()}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Performance */}
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm flex items-center gap-2">
										<Star className="h-4 w-4 text-yellow-500" />
										Performance
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Points This Month</span>
											<p className="font-medium text-green-600">+{performance.performance.pointsEarned}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Total Points</span>
											<p className="font-medium">{performance.performance.totalPoints}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Projects */}
							{performance.performance.projects.length > 0 && (
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<FolderKanban className="h-4 w-4" />
											Projects Worked On ({performance.performance.projectsWorkedOn})
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{performance.performance.projects.map((project) => (
												<Badge
													key={project.projectId}
													variant="secondary"
												>
													{project.title}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							<AlertTriangle className="h-8 w-8 mx-auto mb-2" />
							<p>No performance data available</p>
						</div>
					)}
				</div>
			)}
		</FormDialog>
	);
}
