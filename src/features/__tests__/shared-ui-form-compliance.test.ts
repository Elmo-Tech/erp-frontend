import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const formFiles = [
	"src/features/auth/ui/LoginForm.tsx",
	"src/features/contracts/ui/SignContractDialog.tsx",
	"src/features/profile/ui/ChangePasswordForm.tsx",
	"src/features/profile/ui/UpdateProfileForm.tsx",
	"src/features/roles/ui/CreateRoleForm.tsx",
	"src/features/sop/ui/SOPBuilderForm.tsx",
	"src/features/sop/ui/SOPCheckinFlow.tsx",
	"src/features/users/ui/CreateUserForm.tsx",
	"src/features/users/ui/UpdateUserForm.tsx",
];

describe("feature form shared UI compliance", () => {
	it.each(formFiles)("%s uses shared form wrappers instead of raw controls", (file) => {
		const source = readFileSync(resolve(process.cwd(), file), "utf8");

		expect(source).not.toMatch(/<label\b/);
		expect(source).not.toMatch(/<input\b/);
		expect(source).not.toMatch(/<button\b/);
		expect(source).not.toContain("@/shared/ui/label");
		expect(source).not.toContain("@/shared/ui/input");
		expect(source).not.toContain("@/shared/ui/textarea");
		expect(source).not.toContain("@/shared/ui/checkbox");
		expect(source).not.toMatch(/\.register\(/);
		expect(source).toContain("@/shared/ui/form");
	});

	it("keeps manual FormField composition out of the features layer", () => {
		const featureFiles = findTsxFiles(resolve(process.cwd(), "src/features"));
		const offenders = featureFiles.filter((file) => {
			const source = readFileSync(file, "utf8");
			return /import\s*\{[^}]*\b(FormField|FormItem|FormLabel|FormControl|FormMessage|FormDescription)\b[^}]*\}\s*from\s*["']@\/shared\/ui\/form["']/.test(source) || /<FormField\b/.test(source);
		});

		expect(offenders.map((file) => file.replace(`${process.cwd()}/`, ""))).toEqual([]);
	});
});

function findTsxFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(directory, entry.name);

		if (entry.isDirectory()) {
			return findTsxFiles(path);
		}

		return entry.isFile() && entry.name.endsWith(".tsx") ? [path] : [];
	});
}
