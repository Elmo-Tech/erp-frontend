import { z } from "zod";

const DEFAULT_CATEGORY_CLASS = "bg-gray-100 text-gray-700 border-gray-200";

export const projectFileCategoryOptions = [
	{ value: "general", label: "General" },
	{ value: "design", label: "Design" },
	{ value: "document", label: "Document" },
	{ value: "deliverable", label: "Deliverable" },
];

const projectFileCategoryClasses: Record<string, string> = {
	general: DEFAULT_CATEGORY_CLASS,
	design: "bg-pink-50 text-pink-700 border-pink-200",
	document: "bg-blue-50 text-blue-700 border-blue-200",
	deliverable: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const projectFileUploadSchema = z.object({
	name: z.string().trim().min(1, "File name is required").max(255),
	category: z.string().min(1, "Category is required"),
	description: z.string().optional(),
});

export type ProjectFileUploadFormData = z.infer<typeof projectFileUploadSchema>;

export const projectFileUploadDefaults: ProjectFileUploadFormData = {
	name: "",
	category: "general",
	description: "",
};

export function formatProjectFileSize(bytes: number | null | undefined): string {
	if (!bytes) return "—";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getProjectFileCategoryClass(category: string): string {
	return projectFileCategoryClasses[category] ?? DEFAULT_CATEGORY_CLASS;
}

export function buildProjectFileUploadDefaults(file: File): ProjectFileUploadFormData {
	return {
		name: file.name.replace(/\.[^/.]+$/, ""),
		category: "general",
		description: "",
	};
}

export function buildProjectFileUploadFormData(file: File, data: ProjectFileUploadFormData): FormData {
	const formData = new FormData();
	const trimmedDescription = data.description?.trim();

	formData.append("file", file);
	formData.append("name", data.name);
	formData.append("type", "file");
	formData.append("category", data.category);

	if (trimmedDescription) {
		formData.append("description", trimmedDescription);
	}

	return formData;
}
