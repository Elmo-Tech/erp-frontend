import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectMeetingsTab } from "../ProjectMeetingsTab";
import type { MeetingModelType, PolyMeeting } from "@/entities/meetings/model/types";

const projectMeetings: PolyMeeting[] = [
	{
		id: 10,
		modelType: "project",
		modelId: 2,
		subjectName: "Operations Build",
		meetingType: "review",
		status: "scheduled",
		title: "Project Sync",
		description: "Review delivery risks.",
		scheduledAt: "2026-06-15T10:00:00.000Z",
		completionNote: null,
		assignedTo: null,
		internalAttendees: ["7", "8"],
		externalAttendees: [],
		locationType: "online",
		locationDetails: "https://meet.example.test/project-sync",
		createdAt: "2026-06-10T10:00:00.000Z",
		updatedAt: "2026-06-10T10:00:00.000Z",
	},
];

const clientMeetings: PolyMeeting[] = [
	{
		...projectMeetings[0],
		modelType: "client",
		modelId: 5,
	},
	{
		id: 11,
		modelType: "client",
		modelId: 5,
		subjectName: "Acme",
		meetingType: "kickoff",
		status: "completed",
		title: "Client Kickoff",
		description: null,
		scheduledAt: "2026-06-14T12:00:00.000Z",
		completionNote: "Client approved the kickoff agenda.",
		assignedTo: null,
		internalAttendees: ["7"],
		externalAttendees: ["client@example.test"],
		locationType: "client_site",
		locationDetails: "Client HQ",
		createdAt: "2026-06-09T10:00:00.000Z",
		updatedAt: "2026-06-14T13:00:00.000Z",
	},
];

vi.mock("@/entities/meetings/api/meetings.api", () => ({
	useGetMeetings: (modelType: MeetingModelType) => ({
		data: modelType === "project" ? projectMeetings : clientMeetings,
		isLoading: false,
		isError: false,
		error: null,
	}),
}));

vi.mock("@/features/meetings/ui/PolyMeetingForm", () => ({
	PolyMeetingForm: () => <button type="button">Schedule a Meeting</button>,
}));

describe("ProjectMeetingsTab", () => {
	it("deduplicates project and client meetings in the shared DataTable", () => {
		render(
			<ProjectMeetingsTab
				projectId={2}
				clientId={5}
			/>,
		);

		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Meeting" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Scope" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Scheduled" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Location" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Attendees" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();

		expect(screen.getByText("Project Sync")).toBeInTheDocument();
		expect(screen.getByText("Client Kickoff")).toBeInTheDocument();
		expect(screen.getAllByText("Project Sync")).toHaveLength(1);
		expect(screen.getByText("Review delivery risks.")).toBeInTheDocument();
		expect(screen.getByText("Client approved the kickoff agenda.")).toBeInTheDocument();

		const projectRow = screen.getByText("Project Sync").closest("tr");
		const clientRow = screen.getByText("Client Kickoff").closest("tr");

		expect(projectRow).not.toBeNull();
		expect(clientRow).not.toBeNull();
		expect(within(projectRow!).getByText("Project")).toBeInTheDocument();
		expect(within(clientRow!).getByText("Client")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Schedule a Meeting" })).toBeInTheDocument();
	});
});
