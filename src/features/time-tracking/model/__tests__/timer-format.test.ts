import { describe, expect, it } from "vitest";
import { formatElapsedTime } from "../timer-format";

describe("timer format helpers", () => {
	it("formats elapsed seconds as HH:MM:SS", () => {
		expect(formatElapsedTime(0)).toBe("00:00:00");
		expect(formatElapsedTime(65)).toBe("00:01:05");
		expect(formatElapsedTime(5025)).toBe("01:23:45");
	});
});
