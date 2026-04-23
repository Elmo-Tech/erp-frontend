"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projectApi } from "@/entities/project/api/project.api";
import { projectKeys } from "@/entities/project/model/query-keys";
import { taskApi } from "@/entities/task/api/task.api";
import { taskKeys } from "@/entities/task/model/query-keys";
import { TaskPriority, TaskPriorityLabels, TaskStatus, TaskStatusLabels, TaskType, TaskTypeLabels } from "@/entities/task/model/types";
import { userApi } from "@/entities/user/api/user.api";
import { enumConfigApi, enumConfigKeys } from "@/shared/config/enums.api";
import { Badge } from "@/shared/ui/badge";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect, type SelectOption } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { createTaskSchema, getCreateTaskDefaultValues, toCreateTaskPayload, type CreateTaskFormData } from "../model/task.schema";
import { useCreateTask } from "../model/use-task-actions";

interface CreateTaskFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId?: number;
	projectTitle?: string;
	parentId?: number | null;
	currentUserId?: number;
	currentUserName?: string;
	defaultType?: TaskType;
	onSuccess?: () => void;
}

const STATUS_OPTIONS = Object.values(TaskStatus).map((status) => ({
	value: status,
	label: TaskStatusLabels[status],
}));

const TYPE_OPTIONS = Object.values(TaskType).map((type) => ({
	value: type,
	label: TaskTypeLabels[type],
}));

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
	value: priority,
	label: TaskPriorityLabels[priority],
}));

