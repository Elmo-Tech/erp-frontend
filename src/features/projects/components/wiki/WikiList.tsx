/**
 * WikiList Component
 * Displays and manages project wiki entries
 */

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText } from "lucide-react";
import { useProjectWikis, useCreateProjectWiki, useUpdateProjectWiki, useDeleteProjectWiki } from "../../hooks/useProjectWikis";
import { ProjectWiki } from "../../types/projectWiki";
import { WikiViewer } from "../WikiViewer";

import { WikiCard } from "./WikiCard";
import { CreateWikiDialog } from "./CreateWikiDialog";
import { EditWikiDialog } from "./EditWikiDialog";
import { CreateWikiFormData, UpdateWikiFormData } from "./schemas";

interface WikiListProps {
	projectId: number;
	className?: string;
}

export function WikiList({ projectId, className = "" }: WikiListProps) {
	const [selectedWiki, setSelectedWiki] = useState<ProjectWiki | null>(null);
	const [editingWiki, setEditingWiki] = useState<ProjectWiki | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const { data: wikisResponse, isLoading, error } = useProjectWikis(projectId);
	const createWikiMutation = useCreateProjectWiki();
	const updateWikiMutation = useUpdateProjectWiki();
	const deleteWikiMutation = useDeleteProjectWiki();

	const handleCreate = async (data: CreateWikiFormData) => {
		try {
			await createWikiMutation.mutateAsync({
				projectId,
				payload: data,
			});
			setIsCreateDialogOpen(false);
		} catch (error) {
			console.error("Failed to create wiki:", error);
		}
	};

	const handleUpdate = async (data: UpdateWikiFormData) => {
		if (!editingWiki) return;
		try {
			await updateWikiMutation.mutateAsync({
				projectId,
				wikiId: editingWiki.wikiId,
				payload: data,
			});
			setIsEditDialogOpen(false);
			setEditingWiki(null);
		} catch (error) {
			console.error("Failed to update wiki:", error);
		}
	};

	const handleDelete = async (wiki: ProjectWiki) => {
		try {
			await deleteWikiMutation.mutateAsync({
				projectId,
				wikiId: wiki.wikiId,
			});
			if (selectedWiki?.wikiId === wiki.wikiId) {
				setSelectedWiki(null);
			}
		} catch (error) {
			console.error("Failed to delete wiki:", error);
		}
	};

	const handleEdit = (wiki: ProjectWiki) => {
		setEditingWiki(wiki);
		setIsEditDialogOpen(true);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="flex items-center justify-between">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-10 w-24" />
				</div>
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-20 w-full"
						/>
					))}
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className={`flex items-center justify-center h-64 ${className}`}>
				<div className="text-center space-y-2">
					<AlertCircle className="h-8 w-8 text-destructive mx-auto" />
					<p className="text-sm text-muted-foreground">Failed to load wiki entries</p>
					<p className="text-xs text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	const wikis = wikisResponse?.wikis || [];

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h3 className="text-lg font-semibold">Project Wiki</h3>
					<p className="text-sm text-muted-foreground">Technical documentation and credentials for this project</p>
				</div>
				<CreateWikiDialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}
					onSubmit={handleCreate}
					isPending={createWikiMutation.isPending}
				/>
			</div>

			{/* Wiki List */}
			{wikis.length === 0 ? (
				<Card>
					<CardContent className="flex items-center justify-center h-64">
						<div className="text-center space-y-2">
							<FileText className="h-8 w-8 text-muted-foreground mx-auto" />
							<p className="text-sm text-muted-foreground">No wiki entries yet</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Wiki List */}
					<div className="space-y-3">
						{wikis.map((wiki) => (
							<WikiCard
								key={wiki.wikiId}
								wiki={wiki}
								isSelected={selectedWiki?.wikiId === wiki.wikiId}
								onSelect={() => setSelectedWiki(wiki)}
								onEdit={() => handleEdit(wiki)}
								onDelete={() => handleDelete(wiki)}
							/>
						))}
					</div>

					{/* Wiki Viewer */}
					<div className="lg:sticky lg:top-4">
						{selectedWiki ? (
							<WikiViewer
								wiki={selectedWiki}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						) : (
							<Card>
								<CardContent className="flex items-center justify-center h-64">
									<div className="text-center space-y-2">
										<FileText className="h-8 w-8 text-muted-foreground mx-auto" />
										<p className="text-sm text-muted-foreground">Select a wiki entry to view its content</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			)}

			{/* Edit Dialog */}
			<EditWikiDialog
				open={isEditDialogOpen}
				onOpenChange={(open) => {
					setIsEditDialogOpen(open);
					if (!open) setEditingWiki(null);
				}}
				wiki={editingWiki}
				onSubmit={handleUpdate}
				isPending={updateWikiMutation.isPending}
			/>
		</div>
	);
}
