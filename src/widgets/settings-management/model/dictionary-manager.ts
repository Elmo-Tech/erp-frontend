import type { ReactNode } from "react";

export type DictionaryItemId = string | number;

export interface DictionaryItem {
	id: DictionaryItemId;
	name?: string;
	[key: string]: unknown;
}

export interface DictionaryColumn {
	key: string;
	label: string;
	type?: "text" | "number";
	required?: boolean;
	placeholder?: string;
	render?: (item: DictionaryItem) => ReactNode;
}

type DictionaryListResponse =
	| DictionaryItem[]
	| {
			data?: unknown;
			items?: unknown;
	  }
	| unknown;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDictionaryItem(value: unknown): value is DictionaryItem {
	return isRecord(value) && (typeof value.id === "number" || typeof value.id === "string");
}

function findFirstItemArray(value: unknown): DictionaryItem[] {
	if (Array.isArray(value)) {
		return value.filter(isDictionaryItem);
	}

	if (!isRecord(value)) {
		return [];
	}

	if (Array.isArray(value.data)) {
		return value.data.filter(isDictionaryItem);
	}

	if (Array.isArray(value.items)) {
		return value.items.filter(isDictionaryItem);
	}

	if (isRecord(value.data)) {
		const nestedItems = findFirstItemArray(value.data);
		if (nestedItems.length > 0) {
			return nestedItems;
		}
	}

	for (const childValue of Object.values(value)) {
		if (Array.isArray(childValue)) {
			const items = childValue.filter(isDictionaryItem);
			if (items.length > 0) {
				return items;
			}
		}
	}

	return [];
}

export function normalizeDictionaryItems(response: DictionaryListResponse): DictionaryItem[] {
	return findFirstItemArray(response);
}

export function buildDictionaryPayload(values: DictionaryItem, columns: DictionaryColumn[]) {
	return columns.reduce<Record<string, unknown>>((payload, column) => {
		payload[column.key] = values[column.key];
		return payload;
	}, {});
}

export function normalizeDictionaryEndpoint(apiEndpoint: string) {
	const trimmedEndpoint = apiEndpoint.trim();
	const withoutBasePrefix = trimmedEndpoint.replace(/^\/api\/v\d+(?=\/)/, "");

	return withoutBasePrefix.startsWith("/") ? withoutBasePrefix : `/${withoutBasePrefix}`;
}
