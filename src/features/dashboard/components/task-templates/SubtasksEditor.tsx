"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Subtask {
	title: string;
	description?: string;
	estimatedHours?: number;
	priority?: string;
}

interface SubtasksEditorProps {
	subtasks: Subtask[];
	onChange: (subtasks: Subtask[]) => void;
}

export function SubtasksEditor({ subtasks, onChange }: SubtasksEditorProps) {
	const addSubtask = () => {
		onChange([
			...subtasks,
			{
				title: "",
				description: "",
				estimatedHours: undefined,
				priority: "medium",
			},
		]);
	};

	const removeSubtask = (index: number) => {
		onChange(subtasks.filter((_, i) => i !== index));
	};

	const updateSubtask = (index: number, field: keyof Subtask, value: Subtask[keyof Subtask]) => {
		const updated = [...subtasks];
		updated[index] = { ...updated[index], [field]: value };
		onChange(updated);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Subtasks (Optional)</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addSubtask}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Subtask
				</Button>
			</div>

			{subtasks.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-sm text-muted-foreground mb-3">No subtasks defined. Add subtasks to break down the template into smaller tasks.</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addSubtask}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add First Subtask
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{subtasks.map((subtask, index) => (
						<Card
							key={index}
							className="relative"
						>
							<CardContent className="pt-6">
								<div className="absolute left-2 top-2">
									<GripVertical className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="absolute right-2 top-2">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeSubtask(index)}
										className="h-8 w-8 p-0 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>

								<div className="space-y-3 pl-4">
									{/* Title */}
									<div className="space-y-2">
										<Label htmlFor={`subtask-title-${index}`}>
											Title <span className="text-destructive">*</span>
										</Label>
										<Input
											id={`subtask-title-${index}`}
											placeholder="Subtask title"
											value={subtask.title}
											onChange={(e) => updateSubtask(index, "title", e.target.value)}
										/>
									</div>

									{/* Description */}
									<div className="space-y-2">
										<Label htmlFor={`subtask-description-${index}`}>Description</Label>
										<Input
											id={`subtask-description-${index}`}
											placeholder="Optional description"
											value={subtask.description || ""}
											onChange={(e) => updateSubtask(index, "description", e.target.value)}
										/>
									</div>

									{/* Estimated Hours & Priority */}
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<Label htmlFor={`subtask-hours-${index}`}>Estimated Hours</Label>
											<Input
												id={`subtask-hours-${index}`}
												type="number"
												min="0"
												step="0.5"
												placeholder="0"
												value={subtask.estimatedHours || ""}
												onChange={(e) => updateSubtask(index, "estimatedHours", e.target.value ? parseFloat(e.target.value) : undefined)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`subtask-priority-${index}`}>Priority</Label>
											<Select
												value={subtask.priority || "medium"}
												onValueChange={(value) => updateSubtask(index, "priority", value)}
											>
												<SelectTrigger id={`subtask-priority-${index}`}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="low">Low</SelectItem>
													<SelectItem value="medium">Medium</SelectItem>
													<SelectItem value="high">High</SelectItem>
													<SelectItem value="urgent">Urgent</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{subtasks.length > 0 && (
				<p className="text-xs text-muted-foreground">
					{subtasks.length} subtask{subtasks.length > 1 ? "s" : ""} will be created automatically when using this template
				</p>
			)}
		</div>
	);
}
