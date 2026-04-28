export interface ProjectWiki {
	wikiId: number;
	projectId: number;
	title: string;
	content: string;
	isEncrypted: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: number | null;
	updatedBy: number | null;
}

export interface ProjectWikiListResponse {
	wikis: ProjectWiki[];
}
