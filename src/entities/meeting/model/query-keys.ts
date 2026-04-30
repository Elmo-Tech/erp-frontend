export const meetingKeys = {
	all: ["meetings"] as const,
	lists: () => [...meetingKeys.all, "list"] as const,
	client: (clientId: number) => [...meetingKeys.lists(), "client", clientId] as const,
};
