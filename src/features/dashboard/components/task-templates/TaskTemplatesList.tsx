"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskTemplates, useDeleteTaskTemplate } from "../../hooks";
import { TaskTemplateCard } from "./TaskTemplateCard";
import { TaskTemplateFormDialog } from "./TaskTemplateFormDialog";
import { InstantiateTemplateDialog } from "./InstantiateTemplateDialog";
import { TaskTemplate, TEMPLATE_CATEGORIES } from "../../types/taskTemplate";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskTemplatesList() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("all");
	const [isActive, setIsActive] = useState<string>("all");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isInstantiateOpen, setIsInstantiateOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

	// Build filters
	const filters = {
		search: search || undefined,
		category: category !== "all" ? category : undefined,
		isActive: isActive === "active" ? true : isActive === "inactive" ? false : undefined,
	};

	const { data, isLoading } = useTaskTemplates(filters);
	const deleteMutation = useDeleteTaskTemplate();

	const handleEdit = (template: TaskTemplate) => {
		setSelectedTemplate(template);
		setIsFormOpen(true);
	};

	const handleDelete = async (template: TaskTemplate) => {
		if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
			await deleteMutation.mutateAsync(template.id);
		}
	};

	const handleInstantiate = (template: TaskTemplate) => {
		setSelectedTemplate(template);
		setIsInstantiateOpen(true);
	};

	const handleFormClose = () => {
		setIsFormOpen(false);
		setSelectedTemplate(null);
	};

	const handleInstantiateClose = () => {
		setIsInstantiateOpen(false);
		setSelectedTemplate(null);
	};

	const templates = data?.items || [];
	const pagination = data?.pagination;

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Task Templates</CardTitle>
							<CardDescription>Reusable task structures with default values and subtasks</CardDescription>
						</div>
						<Button onClick={() => setIsFormOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							New Template
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search templates..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select
							value={category}
							onValueChange={setCategory}
						>
							<SelectTrigger className="w-full sm:w-[180px]">
								<Filter className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{TEMPLATE_CATEGORIES.map((cat) => (
									<SelectItem
										key={cat}
										value={cat}
									>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={isActive}
							onValueChange={setIsActive}
						>
							<SelectTrigger className="w-full sm:w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Stats */}
					{pagination && (
						<div className="text-sm text-muted-foreground">
							Showing {templates.length} of {pagination.total} templates
						</div>
					)}
				</CardContent>
			</Card>

			{/* Templates Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-full" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : templates.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="text-muted-foreground mb-4">No templates found. Create your first template to get started.</p>
						<Button onClick={() => setIsFormOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Template
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{templates.map((template) => (
						<TaskTemplateCard
							key={template.id}
							template={template}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onInstantiate={handleInstantiate}
						/>
					))}
				</div>
			)}

			{/* Dialogs */}
			<TaskTemplateFormDialog
				open={isFormOpen}
				onOpenChange={handleFormClose}
				template={selectedTemplate}
			/>
			<InstantiateTemplateDialog
				open={isInstantiateOpen}
				onOpenChange={handleInstantiateClose}
				template={selectedTemplate}
			/>
		</div>
	);
}
