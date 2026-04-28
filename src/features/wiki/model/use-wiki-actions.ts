"use client";

import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/entities/wiki/api/wiki.api";

export function useProjectWikis(projectId?: number) {
	return useQuery({
		queryKey: ["wiki", "project", projectId],
		queryFn: () => wikiApi.getProjectWikis(projectId as number),
		enabled: Boolean(projectId),
	});
}
