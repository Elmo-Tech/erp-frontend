"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column, ConfirmDialog } from "@/components/shared";
import { useProjectWikis, useDeleteProjectWiki } from "../../hooks/useProjectWikis";
import { ProjectWiki } from "../../types/projectWiki";
import { WikiFormDialog } from "./WikiFormDialog";
import { WikiViewerDialog } from "./WikiViewerDialog";
import { Plus, BookOpen, Eye, Pencil, Trash2, Lock, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { usePermissions } from "@/features/admin/hooks/usePermissions";

interface WikiTabProps {
	projectId: number;
}

export function WikiTab({ projectId }: WikiTabProps) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [wikiToEdit, setWikiToEdit] = useState<ProjectWiki | null>(null);
	const [wikiToView, setWikiToView] = useState<ProjectWiki | null>(null);
	const [wikiToDelete, setWikiToDelete] = useState<ProjectWiki | null>(null);

	const { data, isLoading, error } = useProjectWikis(projectId);
	const deleteWiki = useDeleteProjectWiki();

	// Permission checks
	const { canCreateWiki, canEditWiki, canDeleteWiki, canViewEncryptedContent } = usePermissions();

	const handleDelete = async () => {
		if (!wikiToDelete) return;

		try {
			await deleteWiki.mutateAsync({
				projectId,
				wikiId: wikiToDelete.wikiId,
			});
			toast.success("Wiki entry deleted successfully");
			setWikiToDelete(null);
		} catch {
			toast.error("Failed to delete wiki entry");
		}
	};

	const columns: Column<ProjectWiki>[] = [
		{
			key: "title",
			header: "Title",
			render: (wiki) => (
				<div className="flex items-center gap-2">
					<span className="font-medium">{wiki.title}</span>
					{wiki.isEncrypted && (
						<Badge
							variant="outline"
							className="gap-1"
						>
							<Lock className="h-3 w-3" />
							Encrypted
						</Badge>
					)}
				</div>
			),
		},
		{
			key: "updatedAt",
			header: "Last Updated",
			render: (wiki) => format(new Date(wiki.updatedAt), "MMM d, yyyy HH:mm"),
		},
		{
			key: "actions",
			header: "",
			render: (wiki) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setWikiToView(wiki)}>
							<Eye className="h-4 w-4 mr-2" />
							View
						</DropdownMenuItem>
						{canEditWiki && (
							<DropdownMenuItem onClick={() => setWikiToEdit(wiki)}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
						)}
						{canDeleteWiki && (
							<DropdownMenuItem
								onClick={() => setWikiToDelete(wiki)}
								className="text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<>
			<DataTable
				title="Project Wiki"
				titleBadge={data?.wikis ? `${data.wikis.length} entries` : undefined}
				columns={columns}
				data={data?.wikis || []}
				keyExtractor={(wiki) => wiki.wikiId}
				isLoading={isLoading}
				error={error}
				onRowClick={(wiki) => setWikiToView(wiki)}
				emptyState={{
					icon: BookOpen,
					title: "No wiki entries",
					description: "Create documentation and store credentials securely.",
					action: canCreateWiki ? { label: "Create Entry", onClick: () => setShowCreateDialog(true) } : undefined,
				}}
				headerActions={
					canCreateWiki ? (
						<Button onClick={() => setShowCreateDialog(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add Entry
						</Button>
					) : undefined
				}
			/>

			<WikiFormDialog
				projectId={projectId}
				open={showCreateDialog || (!!wikiToEdit && canEditWiki)}
				onOpenChange={(open: boolean) => {
					if (!open) {
						setShowCreateDialog(false);
						setWikiToEdit(null);
					}
				}}
				wiki={wikiToEdit}
			/>

			<WikiViewerDialog
				wiki={wikiToView}
				open={!!wikiToView}
				onOpenChange={() => setWikiToView(null)}
				onEdit={
					canEditWiki
						? () => {
								setWikiToEdit(wikiToView);
								setWikiToView(null);
						  }
						: undefined
				}
				canViewEncrypted={canViewEncryptedContent}
			/>

			<ConfirmDialog
				open={!!wikiToDelete}
				onOpenChange={() => setWikiToDelete(null)}
				title="Delete Wiki Entry"
				description={`Are you sure you want to delete "${wikiToDelete?.title}"? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				variant="destructive"
				isLoading={deleteWiki.isPending}
			/>
		</>
	);
}
