/**
 * Create Task Dialog Component
 * Full-featured form for creating new tasks (same as internal project tasks)
 */

"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormTextarea, FormDatePicker } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateTask, useTags } from "../../hooks/useTasks";
import { useTaskCategories } from "@/features/admin/hooks/useEnums";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { TaskStatus, TaskStatusLabels, TaskType, TaskTypeLabels, TaskPriority, TaskPriorityLabels } from "../../types/task";

const taskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	projectId: z.string().optional(),
	status: z.nativeEnum(TaskStatus),
	type: z.nativeEnum(TaskType),
	priority: z.nativeEnum(TaskPriority),
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

interface CreateTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projects: Array<{ projectId: number; title: string }>;
	currentUserId?: number;
}

export function CreateTaskDialog({ open, onOpenChange, projects, currentUserId }: CreateTaskDialogProps) {
	const createTask = useCreateTask();
	const { data: tags } = useTags();
	const { data: taskCategoriesData } = useTaskCategories();
	const { data: usersData } = useUsers();

	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split("T")[0];

	const form = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			description: "",
			projectId: "",
			status: TaskStatus.TODO,
			type: TaskType.MAIN,
			priority: TaskPriority.MEDIUM,
			assignedTo: currentUserId?.toString() || "none",
			taskCategory: "none",
			estimatedHours: 0,
			dueDate: null,
			startDate: today,
			sprintNumber: null,
			tagIds: [],
			internalReviewerNotes: "",
		},
	});

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
			const assignedTo = data.assignedTo && data.assignedTo !== "none" ? Number(data.assignedTo) : null;
			const projectId = data.projectId && data.projectId !== "" && data.projectId !== "my" ? Number(data.projectId) : undefined;

			await createTask.mutateAsync({
				title: data.title,
				description: data.description || undefined,
				projectId,
				status: data.status,
				type: data.type,
				priority: data.priority,
				assignedTo,
				taskCategory: data.taskCategory === "none" ? undefined : data.taskCategory,
				estimatedHours: Number(data.estimatedHours),
				dueDate: data.dueDate || undefined,
				startDate: data.startDate || undefined,
				sprintNumber: data.sprintNumber || undefined,
				tagIds: data.tagIds,
				internalReviewerNotes: data.internalReviewerNotes || undefined,
			});

			toast.success("Task created successfully");
			onOpenChange(false);
			form.reset();
		} catch {
			toast.error("Failed to create task");
		}
	};

	const statusOptions = Object.values(TaskStatus).map((status) => ({
		value: status,
		label: TaskStatusLabels[status],
	}));

	const typeOptions = Object.values(TaskType).map((type) => ({
		value: type,
		label: TaskTypeLabels[type],
	}));

	const priorityOptions = Object.values(TaskPriority).map((priority) => ({
		value: priority,
		label: TaskPriorityLabels[priority],
	}));

	const projectOptions = [
		{ value: "my", label: "Personal task (no project)" },
		...projects.map((project) => ({
			value: project.projectId.toString(),
			label: project.title,
		})),
	];

	const taskCategoryOptions = useMemo(
		() => [
			{ value: "none", label: "No Category" },
			...(taskCategoriesData?.data?.map((category) => ({
				value: category.value,
				label: category.label,
			})) || []),
		],
		[taskCategoriesData]
	);

	const assigneeOptions = useMemo(() => {
		const options = [{ value: "none", label: "Unassigned" }];
		if (usersData?.users) {
			options.push(
				...usersData.users.map((user) => ({
					value: user.userId.toString(),
					label: user.name,
				}))
			);
		}
		return options;
	}, [usersData]);

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Create New Task"
			submitLabel="Create Task"
			isLoading={createTask.isPending}
			onSubmit={form.handleSubmit(handleSubmit)}
			size="xxl"
		>
			<Form {...form}>
				<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
					<FormInput
						control={form.control}
						name="title"
						label="Title *"
						placeholder="Enter task title..."
					/>

					<FormSelect
						control={form.control}
						name="projectId"
						label="Project (Optional)"
						placeholder="Personal task (no project)"
						options={projectOptions}
						description="Leave empty for a personal task"
					/>

					<div className="grid grid-cols-3 gap-4">
						<FormSelect
							control={form.control}
							name="type"
							label="Type"
							options={typeOptions}
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
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormSelect
							control={form.control}
							name="assignedTo"
							label="Assignee"
							placeholder="Select assignee..."
							options={assigneeOptions}
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

					<div className="grid grid-cols-3 gap-4">
						<FormInput
							control={form.control}
							name="estimatedHours"
							label="Estimated Hours"
							type="number"
							min={0}
							step={0.5}
						/>
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
				</div>
			</Form>
		</FormDialog>
	);
}
