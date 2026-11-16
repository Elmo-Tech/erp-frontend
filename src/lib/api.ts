export type Health = { status: 'ok'; service: string; version: string };
export const getApiOrigin = (): string => (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000').replace(/\/$/, '');
export async function getHealth(): Promise<Health> {
  const response = await fetch(`${getApiOrigin()}/api/v1/health`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return (await response.json()) as Health;
}
// Sensitive endpoints must obtain /sanctum/csrf-cookie first and use cookie sessions;
// never place authentication tokens in localStorage.

