import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Can } from "../Can";

describe("Can", () => {
	it("updates rendered actions when the active session permissions refresh", () => {
		useAuthStore.setState({ permissions: [] });
		render(
			<Can permission="create_tasks">
				<button type="button">Create task</button>
			</Can>,
		);
		expect(screen.queryByRole("button", { name: "Create task" })).not.toBeInTheDocument();

		act(() => {
			useAuthStore.setState({ permissions: [{ permissionName: "create_tasks", access: true }] });
		});

		expect(screen.getByRole("button", { name: "Create task" })).toBeInTheDocument();
	});
});
