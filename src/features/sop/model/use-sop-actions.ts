"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sopApi } from "@/entities/sop/api/sop.api";
import { sopKeys } from "@/entities/sop/model/query-keys";
import type { DailyCheckin, Directive, SubmitDailyCheckinPayload } from "@/entities/sop/model/types";

const COMPLETION_EVENT = "sop-checkin-completed";

function todayKey(directiveId?: number) {
	const date = new Date().toISOString().slice(0, 10);
	return directiveId ? `sop-checkin:${date}:${directiveId}` : `sop-checkin:${date}`;
}

export function isSopCheckinComplete(directiveId?: number) {
	if (typeof window === "undefined") {
		return false;
	}

	return window.localStorage.getItem(todayKey(directiveId)) === "true";
}

export function markSopCheckinComplete(directiveId?: number) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(todayKey(directiveId), "true");
	window.dispatchEvent(new CustomEvent(COMPLETION_EVENT, { detail: { directiveId } }));
}

export function listenForSopCompletion(listener: () => void) {
	if (typeof window === "undefined") {
		return () => undefined;
	}

	window.addEventListener(COMPLETION_EVENT, listener);

	return () => window.removeEventListener(COMPLETION_EVENT, listener);
}

export function useSopCheckinCompleted(directiveId?: number) {
	return useSyncExternalStore(
		(callback) => listenForSopCompletion(callback),
		() => isSopCheckinComplete(directiveId),
		() => false
	);
}

export function useTodayDirective() {
	return useQuery<Directive | null>({
		queryKey: sopKeys.today(),
		queryFn: sopApi.getTodayDirective,
		staleTime: 5 * 60 * 1000,
	});
}

export function useSubmitDailyCheckin() {
	const queryClient = useQueryClient();

	return useMutation<DailyCheckin, Error, SubmitDailyCheckinPayload>({
		mutationFn: sopApi.submitDailyCheckin,
		onSuccess: (checkin) => {
			markSopCheckinComplete(checkin.directive_id);
			queryClient.invalidateQueries({ queryKey: sopKeys.today() });
		},
	});
}

export function useSopDirectives() {
	return useQuery<Directive[]>({
		queryKey: sopKeys.directives(),
		queryFn: sopApi.getDirectives,
	});
}

export function useCreateDirective() {
	const queryClient = useQueryClient();

	return useMutation<Directive, Error, Omit<Directive, "id" | "created_at" | "updated_at">>({
		mutationFn: sopApi.createDirective,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sopKeys.directives() });
			queryClient.invalidateQueries({ queryKey: sopKeys.today() });
		},
	});
}

export function useUpdateDirective() {
	const queryClient = useQueryClient();

	return useMutation<Directive, Error, { id: number; payload: Omit<Directive, "id" | "created_at" | "updated_at"> }>({
		mutationFn: ({ id, payload }) => sopApi.updateDirective(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sopKeys.directives() });
			queryClient.invalidateQueries({ queryKey: sopKeys.today() });
		},
	});
}
