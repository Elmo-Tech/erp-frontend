/**
 * Create Task Dialog Component
 * Form for creating new tasks
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDialog, FormInput, FormSelect, FormTextarea } from "@/components/shared";
import { toast } from "sonner";
import { useCreateTask } from "../../hooks/useTasks";
import { TaskStatus, TaskType, TaskPriority, TaskPriorityLabels } from "../../types/task";

const taskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	projectId: z.string().optional(),
	priority: z.nativeEnum(TaskPriority),
	dueDate: z.string().optional().nullable(),
	startDate: z.string().optional().nullable(),
	estimatedHours: z.number().min(0, "Must be 0 or greater").optional(),
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

	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split("T")[0];

	const form = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			description: "",
			projectId: "",
			priority: TaskPriority.MEDIUM,
			dueDate: "",
			startDate: today, // Set today's date as default
			estimatedHours: 0,
		},
	});

	const handleSubmit = async (data: TaskFormData) => {
		try {
			await createTask.mutateAsync({
				title: data.title,
				description: data.description || undefined,
				projectId: data.projectId && data.projectId !== "my" ? Number(data.projectId) : undefined,
				priority: data.priority,
				dueDate: data.dueDate || undefined,
				startDate: data.startDate || undefined,
				estimatedHours: data.estimatedHours || undefined,
				assignedTo: currentUserId,
				status: TaskStatus.TODO,
				type: TaskType.MAIN,
			});

			toast.success("Task created successfully");
			onOpenChange(false);
			form.reset();
		} catch {
			toast.error("Failed to create task");
		}
	};

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
				<div className="space-y-4">
					<FormInput
						control={form.control}
						name="title"
						label="Title *"
						placeholder="What needs to be done?"
					/>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Add more details..."
						rows={3}
					/>

					<FormSelect
						control={form.control}
						name="projectId"
						label="Project (Optional)"
						placeholder="Personal task (no project)"
						options={projectOptions}
						description="Leave empty for a personal task."
					/>

					<div className="grid grid-cols-3 gap-4">
						<FormSelect
							control={form.control}
							name="priority"
							label="Priority"
							options={priorityOptions}
						/>

						<FormInput
							control={form.control}
							name="startDate"
							label="Start Date"
							type="date"
						/>

						<FormInput
							control={form.control}
							name="dueDate"
							label="Due Date"
							type="date"
						/>
					</div>

					<FormInput
						control={form.control}
						name="estimatedHours"
						label="Estimated Hours"
						type="number"
						min={0}
						step={0.5}
						placeholder="0"
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
