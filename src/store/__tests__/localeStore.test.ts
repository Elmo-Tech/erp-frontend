import { beforeEach, describe, expect, it } from "vitest";
import { useLocaleStore } from "../localeStore";

describe("localeStore", () => {
	beforeEach(() => {
		useLocaleStore.setState({ locale: "en" });
	});

	it("sets html language and direction for Arabic and English", () => {
		useLocaleStore.getState().setLocale("ar");

		expect(document.documentElement.lang).toBe("ar");
		expect(document.documentElement.dir).toBe("rtl");

		useLocaleStore.getState().setLocale("en");

		expect(document.documentElement.lang).toBe("en");
		expect(document.documentElement.dir).toBe("ltr");
	});
});
