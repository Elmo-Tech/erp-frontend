"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Subscribes to a CSS media query. `serverValue` is used during SSR and hydration. */
export function useMediaQuery(query: string, serverValue = true) {
	const subscribe = useCallback(
		(onChange: () => void) => {
			if (typeof window === "undefined" || !window.matchMedia) return () => {};
			const media = window.matchMedia(query);
			media.addEventListener("change", onChange);
			return () => media.removeEventListener("change", onChange);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : serverValue),
		() => serverValue,
	);
}
