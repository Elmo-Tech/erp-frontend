"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLogManualTime, useUpdateTimeEntry } from "../api/execution.api";
import type { ProjectTask, ProjectTimeEntry } from "../api/execution.api";

export interface ManualTimeFormData {
	date: string;
	startTime: string;
	endTime: string;
	note?: string;
}

const manualTimeSchema = z
	.object({
		date: z.string().min(1, "Date is required"),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
		note: z.string().optional(),
	})
	.refine(
		(data) => {
			const start = new Date(`${data.date}T${data.startTime}`);
			const end = new Date(`${data.date}T${data.endTime}`);
			return end > start;
		},
		{ message: "End time must be after start time", path: ["endTime"] },
	);

function defaultManualTimeValues(): ManualTimeFormData {
	return {
		date: new Date().toISOString().slice(0, 10),
		startTime: "09:00",
		endTime: "10:00",
		note: "",
	};
}

function buildManualTimePayload(data: ManualTimeFormData) {
	return {
		startTime: `${data.date}T${data.startTime}:00`,
		endTime: `${data.date}T${data.endTime}:00`,
		note: data.note?.trim() || undefined,
	};
}

interface UseTaskManualTimeDialogParams {
	task: ProjectTask | null;
	projectId: number;
}

export function useTaskManualTimeDialog({ task, projectId }: UseTaskManualTimeDialogParams) {
	const [manualTimeOpen, setManualTimeOpen] = useState(false);
	const [editingTimeEntry, setEditingTimeEntry] = useState<ProjectTimeEntry | null>(null);
	const logManualTime = useLogManualTime();
	const updateTimeEntry = useUpdateTimeEntry();

	const manualTimeForm = useForm<ManualTimeFormData>({
		resolver: zodResolver(manualTimeSchema),
		defaultValues: defaultManualTimeValues(),
	});

	const closeManualTimeDialog = useCallback(() => {
		setManualTimeOpen(false);
		setEditingTimeEntry(null);
		manualTimeForm.reset(defaultManualTimeValues());
	}, [manualTimeForm]);

	const saveManualTimeEntry = useCallback(
		async (payload: ReturnType<typeof buildManualTimePayload>) => {
			if (!task) return;

			if (editingTimeEntry) {
				await updateTimeEntry.mutateAsync({
					projectId,
					taskId: task.taskId,
					entryId: editingTimeEntry.entryId,
					payload,
				});
				return;
			}

			await logManualTime.mutateAsync({
				projectId,
				taskId: task.taskId,
				payload,
			});
		},
		[editingTimeEntry, logManualTime, projectId, task, updateTimeEntry],
	);

	const submitManualTime = manualTimeForm.handleSubmit(async (formData) => {
		if (!task) return;

		try {
			await saveManualTimeEntry(buildManualTimePayload(formData));
			toast.success(editingTimeEntry ? "Time entry updated." : "Time logged.");
			closeManualTimeDialog();
		} catch {
			toast.error(editingTimeEntry ? "Failed to update time entry." : "Failed to log time.");
		}
	});

	const editTimeEntry = useCallback(
		(entry: ProjectTimeEntry) => {
			const start = entry.startTime ? new Date(entry.startTime) : new Date();
			const end = entry.endTime ? new Date(entry.endTime) : start;

			manualTimeForm.reset({
				date: start.toISOString().slice(0, 10),
				startTime: start.toTimeString().slice(0, 5),
				endTime: end.toTimeString().slice(0, 5),
				note: entry.note ?? "",
			});
			setEditingTimeEntry(entry);
			setManualTimeOpen(true);
		},
		[manualTimeForm],
	);

	const openManualTimeDialog = useCallback(() => {
		manualTimeForm.reset(defaultManualTimeValues());
		setEditingTimeEntry(null);
		setManualTimeOpen(true);
	}, [manualTimeForm]);

	const changeManualTimeOpen = useCallback((nextOpen: boolean) => {
		setManualTimeOpen(nextOpen);
		if (!nextOpen) {
			setEditingTimeEntry(null);
		}
	}, []);

	return {
		manualTimeOpen,
		editingTimeEntry,
		manualTimeForm,
		isManualTimeSaving: logManualTime.isPending || updateTimeEntry.isPending,
		openManualTimeDialog,
		editTimeEntry,
		changeManualTimeOpen,
		submitManualTime,
	};
}
