"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChecklistItem } from "@/features/dashboard/types/task";

export function DescriptionChecklistEditor({ items, onChange }: { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void }) {
	return <fieldset className="space-y-2">
		<legend className="text-sm font-medium">Description checklist</legend>
		{items.map((item, index) => <div key={item.id} className="flex items-center gap-2">
			<input type="checkbox" checked={item.completed} aria-label={`Complete checklist item ${index + 1}`} onChange={(event) => onChange(items.map((current) => current.id === item.id ? { ...current, completed: event.target.checked } : current))} />
			<Input aria-label={`Checklist item ${index + 1}`} value={item.text} maxLength={500} onChange={(event) => onChange(items.map((current) => current.id === item.id ? { ...current, text: event.target.value } : current))} />
			<Button type="button" variant="ghost" onClick={() => onChange(items.filter((current) => current.id !== item.id))} aria-label={`Remove checklist item ${index + 1}`}>Remove</Button>
		</div>)}
		<Button type="button" variant="outline" size="sm" disabled={items.length >= 100} onClick={() => onChange([...items, { id: crypto.randomUUID(), text: "", completed: false }])}>Add checklist item</Button>
	</fieldset>;
}
