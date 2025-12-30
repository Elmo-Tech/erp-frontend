"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Plus, Edit, Trash2, Lock, FileText, Calendar } from "lucide-react";
import { useProjectWikis, useCreateProjectWiki, useUpdateProjectWiki, useDeleteProjectWiki } from "../hooks/useProjectWikis";
import { ProjectWiki, CreateProjectWikiPayload, UpdateProjectWikiPayload } from "../types/projectWiki";
import { WikiViewer } from "./WikiViewer";
import { z } from "zod";

// Form schemas - using explicit types to avoid resolver type inference issues
const createWikiSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	content: z.string().min(1, "Content is required"),
	isEncrypted: z.boolean(),
});

const updateWikiSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
	content: z.string().min(1, "Content is required").optional(),
	isEncrypted: z.boolean().optional(),
});

type CreateWikiFormData = {
	title: string;
	content: string;
	isEncrypted: boolean;
};
type UpdateWikiFormData = z.infer<typeof updateWikiSchema>;

interface WikiListProps {
	projectId: number;
	className?: string;
}

/**
 * WikiList component for displaying and managing project wiki entries
 * Requirements: 12.2, 12.6, 12.7, 12.8
 */
export const WikiList: React.FC<WikiListProps> = ({ projectId, className = "" }) => {
	const [selectedWiki, setSelectedWiki] = useState<ProjectWiki | null>(null);
	const [editingWiki, setEditingWiki] = useState<ProjectWiki | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Fetch wikis data
	const { data: wikisResponse, isLoading, error } = useProjectWikis(projectId);
	const createWikiMutation = useCreateProjectWiki();
	const updateWikiMutation = useUpdateProjectWiki();
	const deleteWikiMutation = useDeleteProjectWiki();

	// Create form
	const createForm = useForm<CreateWikiFormData>({
		resolver: zodResolver(createWikiSchema),
		defaultValues: {
			title: "",
			content: "",
			isEncrypted: false,
		},
	});

	// Update form
	const updateForm = useForm<UpdateWikiFormData>({
		resolver: zodResolver(updateWikiSchema),
		defaultValues: {
			title: "",
			content: "",
			isEncrypted: false,
		},
	});

	// Handle create wiki
	const onCreateSubmit = async (data: CreateWikiFormData) => {
		try {
			await createWikiMutation.mutateAsync({
				projectId,
				payload: data,
			});

			setIsCreateDialogOpen(false);
			createForm.reset();
		} catch (error) {
			console.error("Failed to create wiki:", error);
		}
	};

	// Handle update wiki
	const onUpdateSubmit = async (data: UpdateWikiFormData) => {
		if (!editingWiki) return;

		try {
			await updateWikiMutation.mutateAsync({
				projectId,
				wikiId: editingWiki.wikiId,
				payload: data,
			});

			setIsEditDialogOpen(false);
			setEditingWiki(null);
			updateForm.reset();
		} catch (error) {
			console.error("Failed to update wiki:", error);
		}
	};

	// Handle delete wiki
	const handleDeleteWiki = async (wiki: ProjectWiki) => {
		try {
			await deleteWikiMutation.mutateAsync({
				projectId,
				wikiId: wiki.wikiId,
			});

			// Close viewer if deleted wiki was selected
			if (selectedWiki?.wikiId === wiki.wikiId) {
				setSelectedWiki(null);
			}
		} catch (error) {
			console.error("Failed to delete wiki:", error);
		}
	};

	// Handle edit wiki
	const handleEditWiki = (wiki: ProjectWiki) => {
		setEditingWiki(wiki);
		updateForm.reset({
			title: wiki.title,
			content: wiki.content,
			isEncrypted: wiki.isEncrypted,
		});
		setIsEditDialogOpen(true);
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
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

				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							New Wiki Entry
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Create Wiki Entry</DialogTitle>
						</DialogHeader>
						<Form {...createForm}>
							<form
								onSubmit={createForm.handleSubmit(onCreateSubmit)}
								className="space-y-4"
							>
								<FormField
									control={createForm.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Enter wiki title..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={createForm.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Content</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													rows={10}
													placeholder="Enter wiki content in Markdown format..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={createForm.control}
									name="isEncrypted"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Encrypt Content</FormLabel>
												<p className="text-sm text-muted-foreground">Enable encryption for sensitive information like passwords or API keys</p>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createWikiMutation.isPending}
									>
										{createWikiMutation.isPending ? "Creating..." : "Create Wiki"}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Wiki List */}
			{wikis.length === 0 ? (
				<Card>
					<CardContent className="flex items-center justify-center h-64">
						<div className="text-center space-y-2">
							<FileText className="h-8 w-8 text-muted-foreground mx-auto" />
							<p className="text-sm text-muted-foreground">No wiki entries yet</p>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(true)}
							>
								Create your first wiki entry
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Wiki List */}
					<div className="space-y-3">
						{wikis.map((wiki) => (
							<Card
								key={wiki.wikiId}
								className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedWiki?.wikiId === wiki.wikiId ? "ring-2 ring-primary" : ""}`}
								onClick={() => setSelectedWiki(wiki)}
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<CardTitle className="text-base flex items-center gap-2">
												{wiki.title}
												{wiki.isEncrypted && (
													<Badge
														variant="secondary"
														className="text-xs"
													>
														<Lock className="h-3 w-3 mr-1" />
														Encrypted
													</Badge>
												)}
											</CardTitle>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Calendar className="h-3 w-3" />
												<span>Updated {formatDate(wiki.updatedAt)}</span>
											</div>
										</div>

										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													handleEditWiki(wiki);
												}}
											>
												<Edit className="h-4 w-4" />
											</Button>

											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => e.stopPropagation()}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete Wiki Entry</AlertDialogTitle>
														<AlertDialogDescription>Are you sure you want to delete "{wiki.title}"? This action cannot be undone.</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeleteWiki(wiki)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								</CardHeader>

								<CardContent className="pt-0">
									<p className="text-sm text-muted-foreground line-clamp-2">{wiki.content.substring(0, 100)}...</p>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Wiki Viewer */}
					<div className="lg:sticky lg:top-4">
						{selectedWiki ? (
							<WikiViewer
								wiki={selectedWiki}
								onEdit={handleEditWiki}
								onDelete={handleDeleteWiki}
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
			<Dialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Wiki Entry</DialogTitle>
					</DialogHeader>
					<Form {...updateForm}>
						<form
							onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
							className="space-y-4"
						>
							<FormField
								control={updateForm.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter wiki title..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={updateForm.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={10}
												placeholder="Enter wiki content in Markdown format..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={updateForm.control}
								name="isEncrypted"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Encrypt Content</FormLabel>
											<p className="text-sm text-muted-foreground">Enable encryption for sensitive information like passwords or API keys</p>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsEditDialogOpen(false);
										setEditingWiki(null);
									}}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={updateWikiMutation.isPending}
								>
									{updateWikiMutation.isPending ? "Updating..." : "Update Wiki"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};
