import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TaskTimeEntriesSection } from "./TaskTimeEntriesSection";
import type { Task } from "@/features/dashboard/types/task";
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({ canEditTimeEntries: false }) }));
vi.mock("@/features/sales/hooks/useTimeEntries", () => ({
 useUpdateTimeEntry: () => ({}),
 useTimeEntriesByTrackable: () => ({ data: { timeEntries: [
  { timeEntryId: 1, startTime: "2026-10-27T15:17:00", endTime: "2026-10-27T15:17:20", durationMinutes: 0 },
  { timeEntryId: 2, startTime: "2026-10-27T15:18:00", endTime: "2026-10-27T15:18:10" },
  { timeEntryId: 3, startTime: "2026-10-27T15:19:00", endTime: null, durationMinutes: 0 },
 ] }, isLoading: false }),
}));
it("distinguishes stopped sub-minute sessions from an actual active timer", () => {
 render(<TaskTimeEntriesSection task={{ taskId: 12 } as Task} />);
 expect(screen.getAllByText("0m")).toHaveLength(2);
 expect(screen.getAllByText("In progress")).toHaveLength(1);
 expect(screen.getAllByText("Active")).toHaveLength(1);
});
