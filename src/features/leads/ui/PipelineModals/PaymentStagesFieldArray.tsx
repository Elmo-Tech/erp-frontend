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

import { useFieldArray, useWatch, useFormContext, type Control } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { FormInput } from "@/shared/ui/forms/FormInput";

interface PaymentStagesFieldArrayProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	fieldArrayName: string;
	finalTotal: number;
	currency: string;
}

interface StageRow {
	amount?: number;
	percentage?: number;
}

export function PaymentStagesFieldArray({ control, fieldArrayName, finalTotal, currency }: PaymentStagesFieldArrayProps) {
	const { fields, append, remove } = useFieldArray({ control, name: fieldArrayName });

	// useFormContext gives us the same control — useWatch needs the exact control ref
	const { control: ctxControl } = useFormContext();
	const stages = useWatch({ control: ctxControl, name: fieldArrayName }) as StageRow[] | undefined;

	const allocated = (stages ?? []).reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);
	const remaining = (finalTotal || 0) - allocated;
	const isOverAllocated = remaining < -0.001;

	const handleAdd = () => {
		append({ stage_name: "", percentage: 0, amount: 0 });
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
					<div className={cn("flex items-center justify-between rounded-md px-3 py-2 text-sm", isOverAllocated ? "bg-destructive/10 text-destructive" : "bg-muted/60 text-muted-foreground")}>
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
						<span className={cn("font-medium", isOverAllocated && "text-destructive")}>
							Remaining: {currency}{" "}
							{remaining.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
							{isOverAllocated && " ⚠ Over-allocated"}
						</span>
					</div>
				</>
			)}
		</div>
	);
}
