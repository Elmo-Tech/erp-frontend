import api from "@/shared/api/base";
import type { ProjectWiki, ProjectWikiListResponse } from "../model/types";

interface ApiEnvelope<T> {
	data: T;
}

export const wikiApi = {
	async getProjectWikis(projectId: number): Promise<ProjectWikiListResponse> {
		const response = await api.get<ApiEnvelope<ProjectWikiListResponse>>(`/projects/${projectId}/wikis`);

		return response.data.data;
	},

	async getProjectWiki(projectId: number, wikiId: number): Promise<ProjectWiki> {
		const response = await api.get<ApiEnvelope<ProjectWiki>>(`/projects/${projectId}/wikis/${wikiId}`);

		return response.data.data;
	},
};
