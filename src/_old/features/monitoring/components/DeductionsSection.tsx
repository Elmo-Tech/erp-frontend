import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { DeductionInfo } from "../types/employeeReview";
import { TrendingDown, Clock, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DeductionsSectionProps {
	data: DeductionInfo;
}

export function DeductionsSection({ data }: DeductionsSectionProps) {
	const monthlyEntries = Object.entries(data?.monthlyDeductions || {});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingDown className="h-5 w-5 text-destructive" />
					Point Deductions (After Grace Period)
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Deductions</p>
						<p className="text-2xl font-bold text-destructive">-{data?.totalDeductions || 0}</p>
						<p className="text-xs text-muted-foreground">points</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Late Minutes</p>
						<p className="text-2xl font-bold">{data?.totalLateMinutes || 0}</p>
						<p className="text-xs text-muted-foreground">minutes</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Days with Deductions</p>
						<p className="text-2xl font-bold">{data?.daysWithDeductions || 0}</p>
						<p className="text-xs text-muted-foreground">days</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Avg per Day</p>
						<p className="text-2xl font-bold text-destructive">-{data?.averageDeductionPerDay || 0}</p>
						<p className="text-xs text-muted-foreground">points/day</p>
					</div>
				</div>

				{/* Deduction Rate Info */}
				<div className="bg-muted/50 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Deduction Rate</span>
						</div>
						<Badge variant="outline">{data?.deductionRate || 0} points/minute</Badge>
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						After {data?.gracePeriodDays || 0} grace days, each minute late = {data?.deductionRate || 0} point deduction
					</p>
				</div>

				{/* Monthly Breakdown */}
				{monthlyEntries.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-semibold flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Monthly Breakdown
						</h4>
						<div className="grid gap-3">
							{monthlyEntries.map(([month, stats]) => (
								<div
									key={month}
									className="border rounded-lg p-3 space-y-2"
								>
									<div className="flex items-center justify-between">
										<span className="font-medium">{month}</span>
										<Badge variant="destructive">-{stats.deductions} points</Badge>
									</div>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Late Days:</span>
											<span className="font-medium">{stats.lateDays}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Late Minutes:</span>
											<span className="font-medium">{stats.lateMinutes}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Daily Deductions Table */}
				{(data?.dailyDeductions || []).length > 0 && (
					<div className="space-y-3">
						<h4 className="font-semibold flex items-center gap-2">
							<AlertTriangle className="h-4 w-4" />
							Daily Deductions
						</h4>
						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Clock In</TableHead>
										<TableHead className="text-right">Late Minutes</TableHead>
										<TableHead className="text-right">Deduction</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(data?.dailyDeductions || []).map((deduction, index) => (
										<TableRow key={index}>
											<TableCell className="font-medium">{format(parseISO(deduction.date), "MMM dd, yyyy")}</TableCell>
											<TableCell>{deduction.clockIn ? format(parseISO(deduction.clockIn), "HH:mm") : "-"}</TableCell>
											<TableCell className="text-right">
												<Badge
													variant="outline"
													className="bg-orange-50 dark:bg-orange-950"
												>
													{deduction.lateMinutes} min
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Badge variant="destructive">-{deduction.deduction}</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				)}

				{/* No Deductions Message */}
				{(data?.daysWithDeductions || 0) === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						<CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
						<p className="font-medium">No point deductions in this period</p>
						<p className="text-sm">All late days were within the grace period</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
