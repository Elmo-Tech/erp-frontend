/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormDialog, FormInput, FormTextarea } from "@/components/shared";
import { Task, TaskTestScenario, TestScenarioStatus, TaskType } from "@/features/dashboard/types/task";
import { useAddTestScenario, useCompleteTestScenario, useVerifyTestScenario } from "@/features/dashboard/hooks/useTasks";
import { Plus, Check, X, Clock, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";

const addScenarioSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	expectedResult: z.string().optional(),
});

const verifyScenarioSchema = z.object({
	passed: z.boolean(),
	notes: z.string().optional(),
});

type AddScenarioFormData = z.infer<typeof addScenarioSchema>;
type VerifyScenarioFormData = z.infer<typeof verifyScenarioSchema>;

interface TaskTestScenariosSectionProps {
	task: Task;
	scenarios: TaskTestScenario[];
}

type StatusConfigType = {
	icon: typeof Clock;
	color: string;
	bgColor: string;
	label: string;
};

const statusConfig: Record<TestScenarioStatus, StatusConfigType> = {
	[TestScenarioStatus.PENDING]: {
		icon: Clock,
		color: "text-gray-500",
		bgColor: "bg-gray-100 dark:bg-gray-800",
		label: "Pending",
	},
	[TestScenarioStatus.PASSED]: {
		icon: CheckCircle2,
		color: "text-green-600",
		bgColor: "bg-green-100 dark:bg-green-900/30",
		label: "Passed",
	},
	[TestScenarioStatus.FAILED]: {
		icon: XCircle,
		color: "text-red-600",
		bgColor: "bg-red-100 dark:bg-red-900/30",
		label: "Failed",
	},
};

