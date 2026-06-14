import { useQuery } from "@tanstack/react-query";
import api from "./base";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DictionaryEntry {
	id: number;
	name: string;
	/** slug is the canonical value sent to the backend */
	slug: string;
	isActive: boolean;
}

interface ApiEnvelope<T> {
	data: T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetcher
// ─────────────────────────────────────────────────────────────────────────────

async function fetchDictionary(entity: string): Promise<DictionaryEntry[]> {
	const response = await api.get<ApiEnvelope<DictionaryEntry[]>>(`/settings/${entity}`);
	// The backend wraps in { success, message, data: [...] }
	const raw = response.data.data ?? response.data;
	return Array.isArray(raw) ? raw : [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────────────

export const settingsKeys = {
	all: ["settings"] as const,
	dictionary: (entity: string) => [...settingsKeys.all, "dictionary", entity] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// useSettingsDictionary
//
// Generic hook for any settings dictionary entity.
// Returns items mapped to { value: slug, label: name } for use in
// FormCombobox / FormMultiCombobox / FormSelect.
//
// Usage:
//   const { options, isLoading } = useSettingsDictionary("lead-sources");
//   const { options, isLoading } = useSettingsDictionary("countries");
//   const { options, isLoading } = useSettingsDictionary("lead-interests");
// ─────────────────────────────────────────────────────────────────────────────

export function useSettingsDictionary(entity: string, enabled = true) {
	const query = useQuery({
		queryKey: settingsKeys.dictionary(entity),
		queryFn: () => fetchDictionary(entity),
		enabled,
		staleTime: 10 * 60 * 1000, // 10 min — dictionary data changes rarely
		gcTime: 30 * 60 * 1000,
	});

	const options = (query.data ?? [])
		.filter((item) => item.isActive && typeof item.slug === "string" && item.slug.trim().length > 0)
		.map((item) => ({
			value: item.slug.trim(),
			label: item.name,
		}));

	return {
		options,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch,
	};
}
