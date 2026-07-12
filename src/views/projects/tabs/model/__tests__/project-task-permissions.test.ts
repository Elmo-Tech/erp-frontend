import { describe, expect, it } from "vitest";
import { getTaskMetadataPermissions } from "../project-task-permissions";

describe("project task metadata permissions", () => {
	it("allows global and task managers to edit and delete task metadata", () => {
		expect(
			getTaskMetadataPermissions({
				canManageAllProjects: true,
				canManageTasks: false,
				canEditTasks: false,
				canDeleteTasks: false,
			}),
		).toEqual({ canEditTaskMetadata: true, canDeleteTask: true });

		expect(
			getTaskMetadataPermissions({
				canManageAllProjects: false,
				canManageTasks: true,
				canEditTasks: false,
				canDeleteTasks: false,
			}),
		).toEqual({ canEditTaskMetadata: true, canDeleteTask: true });
	});

	it("allows metadata editing through the dedicated edit permission", () => {
		expect(
			getTaskMetadataPermissions({
				canManageAllProjects: false,
				canManageTasks: false,
				canEditTasks: true,
				canDeleteTasks: false,
			}),
		).toEqual({ canEditTaskMetadata: true, canDeleteTask: false });
	});

	it("allows delete only through delete/manage permissions", () => {
		expect(
			getTaskMetadataPermissions({
				canManageAllProjects: false,
				canManageTasks: false,
				canEditTasks: false,
				canDeleteTasks: true,
			}),
		).toEqual({ canEditTaskMetadata: false, canDeleteTask: true });
	});
});