export function CreateTaskForm({ open, onOpenChange, projectId, projectTitle, parentId = null, currentUserId, currentUserName, defaultType = TaskType.MAIN, onSuccess }: CreateTaskFormProps) {
	const createTask = useCreateTask();
	const form = useForm<CreateTaskFormData>({
		resolver: zodResolver(createTaskSchema),
		defaultValues: getCreateTaskDefaultValues({ projectId, currentUserId, defaultType }),
	});

	const selectedProjectId = useWatch({
		control: form.control,
		name: "projectId",
	});
	const selectedTagIds = useWatch({
		control: form.control,
		name: "tagIds",
	}) ?? [];
	const effectiveProjectId = projectId ?? (selectedProjectId && selectedProjectId !== "personal" ? Number(selectedProjectId) : undefined);

	const projectsQuery = useQuery({
		queryKey: projectKeys.list({ perPage: 100 }),
		queryFn: () => projectApi.getProjects({ perPage: 100 }),
		enabled: open && !projectId,
		staleTime: 5 * 60 * 1000,
	});

	const employeesQuery = useQuery({
		queryKey: ["employees", { isActive: true, perPage: 100 }],
		queryFn: () => userApi.getEmployees({ isActive: true, perPage: 100 }),
		enabled: open && !effectiveProjectId,
		staleTime: 5 * 60 * 1000,
	});

	const projectMembersQuery = useQuery({
		queryKey: effectiveProjectId ? projectKeys.members(effectiveProjectId) : projectKeys.members(0),
		queryFn: () => projectApi.getProjectMembers(effectiveProjectId ?? 0),
		enabled: open && Boolean(effectiveProjectId),
		staleTime: 5 * 60 * 1000,
	});

	const tagsQuery = useQuery({
		queryKey: taskKeys.tags(),
		queryFn: taskApi.getTags,
		enabled: open,
		staleTime: 30 * 60 * 1000,
	});

	const taskCategoriesQuery = useQuery({
		queryKey: enumConfigKeys.taskCategories(),
		queryFn: enumConfigApi.getTaskCategories,
		enabled: open,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (open) {
			form.reset(getCreateTaskDefaultValues({ projectId, currentUserId, defaultType }));
		}
	}, [currentUserId, defaultType, form, open, projectId]);

	const projectOptions = useMemo<SelectOption[]>(() => {
		if (projectId) {
			return [{ value: String(projectId), label: projectTitle || `Project #${projectId}` }];
		}

		return [
			{ value: "personal", label: "Personal task" },
			...(projectsQuery.data?.projects ?? []).map((project) => ({
				value: String(project.projectId),
				label: project.title,
			})),
		];
	}, [projectId, projectTitle, projectsQuery.data?.projects]);

	const assigneeOptions = useMemo<SelectOption[]>(() => {
		const options: SelectOption[] = [{ value: "none", label: "Unassigned" }];

		if (effectiveProjectId && projectMembersQuery.data?.members) {
			options.push(
				...projectMembersQuery.data.members.map((member) => ({
					value: String(member.userId),
					label: member.user?.name || `User #${member.userId}`,
				}))
			);
		} else if (employeesQuery.data?.employees) {
			options.push(
				...employeesQuery.data.employees.map((employee) => ({
					value: String(employee.userId),
					label: employee.name,
				}))
			);
		}

		if (currentUserId && !options.some((option) => option.value === String(currentUserId))) {
			options.push({
				value: String(currentUserId),
				label: currentUserName || "Current user",
			});
		}

		return options;
	}, [currentUserId, currentUserName, effectiveProjectId, employeesQuery.data, projectMembersQuery.data]);

	const taskCategoryOptions = useMemo<SelectOption[]>(
		() => [
			{ value: "none", label: "No category" },
			...(taskCategoriesQuery.data?.data ?? []).map((category) => ({
				value: category.value,
				label: category.label,
			})),
		],
		[taskCategoriesQuery.data?.data]
	);

	const toggleTag = (tagId: number) => {
		const currentTagIds = form.getValues("tagIds") ?? [];
		form.setValue("tagIds", currentTagIds.includes(tagId) ? currentTagIds.filter((id) => id !== tagId) : [...currentTagIds, tagId], {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			form.reset(getCreateTaskDefaultValues({ projectId, currentUserId, defaultType }));
		}

		onOpenChange(isOpen);
	};

	const handleSubmit = async (data: CreateTaskFormData) => {
		try {
			await createTask.mutateAsync(toCreateTaskPayload(data, projectId, parentId));
			toast.success("Task created successfully");
			onOpenChange(false);
			onSuccess?.();
		} catch {
			toast.error("Failed to create task");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="New task"
			description={projectId ? "Create a task for this project." : "Create a personal or project task."}
			submitLabel="Create task"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={createTask.isPending}
			isSubmitDisabled={!projectId && projectsQuery.isLoading}
			size="xxl"
		>
			<Form {...form}>
				<div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-2">
					<FormInput
						control={form.control}
						name="title"
						label="Title"
						placeholder="Implement task board"
					/>

					<FormSelect
						control={form.control}
						name="projectId"
						label="Project"
						placeholder="Select project"
						options={projectOptions}
						disabled={Boolean(projectId)}
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<FormSelect
							control={form.control}
							name="type"
							label="Type"
							options={TYPE_OPTIONS}
							disabled={Boolean(parentId)}
						/>
						<FormSelect
							control={form.control}
							name="priority"
							label="Priority"
							options={PRIORITY_OPTIONS}
						/>
						<FormSelect
							control={form.control}
							name="status"
							label="Status"
							options={STATUS_OPTIONS}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormSelect
							control={form.control}
							name="assignedTo"
							label="Assignee"
							placeholder="Select assignee"
							options={assigneeOptions}
							disabled={employeesQuery.isLoading || projectMembersQuery.isLoading}
						/>
						<FormSelect
							control={form.control}
							name="taskCategory"
							label="Category"
							placeholder="Select category"
							options={taskCategoryOptions}
							disabled={taskCategoriesQuery.isLoading}
						/>
					</div>

					<FormTextarea
						control={form.control}
						name="description"
						label="Description"
						placeholder="Scope, constraints, or acceptance notes"
						rows={3}
					/>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<FormInput
							control={form.control}
							name="estimatedHours"
							label="Estimated hours"
							type="number"
							min={0}
							step={0.5}
						/>
						<FormDatePicker
							control={form.control}
							name="startDate"
							label="Start"
						/>
						<FormDatePicker
							control={form.control}
							name="dueDate"
							label="Due"
						/>
						<FormDatePicker
							control={form.control}
							name="expectedResolutionDate"
							label="Expected close"
						/>
					</div>

					{tagsQuery.data && tagsQuery.data.length > 0 && (
						<div className="flex flex-col gap-2">
							<Label>Tags</Label>
							<div className="flex flex-wrap gap-2">
								{tagsQuery.data.map((tag) => {
									const isSelected = selectedTagIds.includes(tag.tagId);

									return (
										<Badge
											key={tag.tagId}
											variant={isSelected ? "default" : "outline"}
											className={cn("cursor-pointer rounded-sm", !isSelected && "bg-background")}
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
