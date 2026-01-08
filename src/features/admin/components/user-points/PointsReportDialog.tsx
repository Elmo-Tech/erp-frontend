/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/dialogs/FormDialog";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { DataTable } from "@/components/shared/data-display/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePointsReport } from "../../hooks/useUserPoints";
import { PointsReportFilters } from "../../types/userPoints";
import { Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react";

const formSchema = z.object({
	dateFrom: z.string().min(1, "Start date is required"),
	dateTo: z.string().min(1, "End date is required"),
	userId: z.string().optional(),
	type: z.enum(["all", "manual", "automatic"]),
});

type FormValues = z.infer<typeof formSchema>;

interface PointsReportDialogProps {
	open: boolean;
	onClose: () => void;
}

export function PointsReportDialog({ open, onClose }: PointsReportDialogProps) {
	const [filters, setFilters] = useState<PointsReportFilters>({});
	const [currentPage, setCurrentPage] = useState(1);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			dateFrom: "",
			dateTo: "",
			userId: "",
			type: "all",
		},
	});

	const { data: reportData, isLoading } = usePointsReport(filters, currentPage, 20);

	const onSubmit = (values: FormValues) => {
		const reportFilters: PointsReportFilters = {
			dateFrom: values.dateFrom,
			dateTo: values.dateTo,
			type: values.type === "all" ? undefined : values.type,
			userId: values.userId ? parseInt(values.userId) : undefined,
		};
		setFilters(reportFilters);
		setCurrentPage(1);
	};

	const typeOptions = [
		{ value: "all", label: "All Activities" },
		{ value: "manual", label: "Manual Only" },
		{ value: "automatic", label: "Automatic Only" },
	];

	const columns = [
		{
			key: "createdAt",
			header: "Date",
			render: (activity: any) => new Date(activity.createdAt).toLocaleDateString(),
		},
		{
			key: "user",
			header: "Employee",
			render: (activity: any) => activity.user?.name || "Unknown",
		},
		{
			key: "pointsChange",
			header: "Points Change",
			render: (activity: any) => (
				<Badge variant={activity.pointsChange > 0 ? "default" : "destructive"}>
					{activity.pointsChange > 0 ? "+" : ""}
					{activity.pointsChange}
				</Badge>
			),
		},
		{
			key: "reason",
			header: "Reason",
			render: (activity: any) => activity.reason,
		},
		{
			key: "type",
			header: "Type",
			render: (activity: any) => <Badge variant={activity.type === "manual" ? "outline" : "secondary"}>{activity.type}</Badge>,
		},
		{
			key: "createdBy",
			header: "Created By",
			render: (activity: any) => activity.createdBy || "System",
		},
	];

	return (
		<FormDialog
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title="Points Activity Report"
			description="Generate detailed reports of points activities within a date range"
			size="xxxl"
			showFooter={false}
		>
			<div className="space-y-6">
				{/* Filters Form */}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<FormInput
								control={form.control}
								name="dateFrom"
								label="From Date"
								type="date"
							/>
							<FormInput
								control={form.control}
								name="dateTo"
								label="To Date"
								type="date"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormSelect
								control={form.control}
								name="type"
								label="Activity Type"
								options={typeOptions}
							/>
							<FormInput
								control={form.control}
								name="userId"
								label="Employee ID (Optional)"
								type="number"
								placeholder="Leave empty for all employees"
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
						>
							<Calendar className="h-4 w-4 mr-2" />
							Generate Report
						</Button>
					</form>
				</Form>

				{/* Summary Cards */}
				{reportData?.summary && (
					<div className="grid grid-cols-4 gap-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Activities</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{reportData.summary.totalActivities}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Points Added</CardTitle>
								<TrendingUp className="h-4 w-4 text-green-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">+{reportData.summary.totalPointsAdded}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Points Deducted</CardTitle>
								<TrendingDown className="h-4 w-4 text-red-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-red-600">-{reportData.summary.totalPointsDeducted}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Net Change</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className={`text-2xl font-bold ${reportData.summary.netChange >= 0 ? "text-green-600" : "text-red-600"}`}>
									{reportData.summary.netChange >= 0 ? "+" : ""}
									{reportData.summary.netChange}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Activities Table */}
				{reportData?.activities && (
					<DataTable
						title="Points Activities"
						titleBadge={reportData.pagination ? `${reportData.pagination.total} activities` : undefined}
						columns={columns}
						data={reportData.activities}
						keyExtractor={(activity) => activity.userPointId}
						isLoading={isLoading}
						pagination={reportData.pagination}
						onPageChange={setCurrentPage}
						emptyState={{
							icon: Calendar,
							title: "No activities found",
							description: "No points activities found for the selected criteria.",
						}}
					/>
				)}
			</div>
		</FormDialog>
	);
}
