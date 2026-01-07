/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormTextarea, FormDatePicker } from "@/components/shared";
import { useCreateTask, useUpdateTask, useTags } from "@/features/dashboard/hooks/useTasks";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import { useTaskCategories } from "@/features/admin/hooks/useEnums";
import { Task, TaskStatus, TaskStatusLabels, TaskType, TaskTypeLabels, TaskPriority, TaskPriorityLabels } from "@/features/dashboard/types/task";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const taskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	acceptanceCriteria: z.string().optional(),
	status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.TESTING, TaskStatus.COMPLETED]),
	type: z.enum([TaskType.MAIN, TaskType.WEEKLY, TaskType.SUBTASK]),
	priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT]),
	assignedTo: z.string().optional(),
	taskCategory: z.string().optional(),
	estimatedHours: z.number().min(0, "Must be 0 or greater"),
	dueDate: z.string().optional().nullable(),
	startDate: z.string().optional().nullable(),
	sprintNumber: z.number().optional().nullable(),
	tagIds: z.array(z.number()).optional(),
	internalReviewerNotes: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
	projectId: number;
	parentId?: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task?: Task | null;
	defaultType?: TaskType;
	parentTask?: Task | null; // Parent task for getting team members
}

export function TaskFormDialog({ projectId, parentId, open, onOpenChange, task, defaultType = TaskType.MAIN, parentTask }: TaskFormDialogProps) {
	const isEditing = !!task;
	const { data: membersData } = useProjectMembers(projectId);
	const { data: tags } = useTags();
	const { data: taskCategoriesData } = useTaskCategories();
	const createTask = useCreateTask();
	const updateTask = useUpdateTask();

	const form = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			description: "",
			acceptanceCriteria: "",
			status: TaskStatus.TODO,
			type: defaultType,
			priority: TaskPriority.MEDIUM,
			assignedTo: "none",
			taskCategory: "",
			estimatedHours: 0,
			dueDate: null,
			startDate: null,
			sprintNumber: null,
			tagIds: [],
			internalReviewerNotes: "",
		},
	});

	useEffect(() => {
		if (task) {
			form.reset({
				title: task.title,
				description: task.description || "",
				acceptanceCriteria: task.acceptanceCriteria || "",
				status: task.status,
				type: task.type,
				priority: task.priority,
				assignedTo: task.assignedTo?.toString() || "none",
				taskCategory: task.taskCategory || "",
				estimatedHours: task.estimatedHours,
				dueDate: task.dueDate,
				startDate: task.startDate,
				sprintNumber: task.sprintNumber,
				tagIds: task.tags?.map((t) => t.tagId) || [],
				internalReviewerNotes: task.internalReviewerNotes || "",
			});
		} else {
			// Use defaultType directly - it's already set correctly from TasksTab
			// WEEKLY when clicking "Add Weekly Task" on a MAIN task
			// SUBTASK when clicking "Add Subtask" on a WEEKLY task
			form.reset({
				title: "",
				description: "",
				acceptanceCriteria: "",
				status: TaskStatus.TODO,
				type: defaultType,
				priority: TaskPriority.MEDIUM,
				assignedTo: "none",
				taskCategory: "",
				estimatedHours: 0,
				dueDate: null,
				startDate: null,
				sprintNumber: null,
				tagIds: [],
				internalReviewerNotes: "",
			});
		}
	}, [task, form, parentId, defaultType]);

	// Status options - if task is completed, only show completed (no transitions allowed)
	const statusOptions = useMemo(() => {
		if (task?.status === TaskStatus.COMPLETED) {
			// Completed tasks cannot change status
			return [{ value: TaskStatus.COMPLETED, label: TaskStatusLabels[TaskStatus.COMPLETED] }];
		}
		return Object.values(TaskStatus).map((status) => ({
			value: status,
			label: TaskStatusLabels[status],
		}));
	}, [task?.status]);

	const typeOptions = Object.values(TaskType).map((type) => ({
		value: type,
		label: TaskTypeLabels[type],
	}));

	const priorityOptions = Object.values(TaskPriority).map((priority) => ({
		value: priority,
		label: TaskPriorityLabels[priority],
	}));

	// Transform task categories to select options
	const taskCategoryOptions = [
		{ value: "", label: "No Category" },
		...(taskCategoriesData?.data?.map((category) => ({
			value: category.value,
			label: category.label,
		})) || []),
	];

	const assigneeOptions = useMemo(() => {
		const options = [{ value: "none", label: "Unassigned" }];

		// For Main Tasks: use project members
		// For Weekly/Subtasks: use teamAssignees from parent task
		if (defaultType === TaskType.MAIN) {
			// Use project members for Main Tasks
			if (membersData?.members) {
				options.push(
					...membersData.members.map((member) => ({
						value: member.userId.toString(),
						label: member.user?.name || "Unknown",
					}))
				);
			}
		} else {
			// For Weekly/Subtasks, use teamAssignees from parent
			const teamAssignees = parentTask?.teamAssignees || parentTask?.assignees || [];
			if (teamAssignees.length > 0) {
				options.push(
					...teamAssignees.map((assignee) => ({
						value: assignee.userId.toString(),
						label: assignee.user?.name || "Unknown",
					}))
				);
			} else if (membersData?.members) {
				// Fallback to project members if no team assignees
				options.push(
					...membersData.members.map((member) => ({
						value: member.userId.toString(),
						label: member.user?.name || "Unknown",
					}))
				);
			}
		}

		return options;
	}, [defaultType, membersData, parentTask]);

	const parseAssignedTo = (value: string | undefined): number | null => {
		if (!value || value === "none") return null;
		const parsed = parseInt(value, 10);
		return isNaN(parsed) ? null : parsed;
	};

	// Helper to normalize date for comparison (extract YYYY-MM-DD)
	const normalizeDate = (date: string | null | undefined): string | null => {
		if (!date) return null;
		// Handle both ISO format and YYYY-MM-DD format
		return date.split("T")[0];
	};

	// Helper to check if dates are different
	const datesAreDifferent = (date1: string | null | undefined, date2: string | null | undefined): boolean => {
		const normalized1 = normalizeDate(date1);
		const normalized2 = normalizeDate(date2);
		return normalized1 !== normalized2;
	};

	const selectedTagIds = form.watch("tagIds") || [];

	const toggleTag = (tagId: number) => {
		const current = form.getValues("tagIds") || [];
		if (current.includes(tagId)) {
			form.setValue(
				"tagIds",
				current.filter((id) => id !== tagId)
			);
		} else {
			form.setValue("tagIds", [...current, tagId]);
		}
	};

	const handleSubmit = async (data: TaskFormData) => {
		try {
			const assignedTo = parseAssignedTo(data.assignedTo);

			if (isEditing && task) {
				const payload: Record<string, unknown> = {};

				if (data.title !== task.title) payload.title = data.title;
				if (data.description !== (task.description || "")) payload.description = data.description;
				if (data.acceptanceCriteria !== (task.acceptanceCriteria || "")) payload.acceptanceCriteria = data.acceptanceCriteria;
				if (data.status !== task.status) payload.status = data.status;
				if (data.type !== task.type) payload.type = data.type;
				if (data.priority !== task.priority) payload.priority = data.priority;
				if (assignedTo !== task.assignedTo) payload.assignedTo = assignedTo;
				if (data.taskCategory !== (task.taskCategory || "")) payload.taskCategory = data.taskCategory || "";
				if (Number(data.estimatedHours) !== task.estimatedHours) payload.estimatedHours = Number(data.estimatedHours);
				if (datesAreDifferent(data.dueDate, task.dueDate)) payload.dueDate = data.dueDate ? normalizeDate(data.dueDate) : null;
				if (datesAreDifferent(data.startDate, task.startDate)) payload.startDate = data.startDate ? normalizeDate(data.startDate) : null;
				if (data.sprintNumber !== task.sprintNumber) payload.sprintNumber = data.sprintNumber;
				if (data.internalReviewerNotes !== (task.internalReviewerNotes || "")) payload.internalReviewerNotes = data.internalReviewerNotes;

				// Check if tags changed
				const currentTagIds = task.tags?.map((t) => t.tagId) || [];
				const newTagIds = data.tagIds || [];
				if (JSON.stringify(currentTagIds.sort()) !== JSON.stringify(newTagIds.sort())) {
					payload.tagIds = newTagIds;
				}

				if (Object.keys(payload).length > 0) {
					await updateTask.mutateAsync({ id: task.taskId, payload });
					toast.success("Task updated successfully");
				} else {
					toast.info("No changes to save");
				}
			} else {
				await createTask.mutateAsync({
					projectId,
					parentId: parentId || null,
					title: data.title,
					description: data.description,
					acceptanceCriteria: data.acceptanceCriteria,
					status: data.status,
					type: data.type,
					priority: data.priority,
					assignedTo,
					taskCategory: data.taskCategory || "",
					estimatedHours: Number(data.estimatedHours),
					dueDate: data.dueDate,
					startDate: data.startDate,
					sprintNumber: data.sprintNumber,
					tagIds: data.tagIds,
					internalReviewerNotes: data.internalReviewerNotes,
				});
				toast.success("Task created successfully");
			}
			form.reset();
			onOpenChange(false);
		} catch (error) {
			const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
			if (axiosError?.response?.data?.errors) {
				const errors = axiosError.response.data.errors;
				const errorMessages = Object.values(errors).flat().join(", ");
				toast.error(errorMessages || (isEditing ? "Failed to update task" : "Failed to create task"));
			} else {
				toast.error(isEditing ? "Failed to update task" : "Failed to create task");
			}
		}
	};

	const dialogTitle = isEditing ? "Edit Task" : `Create ${TaskTypeLabels[defaultType]}`;

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title={dialogTitle}
			description={isEditing ? "Update task details" : "Add a new task to this project"}
			submitLabel={isEditing ? "Update Task" : "Create Task"}
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createTask.isPending || updateTask.isPending}
			isSubmitDisabled={!form.formState.isValid}
			size="xl"
		>
			<Form {...form}>
				<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="Enter task title..."
					/>

					<div className="grid grid-cols-4 gap-4">
						<FormSelect
							control={form.control}
							name="type"
							label="Type"
							options={typeOptions}
							disabled={!isEditing && !!parentId}
							description={!isEditing && !!parentId ? `Type is auto-set based on parent task` : undefined}
						/>
						<FormSelect
							control={form.control}
							name="priority"
							label="Priority"
							options={priorityOptions}
						/>
						<FormSelect
							control={form.control}
							name="status"
							label="Status"
							options={statusOptions}
						/>
						<FormSelect
							control={form.control}
							name="taskCategory"
							label="Category"
							placeholder="Select category..."
							options={taskCategoryOptions}
							description="Determines which developers can see this task"
						/>
					</div>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Enter task description..."
						rows={3}
					/>

					<FormTextarea
						control={form.control}
						name="acceptanceCriteria"
						label="Acceptance Criteria"
						placeholder="What needs to be done for this task to be complete..."
						rows={2}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormSelect
							control={form.control}
							name="assignedTo"
							label="Primary Assignee"
							placeholder="Select assignee..."
							options={assigneeOptions}
						/>
						<FormInput
							control={form.control}
							name="estimatedHours"
							label="Estimated Hours"
							type="number"
							min={0}
							step={0.5}
						/>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<FormDatePicker
							control={form.control}
							name="startDate"
							label="Start Date"
						/>
						<FormDatePicker
							control={form.control}
							name="dueDate"
							label="Due Date"
						/>
						<FormInput
							control={form.control}
							name="sprintNumber"
							label="Sprint"
							type="number"
							min={1}
							placeholder="Sprint #"
						/>
					</div>

					{/* Tags */}
					{tags && tags.length > 0 && (
						<div className="space-y-2">
							<Label>Tags</Label>
							<div className="flex flex-wrap gap-2">
								{tags.map((tag) => {
									const isSelected = selectedTagIds.includes(tag.tagId);
									return (
										<Badge
											key={tag.tagId}
											variant={isSelected ? "default" : "outline"}
											className="cursor-pointer transition-colors"
											style={isSelected ? { backgroundColor: tag.color } : { borderColor: tag.color, color: tag.color }}
											onClick={() => toggleTag(tag.tagId)}
										>
											{tag.name}
										</Badge>
									);
								})}
							</div>
						</div>
					)}

					{/* Internal Notes - Admin Only */}
					<FormTextarea
						control={form.control}
						name="internalReviewerNotes"
						label="Internal Notes (Admin Only)"
						placeholder="Notes visible only to admins..."
						rows={2}
						description="These notes are only visible to users with admin permissions"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
