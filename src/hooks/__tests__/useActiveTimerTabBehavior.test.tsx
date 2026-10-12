import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useActiveTimerTabBehavior } from "../useActiveTimerTabBehavior";
import type { TimeEntryData } from "@/store/timerStore";

const activeTimer: TimeEntryData = {
	timeEntryId: 7,
	startTime: "2026-03-16T10:00:00.000Z",
	trackableType: "App\\Models\\Task",
	trackableId: 42,
	trackableDisplayName: "Landing page redesign",
	isActive: true,
};

function TimerTabBehavior({ timer, elapsedSeconds }: { timer: TimeEntryData | null; elapsedSeconds: number }) {
	useActiveTimerTabBehavior(timer, elapsedSeconds);
	return null;
}

describe("useActiveTimerTabBehavior", () => {
	beforeEach(() => {
		document.title = "The Tables ERP";
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("shows the active task and elapsed time in the title, then restores the app title", () => {
		const { rerender } = render(
			<TimerTabBehavior
				timer={activeTimer}
				elapsedSeconds={65}
			/>
		);

		expect(document.title).toBe("🔴 1:05 · Landing page redesign | The Tables ERP");

		rerender(
			<TimerTabBehavior
				timer={activeTimer}
				elapsedSeconds={66}
			/>
		);
		expect(document.title).toBe("🔴 1:06 · Landing page redesign | The Tables ERP");

		rerender(
			<TimerTabBehavior
				timer={null}
				elapsedSeconds={0}
			/>
		);
		expect(document.title).toBe("The Tables ERP");
	});

	it("removes the unload confirmation listener when the timer stops", () => {
		const addEventListener = vi.spyOn(window, "addEventListener");
		const removeEventListener = vi.spyOn(window, "removeEventListener");
		const { rerender } = render(
			<TimerTabBehavior
				timer={activeTimer}
				elapsedSeconds={0}
			/>
		);

		rerender(
			<TimerTabBehavior
				timer={activeTimer}
				elapsedSeconds={1}
			/>
		);
		expect(addEventListener.mock.calls.filter(([eventName]) => eventName === "beforeunload")).toHaveLength(1);

		const listener = addEventListener.mock.calls.find(([eventName]) => eventName === "beforeunload")?.[1] as EventListener;
		const event = { preventDefault: vi.fn(), returnValue: false } as unknown as BeforeUnloadEvent;
		listener(event);

		expect(event.preventDefault).toHaveBeenCalledOnce();
		expect(event.returnValue).toBe("");

		rerender(
			<TimerTabBehavior
				timer={null}
				elapsedSeconds={0}
			/>
		);
		expect(removeEventListener).toHaveBeenCalledWith("beforeunload", listener);
	});

	it("badges every browser icon and restores its original format and size on stop", () => {
		const icons = [document.createElement("link"), document.createElement("link")];
		icons.forEach((icon, index) => { icon.rel = index ? "shortcut icon" : "icon"; icon.href = `/favicon-${index}.png`; icon.type = "image/png"; icon.setAttribute("sizes", "32x32"); document.head.append(icon); });
		const { rerender } = render(<TimerTabBehavior timer={activeTimer} elapsedSeconds={10} />);
		icons.forEach((icon) => { expect(icon.href).toMatch(/^data:image\/svg\+xml,/); expect(icon.type).toBe("image/svg+xml"); expect(icon.getAttribute("sizes")).toBe("any"); });
		rerender(<TimerTabBehavior timer={null} elapsedSeconds={0} />);
		icons.forEach((icon, index) => { expect(icon.getAttribute("href")).toBe(`/favicon-${index}.png`); expect(icon.type).toBe("image/png"); expect(icon.getAttribute("sizes")).toBe("32x32"); icon.remove(); });
	});

	it("removes the unload confirmation listener on unmount", () => {
		const addEventListener = vi.spyOn(window, "addEventListener");
		const removeEventListener = vi.spyOn(window, "removeEventListener");
		const { unmount } = render(
			<TimerTabBehavior
				timer={activeTimer}
				elapsedSeconds={0}
			/>
		);

		const listener = addEventListener.mock.calls.find(([eventName]) => eventName === "beforeunload")?.[1] as EventListener;
		unmount();

		expect(removeEventListener).toHaveBeenCalledWith("beforeunload", listener);
		expect(document.title).toBe("The Tables ERP");
	});
});
