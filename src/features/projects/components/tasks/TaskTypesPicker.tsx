"use client";

import { useLookupOptions } from "@/features/settings/hooks/useLookupOptions";

export function TaskTypesPicker({ selected, onChange, disabled = false }: { selected: number[]; onChange: (ids: number[]) => void; disabled?: boolean }) {
	const options = useLookupOptions("project_type");
	const types = (options.data?.data ?? []).filter((type) => type.is_active || selected.includes(type.id));
	return <fieldset className="space-y-2" disabled={disabled}>
		<legend className="text-sm font-medium">Task types</legend>
		<p className="text-xs text-muted-foreground">Choose up to two types.</p>
		{options.isLoading ? <p className="text-sm text-muted-foreground">Loading types…</p> : options.isError ? <p role="alert" className="text-sm text-destructive">Could not load types. <button type="button" className="underline" onClick={() => void options.refetch()}>Try again</button></p> : types.length === 0 ? <p className="text-sm text-muted-foreground">No types available. Add types in settings.</p> : <div className="flex flex-wrap gap-3">{types.map((type) => {
			const checked = selected.includes(type.id);
			return <label key={type.id} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input type="checkbox" checked={checked} disabled={!checked && selected.length >= 2} onChange={() => onChange(checked ? selected.filter((id) => id !== type.id) : [...selected, type.id])} />{type.label}{!type.is_active && " (inactive)"}</label>;
		})}</div>}
	</fieldset>;
}
