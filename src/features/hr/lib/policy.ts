import type { CreateHrPolicyPayload, HrPolicy, HrPolicyFormValues, HrPolicySettings } from "../types";

export function normalizeHrPolicySettings(settings: HrPolicySettings): HrPolicySettings {
	return {
		...settings,
		// Tasks have one persisted supervisor, so the policy value is fixed to one.
		taskSupervisorLimit: 1,
		workingDays: [...settings.workingDays],
		lateDeductionTiers: settings.lateDeductionTiers.map((tier) => ({
			...tier,
			percentages: [...tier.percentages] as [number, number, number, number],
		})) as HrPolicySettings["lateDeductionTiers"],
	};
}

export function toHrPolicyFormValues(policy: HrPolicy): HrPolicyFormValues {
	return {
		settings: normalizeHrPolicySettings(policy.settings),
		effectiveFrom: "",
		notes: "",
	};
}

export function buildCreateHrPolicyPayload(values: HrPolicyFormValues): CreateHrPolicyPayload {
	const effectiveFrom = values.effectiveFrom.trim();
	const notes = values.notes.trim();

	return {
		settings: normalizeHrPolicySettings(values.settings),
		...(effectiveFrom ? { effectiveFrom } : {}),
		...(notes ? { notes } : {}),
	};
}
