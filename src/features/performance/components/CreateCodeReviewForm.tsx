"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateCodeReview } from "../hooks";

const createCodeReviewSchema = z.object({
	taskId: z.number().positive("Task is required"),
	developerId: z.number().positive("Developer is required"),
	codeQualityScore: z.number().min(1).max(10).optional(),
	readabilityScore: z.number().min(1).max(10).optional(),
	scalabilityScore: z.number().min(1).max(10).optional(),
	testingScore: z.number().min(1).max(10).optional(),
	documentationScore: z.number().min(1).max(10).optional(),
	reviewNotes: z.string().optional(),
	improvementSuggestions: z.string().optional(),
});

type CreateCodeReviewFormData = z.infer<typeof createCodeReviewSchema>;

interface CreateCodeReviewFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	defaultTaskId?: number;
	defaultDeveloperId?: number;
}

export function CreateCodeReviewForm({ onSuccess, onCancel, defaultTaskId, defaultDeveloperId }: CreateCodeReviewFormProps) {
	const createCodeReview = useCreateCodeReview();

	const form = useForm<CreateCodeReviewFormData>({
		resolver: zodResolver(createCodeReviewSchema),
		defaultValues: {
			taskId: defaultTaskId || 0,
			developerId: defaultDeveloperId || 0,
			codeQualityScore: 8,
			readabilityScore: 8,
			scalabilityScore: 8,
			testingScore: 8,
			documentationScore: 8,
			reviewNotes: "",
			improvementSuggestions: "",
		},
	});

	const onSubmit = async (data: CreateCodeReviewFormData) => {
		try {
			await createCodeReview.mutateAsync(data);
			onSuccess?.();
		} catch {
			// Error is handled by the mutation
		}
	};

	const watchedValues = form.watch();
	const calculateAverage = () => {
		const scores = [watchedValues.codeQualityScore, watchedValues.readabilityScore, watchedValues.scalabilityScore, watchedValues.testingScore, watchedValues.documentationScore].filter(Boolean) as number[];

		if (scores.length === 0) return 0;
		return scores.reduce((sum, score) => sum + score, 0) / scores.length;
	};

	const averageScore = calculateAverage();

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Create Code Review</CardTitle>
					{averageScore > 0 && <Badge variant={averageScore >= 7 ? "default" : "secondary"}>Avg: {averageScore.toFixed(1)}/10</Badge>}
				</div>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Basic Info */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="taskId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Task ID</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Enter task ID"
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="developerId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Developer ID</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Enter developer ID"
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Scores */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Review Scores (1-10)</h3>

							<FormField
								control={form.control}
								name="codeQualityScore"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Code Quality</FormLabel>
											<Badge variant="outline">{field.value || 0}/10</Badge>
										</div>
										<FormControl>
											<Slider
												value={[field.value || 0]}
												onValueChange={(value) => field.onChange(value[0])}
												max={10}
												min={1}
												step={1}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="readabilityScore"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Readability</FormLabel>
											<Badge variant="outline">{field.value || 0}/10</Badge>
										</div>
										<FormControl>
											<Slider
												value={[field.value || 0]}
												onValueChange={(value) => field.onChange(value[0])}
												max={10}
												min={1}
												step={1}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="scalabilityScore"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Scalability</FormLabel>
											<Badge variant="outline">{field.value || 0}/10</Badge>
										</div>
										<FormControl>
											<Slider
												value={[field.value || 0]}
												onValueChange={(value) => field.onChange(value[0])}
												max={10}
												min={1}
												step={1}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="testingScore"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Testing</FormLabel>
											<Badge variant="outline">{field.value || 0}/10</Badge>
										</div>
										<FormControl>
											<Slider
												value={[field.value || 0]}
												onValueChange={(value) => field.onChange(value[0])}
												max={10}
												min={1}
												step={1}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="documentationScore"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Documentation</FormLabel>
											<Badge variant="outline">{field.value || 0}/10</Badge>
										</div>
										<FormControl>
											<Slider
												value={[field.value || 0]}
												onValueChange={(value) => field.onChange(value[0])}
												max={10}
												min={1}
												step={1}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Notes */}
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="reviewNotes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Review Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="General feedback about the code..."
												className="min-h-[80px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="improvementSuggestions"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Improvement Suggestions</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Specific suggestions for improvement..."
												className="min-h-[80px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-2 pt-4 border-t">
							<Button
								type="submit"
								disabled={createCodeReview.isPending}
								className="flex-1"
							>
								{createCodeReview.isPending ? "Creating..." : "Create Review"}
							</Button>
							{onCancel && (
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
									disabled={createCodeReview.isPending}
								>
									Cancel
								</Button>
							)}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
