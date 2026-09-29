import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmployeeAvatarField } from "./EmployeeAvatarField";

describe("EmployeeAvatarField", () => {
	const onChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unsupported image types with an accessible validation message", () => {
		render(<EmployeeAvatarField selectedFile={null} onChange={onChange} />);

		fireEvent.change(screen.getByLabelText("Photo (optional)"), {
			target: { files: [new File(["avatar"], "employee.gif", { type: "image/gif" })] },
		});

		expect(screen.getByRole("alert")).toHaveTextContent("Choose a JPEG, PNG, or WebP image.");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("rejects photos larger than 5 MB", () => {
		render(<EmployeeAvatarField selectedFile={null} onChange={onChange} />);
		const oversizedPhoto = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "employee.png", { type: "image/png" });

		fireEvent.change(screen.getByLabelText("Photo (optional)"), {
			target: { files: [oversizedPhoto] },
		});

		expect(screen.getByRole("alert")).toHaveTextContent("Photo must be 5 MB or smaller.");
		expect(onChange).not.toHaveBeenCalled();
	});
});
