import { z } from "zod";

const numericInput = z.union([z.string(), z.number(), z.null(), z.undefined()]);

function parseFiniteNumber(value: string | number | null | undefined): number | null {
	if (value === "" || value === null || value === undefined) return null;
	const parsed = typeof value === "number" ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function requiredNumberInput(requiredMessage = "Required", invalidMessage = "Must be a number"): z.ZodType<number, number> {
	return numericInput.transform((value, ctx): number => {
		const parsed = parseFiniteNumber(value);

		if (parsed === null) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: requiredMessage });
			return z.NEVER;
		}

		if (Number.isNaN(parsed)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: invalidMessage });
			return z.NEVER;
		}

		return parsed;
	}) as unknown as z.ZodType<number, number>;
}

export function optionalNumberInput(invalidMessage = "Must be a number"): z.ZodType<number | undefined, number | undefined> {
	return numericInput.transform((value, ctx): number | undefined => {
		const parsed = parseFiniteNumber(value);

		if (parsed === null) return undefined;

		if (Number.isNaN(parsed)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: invalidMessage });
			return z.NEVER;
		}

		return parsed;
	}) as unknown as z.ZodType<number | undefined, number | undefined>;
}

export function nullableNumberInput(invalidMessage = "Must be a number"): z.ZodType<number | null, number | null> {
	return numericInput.transform((value, ctx): number | null => {
		const parsed = parseFiniteNumber(value);

		if (parsed === null) return null;

		if (Number.isNaN(parsed)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: invalidMessage });
			return z.NEVER;
		}

		return parsed;
	}) as unknown as z.ZodType<number | null, number | null>;
}
