export const sopKeys = {
	all: ["sop"] as const,
	today: () => [...sopKeys.all, "today"] as const,
	directives: () => [...sopKeys.all, "directives"] as const,
};
