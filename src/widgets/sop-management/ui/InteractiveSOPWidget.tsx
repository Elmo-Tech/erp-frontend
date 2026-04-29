"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react";
import { SOPCheckinFlow } from "@/features/sop/ui/SOPCheckinFlow";
import { useTodayDirective } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";

export function InteractiveSOPWidget() {
	const directiveQuery = useTodayDirective();
	const directive = directiveQuery.data;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Morning SOP</h1>
					<p className="text-sm text-muted-foreground">Read the operating rhythm and submit today&apos;s three priorities.</p>
				</div>
				<Button
					asChild
					variant="outline"
					size="sm"
				>
					<Link href="/dashboard">
						<ArrowLeft data-icon="inline-start" />
						Dashboard
					</Link>
				</Button>
			</div>

			{directiveQuery.isLoading ? (
				<div className="flex min-h-72 items-center justify-center rounded-md border text-sm text-muted-foreground">
					<Loader2 className="mr-2 size-4 animate-spin" />
					Loading directive
				</div>
			) : directiveQuery.error ? (
				<div className="flex min-h-72 items-center justify-center rounded-md border px-4 text-center text-sm text-muted-foreground">Unable to load today&apos;s SOP.</div>
			) : directive ? (
				<SOPCheckinFlow directive={directive} />
			) : (
				<div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-md border px-4 text-center">
					<ClipboardCheck className="size-5 text-muted-foreground" />
					<p className="text-sm font-medium">No SOP directive assigned</p>
					<p className="max-w-sm text-sm text-muted-foreground">Your permissions do not currently match an active morning directive.</p>
				</div>
			)}
		</div>
	);
}
