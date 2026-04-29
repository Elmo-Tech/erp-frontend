export interface SOPPhase {
	name: string;
	description?: string | null;
	starts_at?: string | null;
	ends_at?: string | null;
	minutes?: number | null;
	items?: string[];
}

export interface Directive {
	id: number;
	title: string;
	description?: string | null;
	phases: SOPPhase[];
	target_permissions?: string[] | null;
	is_recurring?: boolean;
	created_by?: number | null;
	created_at?: string;
	updated_at?: string;
}

export interface DailyCheckin {
	id: number;
	user_id: number;
	directive_id: number;
	focus_items: string[];
	submitted_at: string;
}

export interface SubmitDailyCheckinPayload {
	directive_id: number;
	focus_items: string[];
}
