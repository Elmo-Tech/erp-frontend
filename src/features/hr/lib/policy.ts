import type { CreateHrPolicyPayload, HrLateDeductionTiers, HrPolicy, HrPolicyFormValues, HrPolicySettings } from "../types";

export const MAX_LATE_DEDUCTION_TIERS = 20;

export function validateLateDeductionTiers(tiers: HrLateDeductionTiers): true | string {
	if (tiers.length < 1 || tiers.length > MAX_LATE_DEDUCTION_TIERS) {
		return `Configure between 1 and ${MAX_LATE_DEDUCTION_TIERS} late ranges.`;
	}

	for (const [index, tier] of tiers.entries()) {
		const range = `Range ${index + 1}`;
		if (!Number.isInteger(tier.minimumMinutes) || tier.minimumMinutes < 0 || tier.minimumMinutes > 1440) {
			return `${range}: From must be a whole number between 0 and 1440 minutes.`;
		}
		if (tier.maximumMinutes !== null && (!Number.isInteger(tier.maximumMinutes) || tier.maximumMinutes < tier.minimumMinutes || tier.maximumMinutes > 1440)) {
			return `${range}: Through must be a whole number from ${tier.minimumMinutes} to 1440, or blank for no upper limit.`;
		}
		if (index > 0) {
			const previousMaximum = tiers[index - 1].maximumMinutes;
			if (previousMaximum === null) {
				return `Range ${index}: Only the last range can have no upper limit.`;
			}
			if (tier.minimumMinutes <= previousMaximum) {
				return `${range}: Ranges must be ordered and must not overlap.`;
			}
		}
		if (tier.percentages.length !== 4 || tier.percentages.some((percentage) => !Number.isInteger(percentage) || percentage < 0 || percentage > 100)) {
			return `${range}: Each deduction percentage must be a whole number between 0 and 100.`;
		}
	}

	return true;
}

export function normalizeHrPolicySettings(settings: HrPolicySettings): HrPolicySettings {
	return {
		...settings,
		// Tasks have one persisted supervisor, so the policy value is fixed to one.
		taskSupervisorLimit: 1,
		afterHoursIntervalMinutes: settings.afterHoursIntervalMinutes ?? 60,
		afterHoursGraceMinutes: settings.afterHoursGraceMinutes ?? 10,
		workingDays: [...settings.workingDays],
		lateDeductionTiers: settings.lateDeductionTiers.map((tier) => ({
			...tier,
			percentages: [...tier.percentages] as [number, number, number, number],
		})),
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
