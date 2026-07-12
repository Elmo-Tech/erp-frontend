"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useCreateMilestone, useCreateTask } from "@/features/projects/api/execution.api";
import {
	addMilestoneFormDefaults,
	addMilestoneSchema,
	addTaskFormDefaults,
	addTaskSchema,
	buildAddTaskFormDefaults,
	mapAddMilestoneFormToPayload,
	mapAddTaskFormToPayload,
	type AddMilestoneFormData,
	type AddTaskFormData,
} from "./project-task-forms";

export function useProjectTaskCreationDialogs(projectId: number) {
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const [milestoneOpen, setMilestoneOpen] = useState(false);
	const [taskOpen, setTaskOpen] = useState(false);
	const createMilestone = useCreateMilestone();
	const createTask = useCreateTask();

	const milestoneForm = useForm<AddMilestoneFormData>({
		resolver: zodResolver(addMilestoneSchema),
		defaultValues: addMilestoneFormDefaults,
	});

	const taskForm = useForm<AddTaskFormData>({
		resolver: zodResolver(addTaskSchema),
		defaultValues: addTaskFormDefaults,
	});

	const openMilestoneDialog = useCallback(() => {
		milestoneForm.reset(addMilestoneFormDefaults);
		setMilestoneOpen(true);
	}, [milestoneForm]);

	const openTaskDialog = useCallback(() => {
		taskForm.reset(buildAddTaskFormDefaults(currentUserId));
		setTaskOpen(true);
	}, [currentUserId, taskForm]);

	const submitMilestone = milestoneForm.handleSubmit(async (data) => {
		try {
			await createMilestone.mutateAsync({ projectId, payload: mapAddMilestoneFormToPayload(data) });
			toast.success("Milestone created.");
			setMilestoneOpen(false);
			milestoneForm.reset(addMilestoneFormDefaults);
		} catch {
			toast.error("Failed to create milestone.");
		}
	});

	const submitTask = taskForm.handleSubmit(async (data) => {
		try {
			await createTask.mutateAsync({ projectId, payload: mapAddTaskFormToPayload(data) });
			toast.success("Task created.");
			setTaskOpen(false);
			taskForm.reset(addTaskFormDefaults);
		} catch {
			toast.error("Failed to create task.");
		}
	});

	return {
		milestoneOpen,
		setMilestoneOpen,
		taskOpen,
		setTaskOpen,
		milestoneForm,
		taskForm,
		openMilestoneDialog,
		openTaskDialog,
		submitMilestone,
		submitTask,
		isCreatingMilestone: createMilestone.isPending,
		isCreatingTask: createTask.isPending,
	};
}
