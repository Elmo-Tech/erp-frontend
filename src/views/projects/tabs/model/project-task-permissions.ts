interface TaskMetadataPermissionInput {
	canManageAllProjects: boolean;
	canManageTasks: boolean;
	canEditTasks: boolean;
	canDeleteTasks: boolean;
}

export function getTaskMetadataPermissions({
	canManageAllProjects,
	canManageTasks,
	canEditTasks,
	canDeleteTasks,
}: TaskMetadataPermissionInput) {
	const canManageTaskMetadata = canManageAllProjects || canManageTasks;

	return {
		canEditTaskMetadata: canManageTaskMetadata || canEditTasks,
		canDeleteTask: canManageTaskMetadata || canDeleteTasks,
	};
}
