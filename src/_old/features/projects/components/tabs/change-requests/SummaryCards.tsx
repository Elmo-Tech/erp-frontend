/**
 * Change Request Summary Cards
 */

"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { FileEdit, Clock, DollarSign, CheckCircle, Wrench } from "lucide-react";
import { ChangeRequestSummary } from "../../../types/changeRequest";

interface SummaryCardsProps {
	summary: ChangeRequestSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-5">
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<FileEdit className="h-4 w-4" />
						Total
					</div>
					<p className="text-2xl font-bold">{summary.total}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-2 text-yellow-600 text-sm">
						<Clock className="h-4 w-4" />
						Pending
					</div>
					<p className="text-2xl font-bold">{summary.pending}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-2 text-green-600 text-sm">
						<CheckCircle className="h-4 w-4" />
						Approved
					</div>
					<p className="text-2xl font-bold">{summary.approved}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-2 text-blue-600 text-sm">
						<Wrench className="h-4 w-4" />
						Implemented
					</div>
					<p className="text-2xl font-bold">{summary.implemented}</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<DollarSign className="h-4 w-4" />
						Approved Cost
					</div>
					<p className="text-2xl font-bold">${summary.totalApprovedCost}</p>
				</CardContent>
			</Card>
		</div>
	);
}
