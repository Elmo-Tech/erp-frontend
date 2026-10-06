export interface LookupOption {
  id: number;
  type: string;
  value: string;
  label: string;
  color: string | null;
  icon: string | null;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LookupOptionFormData {
  type: string;
  value: string;
  label: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface TagFormData {
  name: string;
  color?: string;
  type?: string;
}

export type LookupType = 'specialization' | 'task_category' | 'project_type' | 'project_status' | 'task_status' | 'contract_duration';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
