/**
 * Status Icons Component
 * Icons for each task status
 */

import { Circle, Timer, AlertCircle, CheckCircle2 } from "lucide-react";
import { TaskStatus } from "../../types/task";

export const StatusIcons: Record<TaskStatus, React.ReactNode> = {
	[TaskStatus.TODO]: <Circle className="h-4 w-4 text-slate-400" />,
	[TaskStatus.IN_PROGRESS]: <Timer className="h-4 w-4 text-blue-500" />,
	[TaskStatus.REVIEW]: <AlertCircle className="h-4 w-4 text-amber-500" />,
	[TaskStatus.TESTING]: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
	[TaskStatus.COMPLETED]: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};
