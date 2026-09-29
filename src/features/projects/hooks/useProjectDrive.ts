import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectDriveApi } from "../api/projectDrive";
import { ProjectDriveFolder } from "../types/project";
import { projectKeys } from "./useProjects";

export const projectDriveKeys = {
	all: ["project-drive"] as const,
	status: () => [...projectDriveKeys.all, "status"] as const,
	files: (projectId: number) => [...projectDriveKeys.all, projectId, "files"] as const,
	folders: (projectId: number, search?: string) => [...projectDriveKeys.all, projectId, "folders", search || ""] as const,
};

export const useGoogleDriveStatus = () => {
	return useQuery({
		queryKey: projectDriveKeys.status(),
		queryFn: projectDriveApi.getStatus,
	});
};

export const useProjectDriveFiles = (projectId: number, enabled: boolean) => {
	return useQuery({
		queryKey: projectDriveKeys.files(projectId),
		queryFn: () => projectDriveApi.listFiles(projectId),
		enabled: enabled && !!projectId,
		staleTime: 60 * 1000,
	});
};

export const useProjectDriveFolders = (projectId: number, search: string, enabled: boolean) => {
	return useQuery({
		queryKey: projectDriveKeys.folders(projectId, search),
		queryFn: () => projectDriveApi.searchFolders(projectId, search),
		enabled: enabled && !!projectId,
		staleTime: 30 * 1000,
	});
};

export const useConnectProjectDriveFolder = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (folder: ProjectDriveFolder) => projectDriveApi.connectFolder(projectId, folder),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
			queryClient.invalidateQueries({ queryKey: projectDriveKeys.files(projectId) });
		},
	});
};

export const useUploadProjectDriveFile = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => projectDriveApi.uploadFile(projectId, file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectDriveKeys.files(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
};
