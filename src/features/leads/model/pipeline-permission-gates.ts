import { PIPELINE_STAGES, type PipelineStage } from "./pipelineConstants";

export interface PipelinePermissionAccess {
	canEditLeads: boolean;
	canConvertLeads: boolean;
	canCreateQuotations: boolean;
	canCreateContracts: boolean;
}

export function getPipelinePermissionFailure(fromStage: PipelineStage, toStage: PipelineStage, access: PipelinePermissionAccess): string | null {
	if (!access.canEditLeads) return "You do not have permission to edit leads";
	if (toStage === "closed_won" && !access.canConvertLeads) return "You do not have permission to convert leads";

	const fromIndex = PIPELINE_STAGES.indexOf(fromStage);
	const toIndex = PIPELINE_STAGES.indexOf(toStage);
	if (toIndex <= fromIndex) return null;

	const quotationIndex = PIPELINE_STAGES.indexOf("quotation");
	if (fromIndex < quotationIndex && toIndex >= quotationIndex && !access.canCreateQuotations) {
		return "You do not have permission to create quotations";
	}

	const contractIndex = PIPELINE_STAGES.indexOf("contract");
	if (fromIndex < contractIndex && toIndex >= contractIndex && !access.canCreateContracts) {
		return "You do not have permission to create contracts";
	}

	return null;
}