export function TaskTestScenariosSection({ task, scenarios }: TaskTestScenariosSectionProps) {
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showVerifyDialog, setShowVerifyDialog] = useState<TaskTestScenario | null>(null);

	const addScenario = useAddTestScenario();
	const completeScenario = useCompleteTestScenario();
	const verifyScenario = useVerifyTestScenario();
	const { canManageTaskTestScenarios } = usePermissions();
	const { user, role } = useAuthStore();

	// Permission logic:
	// - Weekly Tasks: Only users with manage_task_test_scenarios permission can add scenarios
	// - Subtasks: Assigned users can add their own test scenarios
	// - Main Tasks: No test scenarios (they organize work structure)
	const isWeeklyTask = task.type === TaskType.WEEKLY;
	const isSubtask = task.type === TaskType.SUBTASK;
	const isMainTask = task.type === TaskType.MAIN;

	// Check if user is admin/super-admin or has manage_task_test_scenarios permission
	const isAdminOrSuperAdmin = role === "admin" || role === "super-admin";

	// Check if current user is assigned to this task
	const isAssignedToTask = task.assignees?.some((a) => a.userId === user?.userId) || false;

	// Can add scenarios:
	// - Weekly: admin/super-admin or has manage_task_test_scenarios permission
	// - Subtask: assigned users can add scenarios
	const canAddScenarios = isWeeklyTask ? isAdminOrSuperAdmin || canManageTaskTestScenarios : isSubtask && isAssignedToTask;

	const addForm = useForm<AddScenarioFormData>({
		resolver: zodResolver(addScenarioSchema),
		defaultValues: { title: "", description: "", expectedResult: "" },
	});

	const verifyForm = useForm<VerifyScenarioFormData>({
		resolver: zodResolver(verifyScenarioSchema),
		defaultValues: { passed: true, notes: "" },
	});

	const handleAddScenario = async (data: AddScenarioFormData) => {
		try {
			await addScenario.mutateAsync({ taskId: task.taskId, projectId: task.projectId, payload: data });
			toast.success("Test scenario added");
			setShowAddDialog(false);
			addForm.reset();
		} catch {
			toast.error("Failed to add test scenario");
		}
	};

	const handleComplete = async (scenario: TaskTestScenario) => {
		try {
			await completeScenario.mutateAsync({ scenarioId: scenario.scenarioId, taskId: task.taskId, projectId: task.projectId });
			toast.success("Test marked as completed");
		} catch {
			toast.error("Failed to complete test");
		}
	};

	const handleVerify = async (data: VerifyScenarioFormData) => {
		if (!showVerifyDialog) return;
		try {
			await verifyScenario.mutateAsync({
				scenarioId: showVerifyDialog.scenarioId,
				taskId: task.taskId,
				projectId: task.projectId,
				payload: data,
			});
			toast.success(data.passed ? "Test verified as passed" : "Test marked as failed");
			setShowVerifyDialog(null);
			verifyForm.reset();
		} catch {
			toast.error("Failed to verify test");
		}
	};

	const passedCount = scenarios.filter((s) => s.status === TestScenarioStatus.PASSED).length;

	// Main tasks don't have test scenarios
	if (isMainTask) {
		return (
			<div className="space-y-4">
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>Test scenarios are defined on Weekly Tasks. Main tasks organize the overall work structure.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-medium">Test Scenarios</h4>
					{scenarios.length > 0 && (
						<p className="text-xs text-muted-foreground">
							{passedCount} of {scenarios.length} passed
						</p>
					)}
				</div>
				{canAddScenarios && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowAddDialog(true)}
					>
						<Plus className="h-4 w-4 mr-1" />
						Add Test
					</Button>
				)}
			</div>

			{/* Info for weekly tasks without permission */}
			{isWeeklyTask && !canAddScenarios && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to add test scenarios to weekly tasks.</AlertDescription>
				</Alert>
			)}

			{/* Info for subtasks */}
			{isSubtask && !isAssignedToTask && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>Only assigned team members can add test scenarios to subtasks.</AlertDescription>
				</Alert>
			)}
			{isSubtask && isAssignedToTask && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>You can add personal test scenarios for this subtask. Main test scenarios are defined on the Weekly Task.</AlertDescription>
				</Alert>
			)}

			{scenarios.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p className="text-sm">No test scenarios defined</p>
				</div>
			) : (
				<div className="space-y-3">
					{scenarios.map((scenario) => (
						<ScenarioCard
							key={scenario.scenarioId}
							scenario={scenario}
							task={task}
							onComplete={() => handleComplete(scenario)}
							onVerify={() => {
								verifyForm.reset({ passed: true, notes: "" });
								setShowVerifyDialog(scenario);
							}}
							isCompleting={completeScenario.isPending}
						/>
					))}
				</div>
			)}

			<FormDialog
				open={showAddDialog}
				onOpenChange={(open) => {
					setShowAddDialog(open);
					if (!open) addForm.reset();
				}}
				title="Add Test Scenario"
				submitLabel="Add Scenario"
				onSubmit={addForm.handleSubmit(handleAddScenario)}
				isLoading={addScenario.isPending}
				isSubmitDisabled={!addForm.formState.isValid}
			>
				<Form {...addForm}>
					<div className="space-y-4 py-4">
						<FormInput
							control={addForm.control}
							name="title"
							label="Title *"
							placeholder="e.g., User can login"
						/>
						<FormTextarea
							control={addForm.control}
							name="description"
							label="Description"
							placeholder="Steps..."
							rows={3}
						/>
						<FormTextarea
							control={addForm.control}
							name="expectedResult"
							label="Expected Result"
							placeholder="What should happen..."
							rows={2}
						/>
					</div>
				</Form>
			</FormDialog>

			<FormDialog
				open={!!showVerifyDialog}
				onOpenChange={(open) => {
					if (!open) {
						setShowVerifyDialog(null);
						verifyForm.reset();
					}
				}}
				title="Verify Test Scenario"
				submitLabel="Submit Verification"
				onSubmit={verifyForm.handleSubmit(handleVerify)}
				isLoading={verifyScenario.isPending}
			>
				<Form {...verifyForm}>
					<div className="space-y-4 py-4">
						<div className="p-3 bg-muted rounded-lg">
							<p className="font-medium">{showVerifyDialog?.title}</p>
							{showVerifyDialog?.expectedResult && <p className="text-sm text-muted-foreground mt-1">Expected: {showVerifyDialog.expectedResult}</p>}
						</div>
						<div className="flex items-center gap-4">
							<Button
								type="button"
								variant={verifyForm.watch("passed") ? "default" : "outline"}
								className={cn(verifyForm.watch("passed") && "bg-green-600 hover:bg-green-700")}
								onClick={() => verifyForm.setValue("passed", true)}
							>
								<Check className="h-4 w-4 mr-2" />
								Pass
							</Button>
							<Button
								type="button"
								variant={!verifyForm.watch("passed") ? "default" : "outline"}
								className={cn(!verifyForm.watch("passed") && "bg-red-600 hover:bg-red-700")}
								onClick={() => verifyForm.setValue("passed", false)}
							>
								<X className="h-4 w-4 mr-2" />
								Fail
							</Button>
						</div>
						<FormTextarea
							control={verifyForm.control}
							name="notes"
							label="Notes (optional)"
							placeholder="Add notes..."
							rows={3}
						/>
					</div>
				</Form>
			</FormDialog>
		</div>
	);
}

