"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { EvaluationsTable } from "@/_old/features/performance/components/EvaluationsTable";
import { EvaluationPeriodsTable } from "@/_old/features/performance/components/EvaluationPeriodsTable";
import { InnovationLogsTable } from "@/_old/features/performance/components/InnovationLogsTable";
import { MyEvaluationsCard } from "@/_old/features/performance/components/MyEvaluationsCard";
import { CodeReviewList, PendingReviewsWidget, CodeReviewStatsCard, CreateCodeReviewForm } from "@/_old/features/performance";
import { usePermissions } from "@/_old/features/admin/hooks/usePermissions";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function PerformancePage() {
	const { canViewEvaluations, canManageEvaluations } = usePermissions();
	const [showCreateForm, setShowCreateForm] = useState(false);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Performance Management</h1>
				<p className="text-muted-foreground">Track evaluations, code reviews, and innovation contributions</p>
			</div>

			<Tabs
				defaultValue="my-evaluations"
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="my-evaluations">My Evaluations</TabsTrigger>
					<TabsTrigger value="innovations">Innovation Logs</TabsTrigger>
					<TabsTrigger value="code-reviews">Code Reviews</TabsTrigger>
					<TabsTrigger value="pending-reviews">Pending Reviews</TabsTrigger>
					{canViewEvaluations && <TabsTrigger value="all-evaluations">All Evaluations</TabsTrigger>}
					{canManageEvaluations && <TabsTrigger value="periods">Evaluation Periods</TabsTrigger>}
				</TabsList>

				<TabsContent value="my-evaluations">
					<MyEvaluationsCard />
				</TabsContent>

				<TabsContent value="innovations">
					<InnovationLogsTable />
				</TabsContent>

				<TabsContent value="code-reviews">
					<div className="grid gap-6">
						{/* Header with Create Button */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Code Reviews</CardTitle>
										<p className="text-sm text-muted-foreground">Manage code reviews and track quality metrics</p>
									</div>
									<Button onClick={() => setShowCreateForm(true)}>
										<Plus className="h-4 w-4 mr-2" />
										Create Review
									</Button>
								</div>
							</CardHeader>
						</Card>

						{/* Stats and Reviews Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2">
								<CodeReviewList
									showActions={true}
									isReviewer={true}
								/>
							</div>
							<div>
								<CodeReviewStatsCard />
							</div>
						</div>

						{/* Create Form Dialog */}
						{showCreateForm && (
							<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
								<CreateCodeReviewForm
									onSuccess={() => setShowCreateForm(false)}
									onCancel={() => setShowCreateForm(false)}
								/>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="pending-reviews">
					<PendingReviewsWidget />
				</TabsContent>

				{canViewEvaluations && (
					<TabsContent value="all-evaluations">
						<EvaluationsTable />
					</TabsContent>
				)}

				{canManageEvaluations && (
					<TabsContent value="periods">
						<EvaluationPeriodsTable />
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
