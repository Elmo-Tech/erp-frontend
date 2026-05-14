import { describe, expect, it } from "vitest";
import { SYSTEM_PERMISSIONS } from "@/shared/config/permissions";

describe("SYSTEM_PERMISSIONS dashboard split", () => {
	it("includes separate workspace and company analytics permissions", () => {
		expect(SYSTEM_PERMISSIONS).toContain("view_my_workspace");
		expect(SYSTEM_PERMISSIONS).toContain("view_global_stats");
	});
});
