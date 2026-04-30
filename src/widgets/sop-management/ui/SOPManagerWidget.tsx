"use client";

import { useState } from "react";
import { Edit3, FileText, Plus, RefreshCcw } from "lucide-react";
import type { Directive } from "@/entities/sop/model/types";
import { SOPBuilderForm } from "@/features/sop/ui/SOPBuilderForm";
import { useSopDirectives } from "@/features/sop/model/use-sop-actions";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export function SOPManagerWidget() {
	const directivesQuery = useSopDirectives();
	const directives = directivesQuery.data ?? [];
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingDirective, setEditingDirective] = useState<Directive | null>(null);

	const openCreateDialog = () => {
		setEditingDirective(null);
		setDialogOpen(true);
	};

	const openEditDialog = (directive: Directive) => {
		setEditingDirective(directive);
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		setEditingDirective(null);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">Manage SOPs</h1>
					<p className="mt-1 text-sm text-muted-foreground">Create and maintain the Morning SOP shown to PMO during check-in.</p>
				</div>
				<Button
					type="button"
					size="sm"
					onClick={openCreateDialog}
				>
					<Plus data-icon="inline-start" />
					Create New SOP
				</Button>
			</div>

			<section className="overflow-hidden rounded-md border border-border bg-card">
				<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
					<div>
						<h2 className="text-sm font-medium">SOP Library</h2>
						<p className="mt-0.5 text-xs text-muted-foreground">{directives.length} directive{directives.length === 1 ? "" : "s"}</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => directivesQuery.refetch()}
						disabled={directivesQuery.isFetching}
					>
						<RefreshCcw data-icon="inline-start" className={directivesQuery.isFetching ? "animate-spin" : undefined} />
						Refresh
					</Button>
				</div>

				{directivesQuery.isLoading ? (
					<div className="space-y-2 p-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : directivesQuery.error ? (
					<div className="flex min-h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">Unable to load SOP directives.</div>
				) : directives.length ? (
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="px-4 text-xs text-muted-foreground">Directive</TableHead>
								<TableHead className="text-xs text-muted-foreground">Phases</TableHead>
								<TableHead className="text-xs text-muted-foreground">Audience</TableHead>
								<TableHead className="text-xs text-muted-foreground">Updated</TableHead>
								<TableHead className="w-16 px-4 text-right text-xs text-muted-foreground">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{directives.map((directive) => (
								<TableRow key={directive.id}>
									<TableCell className="max-w-[320px] px-4">
										<div className="flex min-w-0 items-center gap-3">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
												<FileText className="size-4" />
											</div>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium text-foreground">{directive.title}</p>
												<p className="truncate text-xs text-muted-foreground">{directive.description || "No description"}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-sm tabular-nums text-muted-foreground">{directive.phases?.length ?? 0}</TableCell>
									<TableCell className="text-xs text-muted-foreground">{formatAudience(directive)}</TableCell>
									<TableCell className="text-xs text-muted-foreground">{formatDate(directive.updated_at ?? directive.created_at)}</TableCell>
									<TableCell className="px-4 text-right">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onClick={() => openEditDialog(directive)}
											aria-label={`Edit ${directive.title}`}
										>
											<Edit3 className="size-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 text-center">
						<FileText className="size-5 text-muted-foreground" />
						<p className="text-sm font-medium">No SOPs created yet</p>
						<p className="max-w-sm text-sm text-muted-foreground">Create the first Morning SOP for PMO check-in.</p>
					</div>
				)}
			</section>

			<Dialog
				open={dialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						closeDialog();
						return;
					}
					setDialogOpen(true);
				}}
			>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 shadow-none">
					<DialogHeader className="border-b border-border px-5 py-4">
						<DialogTitle className="text-base">{editingDirective ? "Edit SOP" : "Create SOP"}</DialogTitle>
						<DialogDescription>This directive is assigned to users with the `view_morning_sop` permission.</DialogDescription>
					</DialogHeader>
					<div className="px-5 pb-5">
						<SOPBuilderForm
							key={editingDirective?.id ?? "create"}
							directive={editingDirective}
							onSaved={closeDialog}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function formatAudience(directive: Directive) {
	const permissions = directive.target_permissions ?? [];

	return permissions.length ? permissions.map((permission) => permission.replaceAll("_", " ")).join(", ") : "All users";
}

function formatDate(value?: string) {
	if (!value) {
		return "Never";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}
