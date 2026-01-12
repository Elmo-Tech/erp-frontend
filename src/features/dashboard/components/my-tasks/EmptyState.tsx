/**
 * Empty State Component
 * Shown when no tasks are found
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";

interface EmptyStateProps {
	onCreateTask: () => void;
	hasFilters: boolean;
}

export function EmptyState({ onCreateTask, hasFilters }: EmptyStateProps) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-16">
				<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
					<CheckCircle2 className="h-8 w-8 text-primary" />
				</div>
				<h3 className="text-lg font-semibold mb-1">{hasFilters ? "No matching tasks" : "No tasks yet"}</h3>
				<p className="text-muted-foreground text-sm text-center max-w-sm mb-6">
					{hasFilters ? "Try adjusting your filters to find what you're looking for." : "Create your first task to get started. You can add personal tasks or tasks linked to your projects."}
				</p>
				{!hasFilters && (
					<Button
						onClick={onCreateTask}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Create Task
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
