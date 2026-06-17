import type { ProjectFile } from "@/entities/project/model/types";

export type RawProjectFileResource = ProjectFile & {
	isClientVisible?: boolean;
	isDownloadable?: boolean;
	visibleToRoles?: string[];
	createdBy?: number | null;
	updatedAt?: string;
};

export interface ProjectFileListData {
	files: RawProjectFileResource[];
}

export function mapProjectFileResource(resource: RawProjectFileResource): ProjectFile {
	return {
		fileId: resource.fileId,
		projectId: resource.projectId,
		name: resource.name,
		type: resource.type,
		fileUrl: resource.fileUrl,
		mimeType: resource.mimeType,
		size: resource.size,
		description: resource.description,
		category: resource.category,
		createdAt: resource.createdAt,
	};
}

export function mapProjectFileListData(fileListData: ProjectFileListData): ProjectFile[] {
	return fileListData.files.map(mapProjectFileResource);
}
