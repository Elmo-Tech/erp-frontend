"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Directive } from "@/entities/sop/model/types";
import { SOPPhaseCard } from "@/entities/sop/ui/SOPPhaseCard";
import { useSubmitDailyCheckin } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

interface SOPCheckinFlowProps {
	directive: Directive;
	compact?: boolean;
	onSubmitted?: () => void;
	className?: string;
}

const PRIORITY_COUNT = 3;

export function SOPCheckinFlow({ directive, compact = false, onSubmitted, className }: SOPCheckinFlowProps) {
	const [activeStep, setActiveStep] = useState(0);
	const [focusItems, setFocusItems] = useState(() => Array.from({ length: PRIORITY_COUNT }, () => ""));
	const submitCheckin = useSubmitDailyCheckin();
	const phases = directive.phases ?? [];
	const canAdvance = activeStep < phases.length;
	const allPrioritiesReady = useMemo(() => focusItems.every((item) => item.trim().length >= 2), [focusItems]);

	const updateFocusItem = (index: number, value: string) => {
		setFocusItems((currentItems) => currentItems.map((item, itemIndex) => (itemIndex === index ? value : item)));
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!allPrioritiesReady || submitCheckin.isPending) {
			return;
		}

		try {
			await submitCheckin.mutateAsync({
				directive_id: directive.id,
				focus_items: focusItems.map((item) => item.trim()),
			});
			toast.success("Daily check-in submitted");
			onSubmitted?.();
		} catch {
			toast.error("Unable to submit check-in");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn("grid gap-4", compact ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-[minmax(0,1fr)_360px]", className)}
		>
			<section className="overflow-hidden rounded-md border bg-background">
				<div className="border-b px-4 py-3">
					<h2 className="text-sm font-medium">{directive.title}</h2>
					{directive.description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{directive.description}</p>}
				</div>

				<div className="space-y-2 p-3">
					{phases.length ? (
						phases.map((phase, index) => (
							<SOPPhaseCard
								key={`${phase.name}-${index}`}
								phase={phase}
								index={index}
								active={index === activeStep}
								complete={index < activeStep}
							/>
						))
					) : (
						<div className="rounded-md border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">No phases configured for this directive.</div>
					)}
				</div>
			</section>

			<section className="h-fit rounded-md border bg-background">
				<div className="border-b px-4 py-3">
					<h2 className="text-sm font-medium">Top 3 priorities</h2>
					<p className="mt-1 text-xs text-muted-foreground">Commit to the work that matters before opening the rest of the day.</p>
				</div>

				<div className="space-y-3 p-4">
					{focusItems.map((item, index) => (
						<label
							key={index}
							className="block space-y-1.5"
						>
							<span className="text-xs font-medium text-muted-foreground">Priority {index + 1}</span>
							<Textarea
								value={item}
								onChange={(event) => updateFocusItem(index, event.target.value)}
								placeholder="Write one clear outcome"
								className="min-h-20 resize-none text-sm"
								maxLength={500}
							/>
						</label>
					))}
				</div>

				<div className="flex items-center justify-between gap-2 border-t p-3">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={!canAdvance}
						onClick={() => setActiveStep((currentStep) => Math.min(currentStep + 1, phases.length))}
					>
						{canAdvance ? (
							<>
								Next phase
								<ArrowRight data-icon="inline-end" />
							</>
						) : (
							<>
								<CheckCircle2 data-icon="inline-start" />
								Reviewed
							</>
						)}
					</Button>

					<Button
						type="submit"
						size="sm"
						disabled={!allPrioritiesReady || submitCheckin.isPending}
					>
						{submitCheckin.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 data-icon="inline-start" />}
						Submit
					</Button>
				</div>
			</section>
		</form>
	);
}
