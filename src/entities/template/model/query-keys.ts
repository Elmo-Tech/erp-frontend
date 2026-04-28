import type { TemplateKind } from "./types";

export const templateKeys = {
	all: ["templates"] as const,
	lists: () => [...templateKeys.all, "list"] as const,
	list: (kind: TemplateKind, type?: string) => [...templateKeys.lists(), kind, type] as const,
};

