import { useMutation } from "@tanstack/react-query";
import { ClientProject } from "../types/clientProject";

export const useApproveUI = () => {
	return useMutation<ClientProject, Error, number>({
		mutationFn: async () => {
			throw new Error("Client UI approval is disabled in The Tables ERP.");
		},
	});
};
