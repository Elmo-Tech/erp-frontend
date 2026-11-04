import { CompanyTasksList } from "@/features/dashboard/components/CompanyTasksList";

export default function TasksPage() {
	return <div className="space-y-5">
		<div><h1 className="text-2xl font-semibold">Tasks</h1><p className="text-muted-foreground">Browse tasks across the projects you can access. Select a task to see its details.</p></div>
		<CompanyTasksList variant="page" />
	</div>;
}
