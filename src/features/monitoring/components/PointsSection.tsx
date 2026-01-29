import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PointsData } from "../types/employeeReview";
import { TrendingUp, TrendingDown, Award, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface PointsSectionProps {
	points: PointsData;
	onPageChange?: (page: number) => void;
}

export function PointsSection({ points, onPageChange }: PointsSectionProps) {
	const [currentPage, setCurrentPage] = useState(1);

	const getPointsColor = (pointsValue: number) => {
		if (pointsValue > 0) return "text-green-600";
		if (pointsValue < 0) return "text-red-600";
		return "text-gray-600";
	};

	const getPointsBadgeColor = (pointsValue: number) => {
		if (pointsValue > 0) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
		if (pointsValue < 0) return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
		return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		onPageChange?.(newPage);
	};

	const pagination = points?.transactionsPagination;
	const hasPagination = pagination && (pagination?.totalPages || 0) > 1;

	return (
		<div className="space-y-6">
			{/* Points Overview */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Current Points</CardTitle>
						<Award className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{points?.currentPoints || 0}</div>
						<p className="text-xs text-muted-foreground">Total accumulated</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Points Earned</CardTitle>
						<TrendingUp className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">+{points?.pointsEarned || 0}</div>
						<p className="text-xs text-muted-foreground">This period</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Points Deducted</CardTitle>
						<TrendingDown className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">-{points?.pointsDeducted || 0}</div>
						<p className="text-xs text-muted-foreground">This period</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Net Change</CardTitle>
						{(points?.netChange || 0) >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${getPointsColor(points?.netChange || 0)}`}>
							{(points?.netChange || 0) >= 0 ? "+" : ""}
							{points?.netChange || 0}
						</div>
						<p className="text-xs text-muted-foreground">Net change</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Transactions</CardTitle>
						<AlertTriangle className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{(points?.transactions || []).length}</div>
						<p className="text-xs text-muted-foreground">Total transactions</p>
					</CardContent>
				</Card>
			</div>

			{/* Monthly Breakdown */}
			{Object.keys(points?.monthlyBreakdown || {}).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Monthly Breakdown</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{Object.entries(points?.monthlyBreakdown || {}).map(([month, data]) => (
								<div
									key={month}
									className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
								>
									<div className="font-medium">{format(new Date(month + "-01"), "MMMM yyyy")}</div>
									<div className="flex items-center gap-4">
										<span className="text-sm text-green-600">+{data.earned}</span>
										<span className="text-sm text-red-600">-{data.deducted}</span>
										<Badge className={getPointsBadgeColor(data.net)}>
											{data.net >= 0 ? "+" : ""}
											{data.net}
										</Badge>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recent Transactions */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Point Transactions</CardTitle>
					{hasPagination && (
						<div className="text-sm text-muted-foreground">
							Showing {pagination?.showing || 0} of {pagination?.total || 0} transactions
						</div>
					)}
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Points</TableHead>
								<TableHead>Reason</TableHead>
								<TableHead>By</TableHead>
								<TableHead className="text-right">Balance After</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(points?.transactions || []).map((transaction) => (
								<TableRow key={transaction.transactionId}>
									<TableCell className="font-medium">{format(new Date(transaction.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
									<TableCell>
										<span className="text-xs px-2 py-1 rounded-full bg-muted">{transaction.type}</span>
									</TableCell>
									<TableCell>
										<Badge className={getPointsBadgeColor(transaction.points)}>
											{transaction.points >= 0 ? "+" : ""}
											{transaction.points}
										</Badge>
									</TableCell>
									<TableCell
										className="max-w-xs truncate"
										title={transaction.reason}
									>
										{transaction.reason || "No reason provided"}
									</TableCell>
									<TableCell>{transaction.createdBy}</TableCell>
									<TableCell className="text-right font-medium">{transaction.balanceAfter}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{(points?.transactions || []).length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							<AlertTriangle className="h-8 w-8 mx-auto mb-2" />
							<p>No point transactions found for this period</p>
						</div>
					)}

					{/* Pagination Controls */}
					{hasPagination && (
						<div className="flex items-center justify-between mt-4 pt-4 border-t">
							<div className="text-sm text-muted-foreground">
								Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4 mr-1" />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === (pagination?.totalPages || 1)}
								>
									Next
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
