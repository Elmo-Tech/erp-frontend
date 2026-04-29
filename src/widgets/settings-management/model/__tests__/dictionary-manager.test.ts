import { describe, expect, it } from "vitest";
import { buildDictionaryPayload, normalizeDictionaryItems, type DictionaryColumn } from "../dictionary-manager";

describe("dictionary manager model helpers", () => {
	it("normalizes common API list response shapes", () => {
		expect(normalizeDictionaryItems([{ id: 1, name: "Referral" }])).toEqual([{ id: 1, name: "Referral" }]);
		expect(normalizeDictionaryItems({ data: [{ id: 2, name: "Website" }] })).toEqual([{ id: 2, name: "Website" }]);
		expect(normalizeDictionaryItems({ data: { items: [{ id: 3, name: "Conference" }] } })).toEqual([{ id: 3, name: "Conference" }]);
	});

	it("builds payloads from configured columns without leaking the item id", () => {
		const columns: DictionaryColumn[] = [
			{ key: "name", label: "Name", required: true },
			{ key: "code", label: "Code" },
		];

		expect(buildDictionaryPayload({ id: 12, name: "USD", code: "usd" }, columns)).toEqual({
			name: "USD",
			code: "usd",
		});
	});
});
