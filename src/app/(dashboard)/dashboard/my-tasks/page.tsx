import { MyAssignedTasks } from "@/features/dashboard/components/MyAssignedTasks";

export default function MyTasksPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">My Assigned Tasks</h1>
				<p className="text-muted-foreground">View and manage tasks where you are assigned as a team member</p>
			</div>

			<MyAssignedTasks />
		</div>
	);
}
