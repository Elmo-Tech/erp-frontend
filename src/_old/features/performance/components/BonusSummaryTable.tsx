"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { PeriodBonusSummary, BonusTier } from "../types";
import { Users, DollarSign, TrendingUp } from "lucide-react";

interface BonusSummaryTableProps {
	data: PeriodBonusSummary;
}

const tierColors: Record<BonusTier, string> = {
	excellent: "bg-green-500",
	good: "bg-blue-500",
	average: "bg-yellow-500",
	poor: "bg-red-500",
};

export function BonusSummaryTable({ data }: BonusSummaryTableProps) {
	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Employees</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.summary.totalEmployees}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Bonus</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">${data.summary.totalBonusAmount.toLocaleString()}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Score</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.summary.averageScore.toFixed(1)}/100</div>
					</CardContent>
				</Card>
			</div>

			{/* Evaluations Table */}
			<Card>
				<CardHeader>
					<CardTitle>Bonus Details - {data.periodName}</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Employee</TableHead>
								<TableHead className="text-center">Score</TableHead>
								<TableHead className="text-center">Tier</TableHead>
								<TableHead className="text-center">Base Amount</TableHead>
								<TableHead className="text-center">Percentage</TableHead>
								<TableHead className="text-center">Final Bonus</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.evaluations.map((evaluation) => (
								<TableRow key={evaluation.userId}>
									<TableCell className="font-medium">{evaluation.userName}</TableCell>
									<TableCell className="text-center">{evaluation.totalScore.toFixed(1)}</TableCell>
									<TableCell className="text-center">
										<Badge className={`${tierColors[evaluation.bonusTier]} text-white`}>{evaluation.bonusTierLabel}</Badge>
									</TableCell>
									<TableCell className="text-center">${evaluation.baseAmount.toLocaleString()}</TableCell>
									<TableCell className="text-center">{evaluation.percentage}%</TableCell>
									<TableCell className="text-center font-bold text-green-600">${evaluation.finalBonusAmount.toLocaleString()}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
