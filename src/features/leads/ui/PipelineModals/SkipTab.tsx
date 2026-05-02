"use client";

import { useFormContext } from "react-hook-form";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { SKIP_REASONS } from "../../model/pipelineConstants";
import type { SkipTabFormValues } from "./stageModal.schema";

const SKIP_REASON_OPTIONS = SKIP_REASONS.map((r) => ({ value: r, label: r }));

/**
 * SkipTab — rendered inside each stage modal when the user selects "Skip".
 * Requires a skip reason (mandatory) and optional notes.
 */
export function SkipTab() {
	const { control } = useFormContext<SkipTabFormValues>();

	return (
		<div className="space-y-4">
			<FormSelect
				control={control}
				name="skipReason"
				label="Skip Reason *"
				placeholder="Select a reason…"
				options={SKIP_REASON_OPTIONS}
			/>

			<FormTextarea
				control={control}
				name="skipNotes"
				label="Notes (optional)"
				placeholder="Add any additional context…"
				rows={3}
			/>
		</div>
	);
}
