"use client";

/**
 * ContractDirectUploadTab
 *
 * "Direct Upload" tab rendered inside the Contract stage modal.
 *
 * Sections:
 *  1. Document Upload
 *  2. Legal & Timelines  — dev/review/testing days, delay penalty, source code
 *                          handover, execution start date, working days/week
 *  3. Financials         — contract_model select drives conditional rendering:
 *       • Standard       → Currency, Total Amount, Payment Stages (shared component)
 *       • SaaS           → Currency, Setup Fee, Recurring Fee, Billing Cycle,
 *                          Subscription Start Date, Apply Promo toggle + Add-ons array
 *  4. Notes
 */

import { useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { FormFileInput } from "@/shared/ui/forms/FormFileInput";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormSwitch } from "@/shared/ui/forms/FormSwitch";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import { BILLING_CYCLES, CONTRACT_MODELS } from "./stageModal.schema";
import { PaymentStagesFieldArray } from "./PaymentStagesFieldArray";

// ─── option lists ────────────────────────────────────────────────────────────
// BUG FIX: CURRENCY_OPTIONS was hardcoded — now loaded from settings/currencies
// via useSettingsDictionary inside the component.

const BILLING_CYCLE_OPTIONS = BILLING_CYCLES.map((b) => ({
	value: b,
	label: b === "monthly" ? "Monthly" : b === "quarterly" ? "Quarterly" : b === "semi_annual" ? "Semi-Annual" : "Annual",
}));

const CONTRACT_MODEL_OPTIONS = CONTRACT_MODELS.map((m) => ({
	value: m,
	label: m === "standard" ? "Standard" : "SaaS Subscription",
}));

// ─────────────────────────────────────────────────────────────────────────────

export function ContractDirectUploadTab() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { control } = useFormContext<any>();

	const contractModel = useWatch({ control, name: "contract_model" }) as string | undefined;
	const totalAmount = useWatch({ control, name: "total_amount" }) as number | undefined;
	const currency = useWatch({ control, name: "currency" }) as string | undefined;
	const applyPromo = useWatch({ control, name: "apply_promo" }) as boolean | undefined;

	// BUG FIX: currency options loaded dynamically from settings/currencies
	const currencyDict = useSettingsDictionary("currencies");

	const {
		fields: addonFields,
		append: appendAddon,
		remove: removeAddon,
	} = useFieldArray({
		control,
		name: "addons",
	});

	return (
		<div className="space-y-5">
			{/* ── 1. Document Upload ─────────────────────────────────────────── */}
			<FormFileInput
				control={control}
				name="upload_file"
				label="Contract Document (PDF)"
				description="Accepted format: PDF · Max size: 10 MB"
				accept=".pdf"
			/>

			<Separator />

			{/* ── 2. Legal & Timelines ───────────────────────────────────────── */}
			<div>
				<p className="text-sm font-medium mb-3">Legal &amp; Timelines</p>
				<div className="grid grid-cols-2 gap-3">
					<FormInput
						control={control}
						name="development_days"
						label="Development Days"
						type="number"
						placeholder="0"
						min={1}
						step={1}
					/>
					<FormInput
						control={control}
						name="review_days"
						label="Review Days"
						type="number"
						placeholder="0"
						min={0}
						step={1}
					/>
					<FormInput
						control={control}
						name="testing_days"
						label="Testing Days"
						type="number"
						placeholder="0"
						min={0}
						step={1}
					/>
					<FormInput
						control={control}
						name="delay_penalty"
						label="Delay Penalty (%)"
						type="number"
						placeholder="0"
						min={0}
						max={100}
						step={0.01}
					/>
					<FormDatePicker
						control={control}
						name="execution_start_date"
						label="Execution Start Date"
					/>
					<FormInput
						control={control}
						name="working_days_per_week"
						label="Working Days / Week"
						type="number"
						placeholder="5"
						min={1}
						max={7}
						step={1}
					/>
				</div>

				<div className="mt-3">
					<FormSwitch
						control={control}
						name="source_code_handover"
						label="Source Code Handover"
						description="Client will receive the full source code upon project completion."
					/>
				</div>
			</div>

			<Separator />

			{/* ── 3. Financials ──────────────────────────────────────────────── */}
			<div className="space-y-4">
				<p className="text-sm font-medium">Financials</p>

				<FormSelect
					control={control}
					name="contract_model"
					label="Contract Model"
					placeholder="Select model…"
					options={CONTRACT_MODEL_OPTIONS}
				/>

				{/* ── Standard ─────────────────────────────────────────────── */}
				{contractModel === "standard" && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<FormSelect
								control={control}
								name="currency"
								label="Currency"
								placeholder={currencyDict.isLoading ? "Loading currencies…" : "Select currency…"}
								options={currencyDict.options}
								disabled={currencyDict.isLoading}
							/>
							<FormInput
								control={control}
								name="total_amount"
								label="Total Amount"
								type="number"
								placeholder="0.00"
								min={0}
								step={0.01}
							/>
						</div>
						<PaymentStagesFieldArray
							fieldArrayName="payment_stages"
							finalTotal={totalAmount ?? 0}
							currency={currency ?? ""}
						/>{" "}
					</div>
				)}

				{/* ── SaaS Subscription ────────────────────────────────────── */}
				{contractModel === "saas_subscription" && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<FormSelect
								control={control}
								name="currency"
								label="Currency"
								placeholder={currencyDict.isLoading ? "Loading currencies…" : "Select currency…"}
								options={currencyDict.options}
								disabled={currencyDict.isLoading}
							/>
							<FormInput
								control={control}
								name="setup_fee"
								label="Setup Fee"
								type="number"
								placeholder="0.00"
								min={0}
								step={0.01}
							/>
							<FormInput
								control={control}
								name="recurring_fee"
								label="Recurring Fee"
								type="number"
								placeholder="0.00"
								min={0}
								step={0.01}
							/>
							<FormSelect
								control={control}
								name="billing_cycle"
								label="Billing Cycle"
								placeholder="Select cycle…"
								options={BILLING_CYCLE_OPTIONS}
							/>
							<FormDatePicker
								control={control}
								name="subscription_start_date"
								label="Subscription Start Date"
								className="col-span-2"
							/>
						</div>

						<FormSwitch
							control={control}
							name="apply_promo"
							label="Apply Promo / Discount"
							description="Enable to apply a percentage discount to the subscription."
						/>

						{applyPromo && (
							<FormInput
								control={control}
								name="promo_discount"
								label="Discount (%)"
								type="number"
								placeholder="0"
								min={0}
								max={100}
								step={0.01}
							/>
						)}

						{/* Add-ons */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Add-ons</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="gap-1.5"
									onClick={() => appendAddon({ name: "", price: 0 })}
								>
									<PlusIcon className="size-3.5" />
									Add Add-on
								</Button>
							</div>

							{addonFields.length === 0 && <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-md">No add-ons yet.</p>}

							{addonFields.map((field, index) => (
								<div
									key={field.id}
									className="grid grid-cols-[1fr_120px_auto] gap-2 items-end"
								>
									<FormInput
										control={control}
										name={`addons.${index}.name`}
										label={index === 0 ? "Add-on Name" : undefined}
										placeholder="e.g. Extra Storage"
									/>
									<FormInput
										control={control}
										name={`addons.${index}.price`}
										label={index === 0 ? "Price" : undefined}
										type="number"
										placeholder="0.00"
										min={0}
										step={0.01}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={() => removeAddon(index)}
										className={`text-destructive hover:text-destructive${index === 0 ? " mt-6" : ""}`}
										aria-label="Remove add-on"
									>
										<Trash2Icon className="size-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

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
