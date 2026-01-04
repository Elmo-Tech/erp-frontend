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
	const { canVerifyTestScenarios } = usePermissions();

	// Test scenarios can only be added to Weekly tasks
	// Subtasks can have scenarios added by assignees but not edited
	const canAddScenarios = task.type === TaskType.WEEKLY;
	const isSubtask = task.type === TaskType.SUBTASK;
	const isMainTask = task.type === TaskType.MAIN;

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
			await addScenario.mutateAsync({ taskId: task.taskId, payload: data });
			toast.success("Test scenario added");
			setShowAddDialog(false);
			addForm.reset();
		} catch {
			toast.error("Failed to add test scenario");
		}
	};

	const handleComplete = async (scenario: TaskTestScenario) => {
		try {
			await completeScenario.mutateAsync({ scenarioId: scenario.scenarioId, taskId: task.taskId });
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
				{(canAddScenarios || isSubtask) && (
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

			{/* Info for subtasks */}
			{isSubtask && (
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
}

function ScenarioCard({ scenario, onComplete, onVerify, isCompleting }: ScenarioCardProps) {
	const config = statusConfig[scenario.status];
	const StatusIcon = config.icon;
	const isPending = scenario.status === TestScenarioStatus.PENDING;
	const isCompleted = !!scenario.completedAt && !scenario.verifiedAt;

	return (
		<div className={cn("p-3 rounded-lg border", config.bgColor)}>
			<div className="flex items-start gap-3">
				<div className={cn("mt-0.5", config.color)}>
					<StatusIcon className="h-5 w-5" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">{scenario.title}</p>
						<Badge
							variant="outline"
							className={cn("text-xs", config.color)}
						>
							{config.label}
						</Badge>
					</div>
					{scenario.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{scenario.description}</p>}
					{scenario.expectedResult && (
						<p className="text-xs text-muted-foreground mt-1">
							<span className="font-medium">Expected:</span> {scenario.expectedResult}
						</p>
					)}
					<div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
						{scenario.completedBy && (
							<span>
								Completed by {scenario.completedBy.name}
								{scenario.completedAt && ` on ${format(new Date(scenario.completedAt), "MMM d")}`}
							</span>
						)}
						{scenario.verifiedBy && (
							<span>
								Verified by {scenario.verifiedBy.name}
								{scenario.verifiedAt && ` on ${format(new Date(scenario.verifiedAt), "MMM d")}`}
							</span>
						)}
					</div>
					{scenario.reviewerNotes && (
						<div className="mt-2 p-2 bg-background rounded text-xs">
							<span className="font-medium">Reviewer notes:</span> {scenario.reviewerNotes}
						</div>
					)}
				</div>
				<div className="flex gap-1">
					{isPending && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onComplete}
							disabled={isCompleting}
						>
							<Check className="h-4 w-4" />
						</Button>
					)}
					{isCompleted && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onVerify}
						>
							Verify
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
