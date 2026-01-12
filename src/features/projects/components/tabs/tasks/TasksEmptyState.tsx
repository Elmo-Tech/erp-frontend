/**
 * Tasks Empty State Component
 */

import { Button } from "@/components/ui/button";
import { ListTodo, Plus } from "lucide-react";

interface TasksEmptyStateProps {
	canCreate: boolean;
	onCreate: () => void;
	showMyTasksOnly?: boolean;
	isAdminOrSuperAdmin?: boolean;
}

export function TasksEmptyState({ canCreate, onCreate, showMyTasksOnly, isAdminOrSuperAdmin }: TasksEmptyStateProps) {
	const getEmptyMessage = () => {
		if (showMyTasksOnly && !isAdminOrSuperAdmin) {
			return {
				title: "No assigned tasks",
				description: "You don't have any tasks assigned to you in this project yet. Tasks will appear here when you're added as a team member.",
			};
		}
		return {
			title: "No tasks yet",
			description: "Start organizing your project by creating tasks. Break down work into manageable pieces.",
		};
	};

	const { title, description } = getEmptyMessage();

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
				<ListTodo className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-1">{title}</h3>
			<p className="text-muted-foreground text-sm text-center max-w-sm mb-6">{description}</p>
			{canCreate && !showMyTasksOnly && (
				<Button onClick={onCreate}>
					<Plus className="h-4 w-4 mr-2" />
					Create First Task
				</Button>
			)}
		</div>
	);
}
