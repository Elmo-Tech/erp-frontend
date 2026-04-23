"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import type { EvaluationScoreSummary, BonusTier } from "../types";

interface EvaluationScoreCardProps {
	summary: EvaluationScoreSummary;
}

const tierColors: Record<BonusTier, string> = {
	excellent: "bg-green-500",
	good: "bg-blue-500",
	average: "bg-yellow-500",
	poor: "bg-red-500",
};

const tierLabels: Record<BonusTier, string> = {
	excellent: "Excellent",
	good: "Good",
	average: "Average",
	poor: "Poor",
};

export function EvaluationScoreCard({ summary }: EvaluationScoreCardProps) {
	const { scores, totalScore, bonusTier, bonusAmount } = summary;

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{/* Technical Quality */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Technical Quality</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-xs">
							<span>Bug Severity</span>
							<span>{scores.technicalQuality.bugSeverity}/15</span>
						</div>
						<Progress
							value={(scores.technicalQuality.bugSeverity / 15) * 100}
							className="h-2"
						/>
						<div className="flex justify-between text-xs">
							<span>Code Quality</span>
							<span>{scores.technicalQuality.codeQuality}/15</span>
						</div>
						<Progress
							value={(scores.technicalQuality.codeQuality / 15) * 100}
							className="h-2"
						/>
						<div className="pt-2 border-t">
							<div className="flex justify-between font-medium">
								<span>Total</span>
								<span>
									{scores.technicalQuality.total}/{scores.technicalQuality.maxScore}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Innovation */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Innovation & Tools</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-xs">
							<span>AI & Tools Usage</span>
							<span>
								{scores.innovation.score}/{scores.innovation.maxScore}
							</span>
						</div>
						<Progress
							value={(scores.innovation.score / scores.innovation.maxScore) * 100}
							className="h-2"
						/>
						<p className="text-xs text-muted-foreground mt-2">Includes AI tools usage, automation, and learning new technologies</p>
					</div>
				</CardContent>
			</Card>

			{/* Productivity */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Productivity & Delivery</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-xs">
							<span>On-Time Delivery</span>
							<span>{scores.productivity.onTimeDelivery}/15</span>
						</div>
						<Progress
							value={(scores.productivity.onTimeDelivery / 15) * 100}
							className="h-2"
						/>
						<div className="flex justify-between text-xs">
							<span>Flexibility</span>
							<span>{scores.productivity.flexibility}/10</span>
						</div>
						<Progress
							value={(scores.productivity.flexibility / 10) * 100}
							className="h-2"
						/>
						<div className="pt-2 border-t">
							<div className="flex justify-between font-medium">
								<span>Total</span>
								<span>
									{scores.productivity.total}/{scores.productivity.maxScore}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Soft Skills */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Soft Skills & Commitment</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-xs">
							<span>Communication</span>
							<span>{scores.softSkills.communication}/10</span>
						</div>
						<Progress
							value={(scores.softSkills.communication / 10) * 100}
							className="h-2"
						/>
						<div className="flex justify-between text-xs">
							<span>Attendance</span>
							<span>{scores.softSkills.attendance}/10</span>
						</div>
						<Progress
							value={(scores.softSkills.attendance / 10) * 100}
							className="h-2"
						/>
						<div className="flex justify-between text-xs">
							<span>Initiative</span>
							<span>{scores.softSkills.initiative}/5</span>
						</div>
						<Progress
							value={(scores.softSkills.initiative / 5) * 100}
							className="h-2"
						/>
						<div className="pt-2 border-t">
							<div className="flex justify-between font-medium">
								<span>Total</span>
								<span>
									{scores.softSkills.total}/{scores.softSkills.maxScore}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Total Score Summary */}
			<Card className="md:col-span-2 lg:col-span-4">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Total Score</p>
							<p className="text-4xl font-bold">{totalScore.toFixed(1)}/100</p>
						</div>
						<div className="text-center">
							<Badge className={`${tierColors[bonusTier]} text-white px-4 py-2 text-lg`}>{tierLabels[bonusTier]}</Badge>
						</div>
						<div className="text-right space-y-1">
							<p className="text-sm text-muted-foreground">Bonus Amount</p>
							<p className="text-4xl font-bold text-green-600">${bonusAmount.toLocaleString()}</p>
						</div>
					</div>
					<Progress
						value={totalScore}
						className="h-3 mt-4"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
