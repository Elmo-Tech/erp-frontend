"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDeleteProjectTask, useUpdateProjectTask, type ProjectTask } from "@/features/projects/api/execution.api";
import { addTaskFormDefaults, addTaskSchema, buildEditTaskFormDefaults, mapEditTaskFormToPayload, type EditTaskFormData } from "./project-task-forms";

interface UseProjectTaskMetadataActionsOptions {
	projectId: number;
	onTaskDeleted?: (task: ProjectTask) => void;
}

export function useProjectTaskMetadataActions({ projectId, onTaskDeleted }: UseProjectTaskMetadataActionsOptions) {
	const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
	const [deletingTask, setDeletingTask] = useState<ProjectTask | null>(null);
	const updateTask = useUpdateProjectTask();
	const deleteTask = useDeleteProjectTask();

	const editTaskForm = useForm<EditTaskFormData>({
		resolver: zodResolver(addTaskSchema),
		defaultValues: addTaskFormDefaults,
	});

	const openEditTaskDialog = (task: ProjectTask) => {
		editTaskForm.reset(buildEditTaskFormDefaults(task));
		setEditingTask(task);
	};

	const closeEditTaskDialog = () => {
		setEditingTask(null);
		editTaskForm.reset(addTaskFormDefaults);
	};

	const submitEditTask = editTaskForm.handleSubmit(async (data) => {
		if (!editingTask) return;

		try {
			await updateTask.mutateAsync({
				projectId,
				taskId: editingTask.taskId,
				payload: mapEditTaskFormToPayload(data),
			});
			toast.success("Task updated.");
			closeEditTaskDialog();
		} catch {
			toast.error("Failed to update task.");
		}
	});

	const confirmDeleteTask = async () => {
		if (!deletingTask) return;

		try {
			await deleteTask.mutateAsync({ projectId, taskId: deletingTask.taskId });
			toast.success("Task deleted.");
			onTaskDeleted?.(deletingTask);
			setDeletingTask(null);
		} catch {
			toast.error("Failed to delete task.");
		}
	};

	return {
		editingTask,
		deletingTask,
		editTaskForm,
		openEditTaskDialog,
		closeEditTaskDialog,
		setDeletingTask,
		submitEditTask,
		confirmDeleteTask,
		isUpdatingTask: updateTask.isPending,
		isDeletingTask: deleteTask.isPending,
	};
}
