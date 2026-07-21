"use client";

/**
 * QuotationDirectUploadTab
 *
 * "Direct Upload" tab rendered inside the Quotation stage modal.
 *
 * Sections:
 *  1. Document Upload  — PDF file
 *  2. Financials       — Base Price, Commission Type, Currency, Final Total
 *  3. Payment Stages   — useFieldArray with live Allocated / Remaining footer
 *  4. Notes            — optional
 */

import { useFormContext, useWatch } from "react-hook-form";
import { Separator } from "@/shared/ui/separator";
import { FormFileInput } from "@/shared/ui/forms/FormFileInput";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import { CURRENCIES, COMMISSION_TYPES, type QuotationDirectUploadValues } from "./stageModal.schema";
import { PaymentStagesFieldArray } from "./PaymentStagesFieldArray";

// ─── option lists ────────────────────────────────────────────────────────────

const DEFAULT_CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));

const COMMISSION_TYPE_OPTIONS = COMMISSION_TYPES.map((t) => ({
	value: t,
	label: t === "percentage" ? "Percentage (%)" : "Fixed Amount",
}));

// ─────────────────────────────────────────────────────────────────────────────

export function QuotationDirectUploadTab() {
	const { control } = useFormContext<QuotationDirectUploadValues>();
	const currencyDict = useSettingsDictionary("currencies");
	const currencyOptions = currencyDict.options.length > 0 ? currencyDict.options : DEFAULT_CURRENCY_OPTIONS;

	// Live-watch values needed for the payment stages footer
	const finalTotal = useWatch({ control, name: "final_total" }) as number | undefined;
	const currency = useWatch({ control, name: "currency" }) as string | undefined;

	return (
		<div className="space-y-5">
			{/* ── 1. Document Upload ─────────────────────────────────────────── */}
			<FormFileInput
				control={control}
				name="upload_file"
				label="Quotation Document (PDF)"
				description="Accepted format: PDF · Max size: 10 MB"
				accept=".pdf"
			/>

			<Separator />

			{/* ── 2. Financials ──────────────────────────────────────────────── */}
			<div>
				<p className="text-sm font-medium mb-3">Financials</p>
				<div className="grid grid-cols-2 gap-3">
					<FormInput
						control={control}
						name="base_price"
						label="Base Price"
						type="number"
						placeholder="0.00"
						min={0}
						step={0.01}
					/>
					<FormSelect
						control={control}
						name="commission_type"
						label="Commission Type"
						placeholder="Select type…"
						options={COMMISSION_TYPE_OPTIONS}
					/>
					<FormSelect
						control={control}
						name="currency"
						label="Currency"
						placeholder={currencyDict.isLoading ? "Loading currencies…" : "Select currency…"}
						options={currencyOptions}
						disabled={currencyDict.isLoading && currencyOptions.length === 0}
					/>
					<FormInput
						control={control}
						name="final_total"
						label="Final Total"
						type="number"
						placeholder="0.00"
						min={0}
						step={0.01}
					/>
				</div>
			</div>

			<Separator />

			{/* ── 3. Payment Stages ──────────────────────────────────────────── */}
			<PaymentStagesFieldArray
				fieldArrayName="payment_stages"
				finalTotal={finalTotal ?? 0}
				currency={currency ?? ""}
			/>

			<Separator />

			{/* ── 4. Notes ───────────────────────────────────────────────────── */}
			<FormTextarea
				control={control}
				name="notes"
				label="Notes (optional)"
				placeholder="Any additional context…"
				rows={2}
			/>
		</div>
	);
}
