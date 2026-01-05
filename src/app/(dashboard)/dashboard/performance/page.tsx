"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationsTable } from "@/features/performance/components/EvaluationsTable";
import { EvaluationPeriodsTable } from "@/features/performance/components/EvaluationPeriodsTable";
import { CodeReviewsTable } from "@/features/performance/components/CodeReviewsTable";
import { InnovationLogsTable } from "@/features/performance/components/InnovationLogsTable";
import { MyEvaluationsCard } from "@/features/performance/components/MyEvaluationsCard";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

export default function PerformancePage() {
	const { canViewEvaluations, canManageEvaluations } = usePermissions();

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
					<CodeReviewsTable />
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
