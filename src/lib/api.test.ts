import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHealth } from './api';

const validHealth = { status: 'ok', service: 'elmo-erp-api', version: 'v2-foundation' };

describe('backend health contract', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('requests health with cookie credentials and accepts the expected payload', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true, json: async () => validHealth });
    vi.stubGlobal('fetch', request);

    await expect(getHealth()).resolves.toEqual(validHealth);
    expect(request).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/health$/),
      expect.objectContaining({ credentials: 'include', headers: { Accept: 'application/json' } }),
    );
  });

  it('rejects failed HTTP health checks', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(getHealth()).rejects.toThrow('API returned 503');
  });
});
