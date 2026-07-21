"use client";

/**
 * PaymentStagesFieldArray
 *
 * Reusable `useFieldArray` section for payment stages.
 * Used by both QuotationDirectUploadTab and ContractDirectUploadTab (Standard).
 *
 * Props:
 *  - control        : RHF control (typed as any to allow use from multiple parent schemas)
 *  - fieldArrayName : dot-path to the `payment_stages` array in the form
 *  - finalTotal     : the reference total used to compute Allocated / Remaining
 *  - currency       : display symbol
 */

import { useFieldArray, useWatch, useFormContext } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { FormInput } from "@/shared/ui/forms/FormInput";

interface PaymentStagesFieldArrayProps {
	fieldArrayName: string;
	/** The reference total. Pass 0 (not undefined) when total is not yet entered. */
	finalTotal: number;
	currency: string;
}

interface StageRow {
	amount?: number;
	percentage?: number;
}


export function PaymentStagesFieldArray({ fieldArrayName, finalTotal, currency }: PaymentStagesFieldArrayProps) {
	const { control, setValue } = useFormContext();
	const { fields, append, remove } = useFieldArray({ control, name: fieldArrayName });

	const stages = useWatch({ control, name: fieldArrayName }) as StageRow[] | undefined;

	const allocated = (stages ?? []).reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);
	const remaining = (finalTotal || 0) - allocated;
	const isOverAllocated = remaining < -0.001;

	const handleAdd = () => {
		append({ stage_name: "", percentage: 0, amount: 0 });
	};

	// BUG FIX: auto-calculate amount when percentage changes
	const handlePercentageChange = (index: number, percentageValue: string) => {
		const percentage = Number(percentageValue) || 0;
		const amount = finalTotal > 0 ? (percentage / 100) * finalTotal : 0;
		setValue(`${fieldArrayName}.${index}.amount`, Number(amount.toFixed(2)), {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	return (
		<div className="space-y-3">
			{/* Section header */}
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium">Payment Stages</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAdd}
					className="gap-1.5"
				>
					<PlusIcon className="size-3.5" />
					Add Stage
				</Button>
			</div>

			{fields.length === 0 && <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-md">No payment stages yet. Click &quot;Add Stage&quot; to begin.</p>}

			{/* Stage rows */}
			<div className="space-y-3">
				{fields.map((field, index) => (
					<div
						key={field.id}
						className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end"
					>
						<FormInput
							control={control}
							name={`${fieldArrayName}.${index}.stage_name`}
							label={index === 0 ? "Stage Name" : undefined}
							placeholder="e.g. Kickoff"
						/>
						<FormInput
							control={control}
							name={`${fieldArrayName}.${index}.percentage`}
							label={index === 0 ? "%" : undefined}
							type="number"
							placeholder="0"
							min={0}
							max={100}
							step={0.01}
							onChange={(e) => handlePercentageChange(index, e.target.value)}
						/>
						<FormInput
							control={control}
							name={`${fieldArrayName}.${index}.amount`}
							label={index === 0 ? "Amount" : undefined}
							type="number"
							placeholder="0.00"
							min={0}
							step={0.01}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={() => remove(index)}
							className={cn("text-destructive hover:text-destructive", index === 0 && "mt-6")}
							aria-label="Remove stage"
						>
							<Trash2Icon className="size-4" />
						</Button>
					</div>
				))}
			</div>

			{/* Dynamic footer — Allocated / Remaining */}
			{fields.length > 0 && (
				<>
					<Separator />
					<div
						className={cn(
							"flex items-center justify-between rounded-md px-3 py-2 text-sm",
							isOverAllocated ? "bg-destructive/10 text-destructive" : remaining > 0.001 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
						)}
					>
						<span>
							Allocated:{" "}
							<strong className="text-foreground">
								{currency}{" "}
								{allocated.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</strong>
							{" / "}
							{currency}{" "}
							{(finalTotal || 0).toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
						<span className="font-medium">
							{isOverAllocated
								? `⚠ Over-allocated by ${currency} ${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
								: remaining > 0.001
									? `Remaining: ${currency} ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
									: "✓ Fully allocated"}
						</span>
					</div>
					{(isOverAllocated || remaining > 0.001) && finalTotal > 0 && (
						<p className="text-xs text-destructive">{isOverAllocated ? "Payment stages exceed the total amount. Adjust the amounts before submitting." : "Payment stages must add up to the total amount before submitting."}</p>
					)}
				</>
			)}
		</div>
	);
}