interface ScenarioCardProps {
	scenario: TaskTestScenario;
	onComplete: () => void;
	onVerify: () => void;
	isCompleting: boolean;
	task: Task; // Add task to check reviewer status
}

function ScenarioCard({ scenario, onComplete, onVerify, isCompleting, task }: ScenarioCardProps) {
	const config = statusConfig[scenario.status];
	const StatusIcon = config.icon;
	const isPending = scenario.status === TestScenarioStatus.PENDING;
	const isCompleted = !!scenario.completedAt && !scenario.verifiedAt;
	const { role, user } = useAuthStore();

	// Check if user is Admin/Super Admin
	const isAdmin = role === "admin" || role === "super-admin";

	// Check if user is assigned as reviewer in this task
	const isTaskReviewer = task.assignees?.some((assignee) => assignee.userId === user?.userId && assignee.role === "reviewer") || false;

	// Can verify if Admin or Task Reviewer
	const canVerify = isAdmin || isTaskReviewer;

	return (
		<div className={cn("border rounded-lg transition-all duration-200 hover:shadow-sm", config.bgColor)}>
			{/* Header */}
			<div className="flex items-start gap-3 p-4">
				<div className={cn("mt-0.5 shrink-0", config.color)}>
					<StatusIcon className="h-5 w-5" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<h4 className="font-medium text-sm text-foreground">{scenario.title}</h4>
						<Badge
							variant="outline"
							className={cn("text-xs", config.color)}
						>
							{config.label}
						</Badge>
					</div>
				</div>
				<div className="flex gap-1 shrink-0">
					{/* Anyone can check/complete test scenarios */}
					{isPending && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onComplete}
							disabled={isCompleting}
							title="Mark as checked"
							className="h-8 w-8 p-0"
						>
							<Check className="h-4 w-4" />
						</Button>
					)}
					{/* Only Admin or Task Reviewers can verify */}
					{isCompleted && canVerify && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onVerify}
							title="Verify test result"
							className="h-8 w-8 p-0"
						>
							<AlertCircle className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Content */}
			{(scenario.description || scenario.expectedResult) && (
				<div className="px-4 pb-3 space-y-3">
					{scenario.description && (
						<div className="bg-background/50 rounded-md p-3">
							<p className="text-xs font-medium text-muted-foreground mb-1">DESCRIPTION</p>
							<p className="text-sm text-foreground whitespace-pre-wrap">{scenario.description}</p>
						</div>
					)}
					{scenario.expectedResult && (
						<div className="bg-background/50 rounded-md p-3">
							<p className="text-xs font-medium text-muted-foreground mb-1">EXPECTED RESULT</p>
							<p className="text-sm text-foreground whitespace-pre-wrap">{scenario.expectedResult}</p>
						</div>
					)}
				</div>
			)}

			{/* Footer with metadata */}
			{(scenario.completedBy || scenario.verifiedBy || scenario.reviewerNotes) && (
				<div className="border-t bg-background/30 px-4 py-3 space-y-2">
					{scenario.completedBy && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<CheckCircle2 className="h-3 w-3 text-green-600" />
							<span>
								Completed by <span className="font-medium">{scenario.completedBy.name}</span>
								{scenario.completedAt && ` on ${format(new Date(scenario.completedAt), "MMM d, yyyy 'at' HH:mm")}`}
							</span>
						</div>
					)}
					{scenario.verifiedBy && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<AlertCircle className="h-3 w-3 text-blue-600" />
							<span>
								Verified by <span className="font-medium">{scenario.verifiedBy.name}</span>
								{scenario.verifiedAt && ` on ${format(new Date(scenario.verifiedAt), "MMM d, yyyy 'at' HH:mm")}`}
							</span>
						</div>
					)}
					{scenario.reviewerNotes && (
						<div className="bg-background rounded-md p-2 mt-2">
							<p className="text-xs font-medium text-muted-foreground mb-1">REVIEWER NOTES</p>
							<p className="text-xs text-foreground whitespace-pre-wrap">{scenario.reviewerNotes}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
