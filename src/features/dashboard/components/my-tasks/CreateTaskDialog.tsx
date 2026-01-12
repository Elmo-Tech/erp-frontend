/**
 * Create Task Dialog Component
 * Form for creating new tasks
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateTask } from "../../hooks/useTasks";
import { TaskStatus, TaskType, TaskPriority, TaskPriorityLabels } from "../../types/task";
import { PriorityColors } from "./constants";

interface CreateTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projects: Array<{ projectId: number; title: string }>;
	currentUserId?: number;
}

export function CreateTaskDialog({ open, onOpenChange, projects, currentUserId }: CreateTaskDialogProps) {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		projectId: "",
		priority: TaskPriority.MEDIUM,
		dueDate: "",
		estimatedHours: "",
	});

	const createTask = useCreateTask();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Title is required");
			return;
		}

		try {
			await createTask.mutateAsync({
				title: formData.title,
				description: formData.description || undefined,
				projectId: formData.projectId ? Number(formData.projectId) : undefined,
				priority: formData.priority,
				dueDate: formData.dueDate || undefined,
				estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
				assignedTo: currentUserId,
				status: TaskStatus.TODO,
				type: TaskType.MAIN,
			});

			toast.success("Task created successfully");
			onOpenChange(false);
			resetForm();
		} catch {
			toast.error("Failed to create task");
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			projectId: "",
			priority: TaskPriority.MEDIUM,
			dueDate: "",
			estimatedHours: "",
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create New Task</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="title">Title *</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							placeholder="What needs to be done?"
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Add more details..."
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="project">Project (Optional)</Label>
						<Select
							value={formData.projectId}
							onValueChange={(v) => setFormData({ ...formData, projectId: v })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Personal task (no project)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="my">Personal task</SelectItem>
								{projects.map((project) => (
									<SelectItem
										key={project.projectId}
										value={project.projectId.toString()}
									>
										{project.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">Leave empty for a personal task.</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="priority">Priority</Label>
							<Select
								value={formData.priority}
								onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(TaskPriority).map((priority) => (
										<SelectItem
											key={priority}
											value={priority}
										>
											<div className="flex items-center gap-2">
												<div className={cn("h-2 w-2 rounded-full", PriorityColors[priority])} />
												{TaskPriorityLabels[priority]}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dueDate">Due Date</Label>
							<Input
								id="dueDate"
								type="date"
								value={formData.dueDate}
								onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="estimatedHours">Estimated Hours</Label>
						<Input
							id="estimatedHours"
							type="number"
							min="0"
							step="0.5"
							value={formData.estimatedHours}
							onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
							placeholder="0"
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createTask.isPending}
						>
							{createTask.isPending ? "Creating..." : "Create Task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
