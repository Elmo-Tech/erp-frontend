import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadConversionApi, ConvertLeadPayload } from "../api/leadConversion";

export function useCanConvertLead(leadId: number) {
	return useQuery({
		queryKey: ["lead-can-convert", leadId],
		queryFn: () => leadConversionApi.canConvert(leadId),
		enabled: !!leadId,
	});
}

export function useConvertLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ leadId, payload }: { leadId: number; payload?: ConvertLeadPayload }) => leadConversionApi.convert(leadId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
