import { useMutation, useQueryClient } from "@tanstack/react-query";
import { portalAccessApi, CreatePortalAccessPayload, ResetPasswordPayload } from "../api/portalAccess";

export function useCreatePortalAccess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, payload }: { clientId: number; payload?: CreatePortalAccessPayload }) => portalAccessApi.create(clientId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}

export function useRevokePortalAccess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (clientId: number) => portalAccessApi.revoke(clientId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}

export function useResetPortalPassword() {
	return useMutation({
		mutationFn: ({ clientId, payload }: { clientId: number; payload?: ResetPasswordPayload }) => portalAccessApi.resetPassword(clientId, payload),
	});
}
