import { afterEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './auth-api';

describe('credentialed SPA authentication contract', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads CSRF bootstrap before sending credentialed login with XSRF token', async () => {
    vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=test-token' });
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'mfa_required', enrollment_required: true }) });
    vi.stubGlobal('fetch', fetcher);
    await expect(authApi.login('staff@example.test', 'password')).resolves.toEqual({ status: 'mfa_required', enrollment_required: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0][0]).toMatch(/\/sanctum\/csrf-cookie$/);
    expect(fetcher.mock.calls[1][1]).toEqual(expect.objectContaining({
      method: 'POST', credentials: 'include',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'test-token' }),
    }));
  });

  it('uses credentialed session cookie for current-user requests', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Unauthenticated.' }) });
    vi.stubGlobal('fetch', fetcher);
    await expect(authApi.me()).rejects.toMatchObject({ status: 401 });
    expect(fetcher.mock.calls[0][1].credentials).toBe('include');
  });
});
