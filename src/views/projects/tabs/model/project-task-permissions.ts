interface TaskMetadataPermissionInput {
	canManageAllProjects: boolean;
	canManageTasks: boolean;
	canEditTasks: boolean;
	canDeleteTasks: boolean;
	isProjectManagerLevel: boolean;
}

export function getTaskMetadataPermissions({
	canManageAllProjects,
	canManageTasks,
	canEditTasks,
	canDeleteTasks,
	isProjectManagerLevel,
}: TaskMetadataPermissionInput) {
	const canManageTaskMetadata = canManageAllProjects || canManageTasks;

	return {
		canEditTaskMetadata: canManageTaskMetadata || (canEditTasks && isProjectManagerLevel),
		canDeleteTask: canManageTaskMetadata || canDeleteTasks,
	};
}
