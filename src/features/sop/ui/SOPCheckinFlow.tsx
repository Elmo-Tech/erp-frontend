"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ClipboardList, Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Directive } from "@/entities/sop/model/types";
import { SOPPhaseCard } from "@/entities/sop/ui/SOPPhaseCard";
import { useSubmitDailyCheckin } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

interface SOPCheckinFlowProps {
	directive: Directive;
	onSubmitted?: () => void;
	className?: string;
}

const PRIORITY_COUNT = 3;
const PRIORITY_INDEXES = Array.from({ length: PRIORITY_COUNT }, (_, index) => index);

const checkinSchema = z.object({
	priorities: z.array(z.string().trim().min(2, "Priority is required")).length(PRIORITY_COUNT),
});

type CheckinFormValues = z.infer<typeof checkinSchema>;

export function SOPCheckinFlow({ directive, onSubmitted, className }: SOPCheckinFlowProps) {
	const router = useRouter();
	const submitCheckin = useSubmitDailyCheckin();
	const phases = directive.phases ?? [];
	const [acknowledgedPhases, setAcknowledgedPhases] = useState<boolean[]>(() => phases.map(() => false));
	const allAcknowledged = phases.length === 0 || acknowledgedPhases.every(Boolean);

	const form = useForm<CheckinFormValues>({
		resolver: zodResolver(checkinSchema),
		defaultValues: {
			priorities: Array.from({ length: PRIORITY_COUNT }, () => ""),
		},
		mode: "onChange",
	});

	const acknowledgedCount = acknowledgedPhases.filter(Boolean).length;

	const setPhaseAcknowledged = (index: number, checked: boolean) => {
		setAcknowledgedPhases((current) => current.map((value, phaseIndex) => (phaseIndex === index ? checked : value)));
	};

	const onSubmit = async (values: CheckinFormValues) => {
		try {
			await submitCheckin.mutateAsync({
				directive_id: directive.id,
				focus_items: values.priorities.map((priority) => priority.trim()),
			});
			toast.success("Daily check-in submitted");
			onSubmitted?.();
			router.replace("/dashboard");
		} catch {
			toast.error("Unable to submit check-in");
		}
	};

	return (
		<div className={cn("mx-auto w-full max-w-2xl space-y-4", className)}>
			<section className="rounded-md border border-border bg-background">
				<div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<h1 className="text-xl font-semibold tracking-tight text-foreground">{directive.title}</h1>
						{directive.description ? <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{directive.description}</p> : null}
					</div>
					<div className="shrink-0 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
						{acknowledgedCount}/{phases.length} acknowledged
					</div>
				</div>

				<div className="space-y-2 p-3">
					{phases.length ? (
						phases.map((phase, index) => (
							<SOPPhaseCard
								key={`${phase.name}-${index}`}
								phase={phase}
								index={index}
								checked={acknowledgedPhases[index] ?? false}
								onCheckedChange={(checked) => setPhaseAcknowledged(index, checked)}
							/>
						))
					) : (
						<div className="rounded-md border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">No phases configured for this directive.</div>
					)}
				</div>
			</section>

			<section className={cn("rounded-md border border-border bg-background transition-all duration-200", allAcknowledged ? "opacity-100" : "opacity-70")}>
				{allAcknowledged ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-0"
						>
							<div className="flex items-start gap-3 border-b border-border px-4 py-4">
								<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/35 bg-primary/[0.04] text-primary">
									<ClipboardList className="size-4" />
								</div>
								<div className="min-w-0">
									<h2 className="text-sm font-semibold">Top 3 Priorities for Today</h2>
									<p className="mt-1 text-xs leading-5 text-muted-foreground">Keep each priority outcome-based and specific enough to review tonight.</p>
								</div>
							</div>

							<div className="space-y-3 p-4">
								{PRIORITY_INDEXES.map((index) => (
									<FormField
										key={index}
										control={form.control}
										name={`priorities.${index}`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium text-muted-foreground">Priority {index + 1}</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Write one clear outcome"
														autoComplete="off"
														className="h-10 bg-background text-sm shadow-none"
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
								))}
							</div>

							<div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
								<p className="text-xs text-muted-foreground">Submitting opens the dashboard for the day.</p>
								<Button
									type="submit"
									size="sm"
									disabled={!form.formState.isValid || submitCheckin.isPending}
								>
									{submitCheckin.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 data-icon="inline-start" />}
									Submit & Start Day
								</Button>
							</div>
						</form>
					</Form>
				) : (
					<div className="flex items-center gap-3 px-4 py-4 text-sm text-muted-foreground">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
							<LockKeyhole className="size-4" />
						</div>
						<div>
							<p className="font-medium text-foreground">Acknowledge every phase to continue</p>
							<p className="mt-0.5 text-xs">The priority check-in unlocks once the operating rhythm is reviewed.</p>
						</div>
					</div>
				)}
			</section>
		</div>
	);
}
