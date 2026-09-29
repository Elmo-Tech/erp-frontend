import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrPoliciesApi } from "../api";
import type { CreateHrPolicyPayload } from "../types";

export const hrPolicyKeys = {
	all: ["hr", "policies"] as const,
	current: () => [...hrPolicyKeys.all, "current"] as const,
	list: () => [...hrPolicyKeys.all, "list"] as const,
};

export function useCurrentHrPolicy() {
	return useQuery({
		queryKey: hrPolicyKeys.current(),
		queryFn: () => hrPoliciesApi.getCurrent(),
	});
}

export function useHrPolicies() {
	return useQuery({
		queryKey: hrPolicyKeys.list(),
		queryFn: () => hrPoliciesApi.getAll(),
	});
}

export function useCreateHrPolicy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateHrPolicyPayload) => hrPoliciesApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: hrPolicyKeys.all });
		},
	});
}
