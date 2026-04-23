import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { GracePeriodInfo } from "../types/employeeReview";
import { Calendar, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

interface GracePeriodSectionProps {
	data: GracePeriodInfo;
}

export function GracePeriodSection({ data }: GracePeriodSectionProps) {
	const usagePercentage = (data.daysUsed / data.allowedDays) * 100;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Grace Period Status
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Status Badge */}
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Status</span>
					{data.isExpired ? (
						<Badge
							variant="destructive"
							className="gap-1"
						>
							<XCircle className="h-3 w-3" />
							Expired
						</Badge>
					) : data.remainingDays > 2 ? (
						<Badge
							variant="default"
							className="gap-1 bg-green-500"
						>
							<CheckCircle2 className="h-3 w-3" />
							Active
						</Badge>
					) : (
						<Badge
							variant="secondary"
							className="gap-1 bg-yellow-500 text-white"
						>
							<AlertTriangle className="h-3 w-3" />
							Warning
						</Badge>
					)}
				</div>

				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Days Used</span>
						<span className="font-medium">
							{data.daysUsed} / {data.allowedDays}
						</span>
					</div>
					<Progress
						value={usagePercentage}
						className="h-2"
					/>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Allowed Days</p>
						<p className="text-2xl font-bold">{data.allowedDays}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Days Used</p>
						<p className="text-2xl font-bold text-orange-500">{data.daysUsed}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Remaining Days</p>
						<p className={`text-2xl font-bold ${data.remainingDays > 0 ? "text-green-500" : "text-red-500"}`}>{data.remainingDays}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Days Over Limit</p>
						<p className="text-2xl font-bold text-red-500">{data.daysOverLimit}</p>
					</div>
				</div>

				{/* Dates Info */}
				{data.firstLateDate && (
					<div className="space-y-2 pt-4 border-t">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">First Late Date</span>
							<span className="font-medium">{format(parseISO(data.firstLateDate), "MMM dd, yyyy")}</span>
						</div>
						{data.gracePeriodEndDate && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Grace Period Ends</span>
								<span className="font-medium">{format(parseISO(data.gracePeriodEndDate), "MMM dd, yyyy")}</span>
							</div>
						)}
					</div>
				)}

				{/* Warning Message */}
				{data.isExpired && (
					<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
						<p className="text-sm text-destructive font-medium">⚠️ Grace period has expired. Late attendance will now result in point deductions.</p>
					</div>
				)}
				{!data.isExpired && data.remainingDays <= 2 && data.remainingDays > 0 && (
					<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
						<p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">⚠️ Only {data.remainingDays} grace day(s) remaining!</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
