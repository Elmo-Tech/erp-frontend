import { Task } from "../types/task";

const collectNestedTaskIds = (tasks: Task[], nestedTaskIds: Set<number>) => {
	for (const task of tasks) {
		for (const child of task.children || []) {
			nestedTaskIds.add(child.taskId);
			collectNestedTaskIds([child], nestedTaskIds);
		}
	}
};

const dedupeChildren = (tasks: Task[], seenTaskIds: Set<number>): Task[] => {
	return tasks.reduce<Task[]>((uniqueTasks, task) => {
		if (seenTaskIds.has(task.taskId)) return uniqueTasks;
		seenTaskIds.add(task.taskId);
		uniqueTasks.push({
			...task,
			children: task.children ? dedupeChildren(task.children, seenTaskIds) : [],
		});
		return uniqueTasks;
	}, []);
};

export const dedupeTaskTree = (tasks: Task[]): Task[] => {
	const nestedTaskIds = new Set<number>();
	collectNestedTaskIds(tasks, nestedTaskIds);
	return dedupeChildren(
		tasks.filter((task) => !nestedTaskIds.has(task.taskId)),
		new Set<number>()
	);
};
