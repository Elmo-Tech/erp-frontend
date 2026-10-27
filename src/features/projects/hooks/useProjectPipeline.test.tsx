import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import { useCreatePipelineTask, useUpdatePipelineTask } from "./useProjectPipeline";
import { projectKeys } from "./useProjects";

vi.mock("../api/projectPipeline", () => ({ projectPipelineApi: { createTask: vi.fn(), updateTask: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
it.each(["create", "update"])("refreshes project overview membership after task %s without reloading", async (operation) => {
 const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
 client.setQueryData(projectKeys.detail(14), { members: [] });
 const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
 const view = renderHook(() => ({
  project: useQuery({ queryKey: projectKeys.detail(14), queryFn: async () => ({ members: ["QA employee"] }) }),
  create: useCreatePipelineTask(14), update: useUpdatePipelineTask(14),
 }), { wrapper });
 expect(view.result.current.project.data?.members).toEqual([]);
 await act(async () => {
  if (operation === "create") await view.result.current.create.mutateAsync({ title: "Assigned task", workflowStageId: 1, assignedUserIds: [13] });
  else await view.result.current.update.mutateAsync({ taskId: 12, payload: { assignedUserIds: [13] } });
 });
 await waitFor(() => expect(view.result.current.project.data?.members).toEqual(["QA employee"]));
});
