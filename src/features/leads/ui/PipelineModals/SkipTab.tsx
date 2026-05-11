"use client";

import { useFormContext } from "react-hook-form";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useSettingsDictionary } from "@/shared/api/settings.api";
import type { SkipTabFormValues } from "./stageModal.schema";

/**
 * SkipTab — rendered inside each stage modal when the user selects "Skip".
 *
 * BUG FIX: skip reasons were hardcoded from pipelineConstants.ts.
 * Now loaded dynamically from settings/skip-reasons dictionary so the
 * business team can manage them without a code deploy.
 */
export function SkipTab() {
	const { control } = useFormContext<SkipTabFormValues>();

	// Dynamic skip reasons from settings dictionary
	const skipReasonsDict = useSettingsDictionary("skip-reasons");

	return (
		<div className="space-y-4">
			<FormCombobox
				control={control}
				name="skipReason"
				label="Skip Reason *"
				placeholder={skipReasonsDict.isLoading ? "Loading reasons…" : "Select a reason…"}
				searchPlaceholder="Search reasons…"
				emptyText="No reason found."
				options={skipReasonsDict.options}
				disabled={skipReasonsDict.isLoading}
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
