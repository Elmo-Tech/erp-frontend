"use client";

import { format } from "date-fns";
import { PersonalTasksWidget } from "@/features/personal-tasks/ui/PersonalTasksWidget";
import { MyActiveProjectTasksCard } from "@/views/dashboard/MyActiveProjectTasksCard";

export default function MyTasksPage() {
	return (
		<section className="space-y-5">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
				<p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd MMM yyyy")}</p>
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
				<MyActiveProjectTasksCard className="lg:col-span-1" />
				<PersonalTasksWidget className="lg:col-span-1" />
			</div>
		</section>
	);
}
