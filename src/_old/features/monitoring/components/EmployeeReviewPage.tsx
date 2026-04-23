/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Download, TrendingUp, CheckSquare, Clock, Star, Folder } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useEmployeeReview } from "../hooks/useEmployeeReview";
import { OverviewCards } from "./OverviewCards";
import { TimeTrackingChart } from "./TimeTrackingChart";
import { TasksSection } from "./TasksSection";
import { ProjectsSection } from "./ProjectsSection";
import { AttendanceSection } from "./AttendanceSection";
import { ProductivityMetrics } from "./ProductivityMetrics";
import { PointsSection } from "./PointsSection";
import { DeliveryLogsSection } from "./DeliveryLogsSection";
import { GracePeriodSection } from "./GracePeriodSection";
import { DeductionsSection } from "./DeductionsSection";
import { TaskPerformanceSection } from "./TaskPerformanceSection";
import { QualityMetricsSection } from "./QualityMetricsSection";
import { ProductivityTrendsSection } from "./ProductivityTrendsSection";
import { toast } from "sonner";
import axios from "@/shared/api/base";

interface User {
	id: number;
	name: string;
}

interface EmployeeReviewPageProps {
	users: User[];
}

export function EmployeeReviewPage({ users }: EmployeeReviewPageProps) {
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [dateFrom, setDateFrom] = useState<Date>();
	const [dateTo, setDateTo] = useState<Date>();
	const [isExporting, setIsExporting] = useState(false);
	const [pointsPage, setPointsPage] = useState(1);

	useEffect(() => {
		setPointsPage(1);
	}, [selectedUserId, dateFrom, dateTo]);

	const { data, isLoading, error } = useEmployeeReview({
		userId: selectedUserId!,
		dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
		dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
		page: pointsPage,
		perPage: 50,
	});

	const reviewData = data?.data;

	const handleExport = async () => {
		if (!selectedUserId) {
			toast.error("Please select an employee first");
			return;
		}

		setIsExporting(true);
		try {
			const params = new URLSearchParams();
			if (dateFrom) params.append("dateFrom", format(dateFrom, "yyyy-MM-dd"));
			if (dateTo) params.append("dateTo", format(dateTo, "yyyy-MM-dd"));

			const response = await axios.get(`/admin/stats/employee-review/${selectedUserId}/export?${params}`, {
				responseType: "blob",
			});

			// Create download link
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;

			// Get employee name for filename
			const employeeName = users.find((u) => u.id === selectedUserId)?.name || "employee";
			const dateRange = dateFrom && dateTo ? `_${format(dateFrom, "yyyy-MM-dd")}_to_${format(dateTo, "yyyy-MM-dd")}` : "";

			link.setAttribute("download", `employee_review_${employeeName.replace(/\s+/g, "_")}${dateRange}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			toast.success("Report exported successfully");
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export report");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Employee Performance Review</h1>
					<p className="text-muted-foreground mt-2">Comprehensive review of employee work and performance</p>
				</div>
				{selectedUserId && (
					<Button
						onClick={handleExport}
						disabled={isExporting}
						className="flex items-center gap-2"
					>
						{isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
						{isExporting ? "Exporting..." : "Export Report"}
					</Button>
				)}
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Select Employee & Period</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Employee Select */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Employee</label>
							<Select
								value={selectedUserId?.toString()}
								onValueChange={(value) => setSelectedUserId(Number(value))}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select employee" />
								</SelectTrigger>
								<SelectContent>
									{users.map((user) => (
										<SelectItem
											key={user.id}
											value={user.id.toString()}
										>
											{user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Date From */}
						<div className="space-y-2">
							<label className="text-sm font-medium">From Date</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={dateFrom}
										onSelect={setDateFrom}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Date To */}
						<div className="space-y-2">
							<label className="text-sm font-medium">To Date</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateTo ? format(dateTo, "PPP") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={dateTo}
										onSelect={setDateTo}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			)}

			{/* Error State */}
			{error && (
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive text-center">Failed to load employee review. Please try again.</p>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{!selectedUserId && !isLoading && (
				<Card>
					<CardContent className="pt-6">
						<p className="text-muted-foreground text-center">Please select an employee to view their performance review</p>
					</CardContent>
				</Card>
			)}

			{/* Review Data - Organized into sections */}
			{reviewData && (
				<div className="space-y-8">
					{/* Section 1: Employee Info & Overview */}
					<div className="space-y-4">
						{/* Employee Info */}
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-4">
									{reviewData.employee.avatar ? (
										<img
											src={reviewData.employee.avatar}
											alt={reviewData.employee.name}
											className="h-16 w-16 rounded-full object-cover"
										/>
									) : (
										<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
											<span className="text-2xl font-bold text-primary">{reviewData.employee.name.charAt(0)}</span>
										</div>
									)}
									<div>
										<h2 className="text-2xl font-bold">{reviewData.employee.name}</h2>
										<p className="text-muted-foreground">{reviewData.employee.email}</p>
										{reviewData.employee.specialization && <p className="text-sm text-muted-foreground capitalize">{reviewData.employee.specialization}</p>}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Overview Cards */}
						<OverviewCards overview={reviewData.overview} />
					</div>

					{/* Section 2: Attendance & Punctuality */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<CalendarIcon className="h-5 w-5" />
							Attendance & Punctuality
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{reviewData.gracePeriod && <GracePeriodSection data={reviewData.gracePeriod} />}
							{reviewData.deductions && <DeductionsSection data={reviewData.deductions} />}
						</div>
						{reviewData.attendance && <AttendanceSection attendance={reviewData.attendance} />}
					</div>

					{/* Section 3: Performance Metrics */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Performance Metrics
						</h3>
						<ProductivityMetrics productivity={reviewData.productivity} />
						{reviewData.trends && <ProductivityTrendsSection data={reviewData.trends} />}
					</div>

					{/* Section 4: Task Analysis */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<CheckSquare className="h-5 w-5" />
							Task Analysis
						</h3>
						{reviewData.taskPerformance && <TaskPerformanceSection data={reviewData.taskPerformance} />}
						{reviewData.qualityMetrics && <QualityMetricsSection data={reviewData.qualityMetrics} />}
						<TasksSection tasks={reviewData.tasks} />
						<DeliveryLogsSection tasks={reviewData.tasks} />
					</div>

					{/* Section 5: Time Tracking */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Time Tracking
						</h3>
						<TimeTrackingChart timeTracking={reviewData.timeTracking} />
					</div>

					{/* Section 6: Points */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Star className="h-5 w-5" />
							Points
						</h3>
						<PointsSection
							points={reviewData.points}
							onPageChange={setPointsPage}
						/>
					</div>

					{/* Section 7: Projects */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Folder className="h-5 w-5" />
							Projects
						</h3>
						<ProjectsSection projects={reviewData.projects} />
					</div>
				</div>
			)}
		</div>
	);
}
