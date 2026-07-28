import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ProjectPipelineTab drag performance", () => {
	it("does not animate pointer-driven task transforms", () => {
		const source = readFileSync(
			resolve(process.cwd(), "src/features/projects/components/pipeline/ProjectPipelineTab.tsx"),
			"utf8"
		);
		const cardSource = source.slice(
			source.indexOf("function DraggableTaskCard"),
			source.indexOf("interface PipelineCapabilities")
		);

		expect(cardSource).not.toMatch(/transition-\[[^\]]*transform/);
		expect(cardSource).toContain('willChange: isDragging ? "transform" : undefined');
	});
});
