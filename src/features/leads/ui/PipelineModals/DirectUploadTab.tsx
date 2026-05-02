"use client";

/**
 * DirectUploadTab — Generic direct-upload tab for Meeting and Proposal stages.
 * Only requires a PDF file and optional notes (no financial fields).
 */

import { useFormContext } from "react-hook-form";
import { FormFileInput } from "@/shared/ui/forms/FormFileInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import type { DirectUploadTabFormValues } from "./stageModal.schema";

export function DirectUploadTab() {
	const { control } = useFormContext<DirectUploadTabFormValues>();

	return (
		<div className="space-y-4">
			<FormFileInput
				control={control}
				name="upload_file"
				label="Upload Document (PDF)"
				description="Accepted format: PDF · Max size: 10 MB"
				accept=".pdf"
			/>

			<FormTextarea
				control={control}
				name="notes"
				label="Notes (optional)"
				placeholder="Add any additional context…"
				rows={3}
			/>
		</div>
	);
}
