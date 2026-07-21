"use client";

/**
 * ProposalDirectUploadTab
 *
 * "Direct Upload" tab rendered inside the Proposal stage modal.
 *
 * Layout:
 *  1. Source switcher  — segmented control: "Upload New" vs "Use Template"
 *  2. Conditional      — PDF file input (upload_new) OR template selector (use_template)
 *  3. Validity Date    — FormDatePicker (calendar popover, no native input)
 *  4. Notes            — optional free-text
 */

import { useFormContext, useWatch } from "react-hook-form";
import { Upload, LayoutTemplate } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Separator } from "@/shared/ui/separator";
import { FormFileInput } from "@/shared/ui/forms/FormFileInput";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { FormDatePicker } from "@/shared/ui/forms/FormDatePicker";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { useGetProposalTemplates } from "@/features/leads/api/leads.api";
import type { ProposalStageModalValues } from "./stageModal.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Extract the direct_upload branch type for strong typing in this component
// ─────────────────────────────────────────────────────────────────────────────

type ProposalUploadFormValues = Extract<ProposalStageModalValues, { mode: "direct_upload" }>;

// ─────────────────────────────────────────────────────────────────────────────
// Segmented control item
// ─────────────────────────────────────────────────────────────────────────────

interface SegmentProps {
	value: string;
	current: string;
	icon: React.ElementType;
	label: string;
	description: string;
	onClick: (v: string) => void;
}

function Segment({ value, current, icon: Icon, label, description, onClick }: SegmentProps) {
	const isActive = value === current;
	return (
		<button
			type="button"
			onClick={() => onClick(value)}
			className={cn(
				"flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				isActive ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
			)}
		>
			<div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors", isActive ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground")}>
				<Icon className="size-4" />
			</div>
			<div className="min-w-0">
				<p className={cn("text-sm font-semibold leading-tight", isActive ? "text-primary" : "text-foreground")}>{label}</p>
				<p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
			</div>
		</button>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProposalDirectUploadTab() {
	const { control, setValue, clearErrors } = useFormContext<ProposalUploadFormValues>();
	const templatesQuery = useGetProposalTemplates();

	const proposalSource = useWatch({ control, name: "proposal_source" }) as string | undefined;
	const isUpload = !proposalSource || proposalSource === "upload_new";
	const templateOptions = (templatesQuery.data ?? []).map((template) => ({
		value: String(template.id),
		label: template.name,
	}));

	const handleSourceChange = (value: "upload_new" | "use_template") => {
		setValue("proposal_source", value);
		// Clear the field that no longer applies to avoid stale validation errors
		if (value === "upload_new") {
			setValue("template_id", undefined);
		} else {
			setValue("upload_file", undefined);
		}
		clearErrors(["upload_file", "template_id"]);
	};

	return (
		<div className="space-y-5">
			{/* ── 1. Source Switcher ─────────────────────────────────────────── */}
			<div>
				<p className="text-sm font-medium mb-3">Proposal Source</p>
				<div className="flex gap-3">
					<Segment
						value="upload_new"
						current={proposalSource ?? "upload_new"}
						icon={Upload}
						label="Upload New"
						description="Attach a PDF you've prepared"
						onClick={(v) => handleSourceChange(v as "upload_new" | "use_template")}
					/>
					<Segment
						value="use_template"
						current={proposalSource ?? "upload_new"}
						icon={LayoutTemplate}
						label="Use Template"
						description="Generate from a saved template"
						onClick={(v) => handleSourceChange(v as "upload_new" | "use_template")}
					/>
				</div>
			</div>

			<Separator />

			{/* ── 2. Conditional: File or Template ──────────────────────────── */}
			{isUpload ? (
				<FormFileInput
					control={control}
					name="upload_file"
					label="Proposal Document (PDF)"
					description="Accepted format: PDF · Max size: 10 MB"
					accept=".pdf"
				/>
			) : (
				<FormSelect
					control={control}
					name="template_id"
					label="Proposal Template"
					placeholder={templatesQuery.isPending ? "Loading templates…" : "Select a template…"}
					description={templatesQuery.isError ? "Templates could not be loaded. Please try again." : undefined}
					options={templateOptions}
					disabled={templatesQuery.isPending || templatesQuery.isError}
				/>
			)}

			<Separator />

			{/* ── 3. Validity Date ───────────────────────────────────────────── */}
			<FormDatePicker
				control={control}
				name="validity_date"
				label="Validity Date"
				placeholder="Pick an expiry date…"
				description="The proposal will expire after this date."
				minDate={new Date()}
			/>

			<Separator />

			{/* ── 4. Notes ───────────────────────────────────────────────────── */}
			<FormTextarea
				control={control}
				name="notes"
				label="Notes (optional)"
				placeholder="Key points, assumptions, or any additional context…"
				rows={2}
			/>
		</div>
	);
}
