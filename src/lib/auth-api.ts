export type Permission = 'company.view' | 'projects.view' | 'finance.view' | 'finance.export' | 'payroll.view';
export type CompanyOption = {
  id: string;
  code: string;
  legal_name: string;
  country_code: string;
  permissions: Permission[];
};
export type Identity = {
  user: { id: number; name: string; email: string };
  companies: CompanyOption[];
  global_management: boolean;
  consolidation_authorized: boolean;
};
export type MfaRequired = { status: 'mfa_required'; enrollment_required: boolean };
export type AuthResult = Identity | MfaRequired;

const apiOrigin = () => (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// XSRF-TOKEN is a readable double-submit cookie; the session cookie is HttpOnly.
function csrfCookie(): string | null {
  const match = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.slice('XSRF-TOKEN='.length)) : null;
}

async function api<T>(path: string, method: 'GET' | 'POST' = 'GET', data?: object): Promise<T> {
  const modifying = method !== 'GET';
  if (modifying) {
    await fetch(`${apiOrigin()}/sanctum/csrf-cookie`, {
      credentials: 'include', headers: { Accept: 'application/json' },
    }).then((response) => { if (!response.ok) throw new ApiError(response.status, 'CSRF initialization failed.'); });
  }
  const csrf = modifying ? csrfCookie() : null;
  const response = await fetch(`${apiOrigin()}/api/v1${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(data ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const result: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof result === 'object' && result !== null && 'message' in result && typeof result.message === 'string'
      ? result.message : `API returned ${response.status}`;
    throw new ApiError(response.status, message);
  }
  return result as T;
}

export const authApi = {
  login: (email: string, password: string) => api<AuthResult>('/auth/login', 'POST', { email, password }),
  me: () => api<Identity>('/auth/me'),
  logout: () => api<{ status: 'logged_out' }>('/auth/logout', 'POST'),
  mfaStatus: () => api<MfaRequired>('/auth/mfa/status'),
  startEnrollment: () => api<{ secret: string; otpauth_uri: string }>('/auth/mfa/enroll/start', 'POST'),
  confirmEnrollment: (code: string) => api<{ status: 'authenticated'; recovery_codes: string[] }>('/auth/mfa/enroll/confirm', 'POST', { code }),
  verifyMfa: (code: string) => api<Identity>('/auth/mfa/verify', 'POST', { code }),
  switchCompany: (company_id: string) => api<{ company_id: string; permissions: Permission[] }>('/companies/switch', 'POST', { company_id }),
  getContext: () => api<{ company_id: string; permissions: Permission[] }>('/companies/context'),
  consolidationAccess: () => api<{ authorized: boolean; permission: 'consolidation.view' }>('/companies/consolidation/access'),
  authorize: (permission: Permission) => api<{ authorized: boolean; company_id: string; permission: Permission }>(`/companies/authorize/${encodeURIComponent(permission)}`),
};
