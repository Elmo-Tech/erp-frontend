"use client";

import { useState } from "react";
import { Database, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	useCreateProjectWiki,
	useDeleteProjectWiki,
	useProjectWikis,
	useUpdateProjectWiki,
	type ProjectWiki,
	type ProjectWikiPayload,
} from "@/features/projects/api/execution.api";
import { Can } from "@/shared/ui/Can";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";
import { formatDateDisplay } from "@/shared/lib/dateUtils";

interface ProjectDevelopmentDataTabProps {
	projectId: number;
}

interface WikiFormState {
	title: string;
	content: string;
	isEncrypted: boolean;
}

const emptyForm: WikiFormState = {
	title: "",
	content: "",
	isEncrypted: true,
};

export function ProjectDevelopmentDataTab({ projectId }: ProjectDevelopmentDataTabProps) {
	const wikisQuery = useProjectWikis(projectId);
	const createWiki = useCreateProjectWiki();
	const updateWiki = useUpdateProjectWiki();
	const deleteWiki = useDeleteProjectWiki();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingWiki, setEditingWiki] = useState<ProjectWiki | null>(null);
	const [deletingWiki, setDeletingWiki] = useState<ProjectWiki | null>(null);
	const [form, setForm] = useState<WikiFormState>(emptyForm);
	const isSaving = createWiki.isPending || updateWiki.isPending;

	function openCreateDialog() {
		setEditingWiki(null);
		setForm(emptyForm);
		setDialogOpen(true);
	}

	function openEditDialog(wiki: ProjectWiki) {
		setEditingWiki(wiki);
		setForm({
			title: wiki.title,
			content: wiki.content,
			isEncrypted: wiki.isEncrypted,
		});
		setDialogOpen(true);
	}

	function handleEditorOpenChange(open: boolean) {
		setDialogOpen(open);
		if (!open) {
			setEditingWiki(null);
			setForm(emptyForm);
		}
	}

	async function submitWiki() {
		const payload: ProjectWikiPayload = {
			title: form.title.trim(),
			content: form.content.trim(),
			isEncrypted: form.isEncrypted,
		};

		if (!payload.title || !payload.content) {
			toast.error("Title and content are required.");
			return;
		}

		try {
			if (editingWiki) {
				await updateWiki.mutateAsync({ projectId, wikiId: editingWiki.wikiId, payload });
				toast.success("Development data updated.");
			} else {
				await createWiki.mutateAsync({ projectId, payload });
				toast.success("Development data saved.");
			}
			handleEditorOpenChange(false);
		} catch {
			toast.error("Failed to save development data.");
		}
	}

	async function confirmDelete() {
		if (!deletingWiki) return;

		try {
			await deleteWiki.mutateAsync({ projectId, wikiId: deletingWiki.wikiId });
			toast.success("Development data deleted.");
			setDeletingWiki(null);
		} catch {
			toast.error("Failed to delete development data.");
		}
	}

	if (wikisQuery.isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (wikisQuery.error) {
		return <div className="rounded-md border px-3 py-6 text-sm text-destructive">{wikisQuery.error.message}</div>;
	}

	const wikis = wikisQuery.data ?? [];

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold tracking-tight">Development Data</h2>
					<p className="text-sm text-muted-foreground">Credentials, environments, API notes, and handoff data for this project.</p>
				</div>
				<Can permission={["create_wiki", "manage_wiki"]}>
					<Button size="sm" onClick={openCreateDialog}>
						<Plus className="size-4" />
						Add Data
					</Button>
				</Can>
			</div>

			{wikis.length === 0 ? (
				<div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 text-center">
					<Database className="size-6 text-muted-foreground" />
					<div>
						<p className="text-sm font-medium">No development data yet</p>
						<p className="text-sm text-muted-foreground">Add credentials, endpoints, repository notes, or deployment data when development starts.</p>
					</div>
					<Can permission={["create_wiki", "manage_wiki"]}>
						<Button size="sm" onClick={openCreateDialog}>
							<Plus className="size-4" />
							Add Data
						</Button>
					</Can>
				</div>
			) : (
				<div className="grid gap-3">
					{wikis.map((wiki) => (
						<article key={wiki.wikiId} className="rounded-md border bg-background">
							<div className="flex flex-col gap-3 border-b px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between">
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="truncate text-sm font-semibold">{wiki.title}</h3>
										{wiki.isEncrypted && (
											<Badge variant="secondary" className="gap-1 rounded-sm">
												<Lock className="size-3" />
												Encrypted
											</Badge>
										)}
									</div>
									<p className="mt-0.5 text-xs text-muted-foreground">Updated {formatDateDisplay(wiki.updatedAt)}</p>
								</div>
								<div className="flex shrink-0 items-center gap-1">
									<Can permission={["edit_wiki", "manage_wiki"]}>
										<Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${wiki.title}`} onClick={() => openEditDialog(wiki)}>
											<Pencil className="size-4" />
										</Button>
									</Can>
									<Can permission={["delete_wiki", "manage_wiki"]}>
										<Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${wiki.title}`} onClick={() => setDeletingWiki(wiki)}>
											<Trash2 className="size-4" />
										</Button>
									</Can>
								</div>
							</div>
							<pre className="max-h-64 overflow-auto whitespace-pre-wrap px-3 py-3 text-sm leading-6 text-foreground">{wiki.content}</pre>
						</article>
					))}
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={handleEditorOpenChange}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>{editingWiki ? "Edit Development Data" : "Add Development Data"}</DialogTitle>
						<DialogDescription>Use this for credentials, development links, environment notes, and handoff details.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="wiki-title">Title</Label>
							<Input id="wiki-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Production API credentials" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="wiki-content">Content</Label>
							<Textarea id="wiki-content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} rows={10} placeholder="Host, username, password, repository, branch, API keys, notes..." />
						</div>
						<label className="flex items-center gap-2 text-sm">
							<Checkbox checked={form.isEncrypted} onCheckedChange={(checked) => setForm((current) => ({ ...current, isEncrypted: checked === true }))} />
							Encrypt stored content
						</label>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => handleEditorOpenChange(false)}>
							Cancel
						</Button>
						<Button type="button" onClick={submitWiki} disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(deletingWiki)} onOpenChange={(open) => !open && setDeletingWiki(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Development Data</DialogTitle>
						<DialogDescription>This will remove {deletingWiki?.title} from the project.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setDeletingWiki(null)}>
							Cancel
						</Button>
						<Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteWiki.isPending}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
