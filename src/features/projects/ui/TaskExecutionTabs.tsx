"use client";

import { CheckCircle2, Timer } from "lucide-react";

import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { ProjectTask, ProjectTimeEntry } from "../api/execution.api";
import { TaskDeliverablesPanel } from "./TaskDeliverablesPanel";
import { TaskTimeLogsPanel } from "./TaskTimeLogsPanel";

interface TaskExecutionTabsAccess {
	isDone: boolean;
	canToggleDeliverables: boolean;
	canCreateDeliverables: boolean;
	canEditDeliverables: boolean;
	canDeleteDeliverables: boolean;
	canWriteTimeEntries: boolean;
	canManageTimeEntry: (entry: ProjectTimeEntry) => boolean;
}

interface TaskExecutionTabsHandlers {
	onLogTime: () => void;
	onEditTimeEntry: (entry: ProjectTimeEntry) => void;
	onDeleteTimeEntry: (entry: ProjectTimeEntry) => void;
}

interface TaskExecutionTabsProps {
	task: ProjectTask;
	projectId: number;
	totalLogged: string;
	access: TaskExecutionTabsAccess;
	handlers: TaskExecutionTabsHandlers;
}

export function TaskExecutionTabs({ task, projectId, totalLogged, access, handlers }: TaskExecutionTabsProps) {
	return (
		<Tabs
			defaultValue="execution"
			className="flex flex-1 flex-col overflow-hidden"
		>
			<TabsList className="mx-6 mt-3 mb-0 w-fit shrink-0">
				<TabsTrigger value="execution">
					<CheckCircle2 className="size-3.5" />
					Execution
				</TabsTrigger>
				<TabsTrigger value="timelogs">
					<Timer className="size-3.5" />
					Time Logs
				</TabsTrigger>
			</TabsList>

			<TabsContent
				value="execution"
				className="flex-1 overflow-hidden"
			>
				<ScrollArea className="h-full">
					<div className="flex flex-col gap-5 px-6 py-4">
						{task.description && (
							<div>
								<h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
								<p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
							</div>
						)}

						{task.description && <Separator />}

						<TaskDeliverablesPanel
							deliverables={task.deliverables ?? []}
							projectId={projectId}
							taskId={task.taskId}
							isDone={access.isDone}
							canToggleDeliverables={access.canToggleDeliverables}
							canCreateDeliverables={access.canCreateDeliverables}
							canEditDeliverables={access.canEditDeliverables}
							canDeleteDeliverables={access.canDeleteDeliverables}
						/>
					</div>
				</ScrollArea>
			</TabsContent>

			<TabsContent
				value="timelogs"
				className="flex-1 overflow-hidden"
			>
				<TaskTimeLogsPanel
					timeEntries={task.timeEntries ?? []}
					totalLogged={totalLogged}
					isDone={access.isDone}
					canWriteTimeEntries={access.canWriteTimeEntries}
					canManageTimeEntry={access.canManageTimeEntry}
					onLogTime={handlers.onLogTime}
					onEditTimeEntry={handlers.onEditTimeEntry}
					onDeleteTimeEntry={handlers.onDeleteTimeEntry}
				/>
			</TabsContent>
		</Tabs>
	);
}
