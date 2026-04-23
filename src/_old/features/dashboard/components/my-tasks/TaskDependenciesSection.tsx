"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTaskDependencies, useCreateTaskDependency, useDeleteTaskDependency } from "../../hooks";
import { taskDependencySchema, type TaskDependencyFormData } from "../../schemas";
import { DEPENDENCY_TYPE_LABELS, DEPENDENCY_TYPE_DESCRIPTIONS } from "../../types/taskDependency";

interface TaskDependenciesSectionProps {
	taskId: number;
	availableTasks?: Array<{ id: number; title: string; status: string }>;
}

export function TaskDependenciesSection({ taskId, availableTasks = [] }: TaskDependenciesSectionProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { data: dependencies, isLoading } = useTaskDependencies(taskId);
	const createMutation = useCreateTaskDependency(taskId);
	const deleteMutation = useDeleteTaskDependency(taskId);

	const form = useForm<TaskDependencyFormData>({
		resolver: zodResolver(taskDependencySchema),
		defaultValues: {
			lagDays: 0,
		},
	});

	const onSubmit = async (data: TaskDependencyFormData) => {
		await createMutation.mutateAsync(data);
		form.reset();
		setIsDialogOpen(false);
	};

	const handleDelete = async (dependencyId: number) => {
		if (confirm("Are you sure you want to remove this dependency?")) {
			await deleteMutation.mutateAsync(dependencyId);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Dependencies</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Loading...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Dependencies</CardTitle>
						<CardDescription>Tasks that must be completed before this task can start</CardDescription>
					</div>
					<Dialog
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
					>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Dependency
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Add Task Dependency</DialogTitle>
								<DialogDescription>Define which task must be completed before this task can start</DialogDescription>
							</DialogHeader>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="dependsOnTaskId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Depends On Task</FormLabel>
												<Select
													onValueChange={(value) => field.onChange(parseInt(value))}
													value={field.value?.toString()}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a task" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{availableTasks.map((task) => (
															<SelectItem
																key={task.id}
																value={task.id.toString()}
															>
																{task.title}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormDescription>The task that must be completed first</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="dependencyType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Dependency Type</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select dependency type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.entries(DEPENDENCY_TYPE_LABELS).map(([value, label]) => (
															<SelectItem
																key={value}
																value={value}
															>
																<div>
																	<div className="font-medium">{label}</div>
																	<div className="text-xs text-muted-foreground">{DEPENDENCY_TYPE_DESCRIPTIONS[value as keyof typeof DEPENDENCY_TYPE_DESCRIPTIONS]}</div>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="lagDays"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Lag Days (Optional)</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="0"
														{...field}
														onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
													/>
												</FormControl>
												<FormDescription>Number of days to wait after the dependency is satisfied</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<DialogFooter>
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={createMutation.isPending}
										>
											{createMutation.isPending ? "Adding..." : "Add Dependency"}
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{!dependencies || dependencies.length === 0 ? (
					<p className="text-sm text-muted-foreground">No dependencies defined. This task can start immediately.</p>
				) : (
					<div className="space-y-3">
						{dependencies.map((dep) => (
							<div
								key={dep.id}
								className="flex items-start justify-between p-3 border rounded-lg"
							>
								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<span className="font-medium">{dep.dependsOnTask?.title}</span>
										{dep.isSatisfied ? (
											<Badge
												variant="outline"
												className="bg-green-50 text-green-700 border-green-200"
											>
												<CheckCircle2 className="h-3 w-3 mr-1" />
												Satisfied
											</Badge>
										) : (
											<Badge
												variant="outline"
												className="bg-yellow-50 text-yellow-700 border-yellow-200"
											>
												<Clock className="h-3 w-3 mr-1" />
												Waiting
											</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										{DEPENDENCY_TYPE_LABELS[dep.dependencyType as keyof typeof DEPENDENCY_TYPE_LABELS]}
										{dep.lagDays > 0 && ` + ${dep.lagDays} days lag`}
									</p>
									{dep.availableStartDate && !dep.isSatisfied && (
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<AlertCircle className="h-3 w-3" />
											Available from: {new Date(dep.availableStartDate).toLocaleDateString()}
										</p>
									)}
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDelete(dep.id)}
									disabled={deleteMutation.isPending}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
