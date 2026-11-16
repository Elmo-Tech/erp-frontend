import { describe, expect, it } from 'vitest';
import { companyLabel, requireIsoCurrency } from './format';
describe('foundational helpers', () => {
  it('names legal entities without mixing them', () => { expect(companyLabel('EG')).toContain('Egypt'); expect(companyLabel('IT')).toContain('Italy'); });
  it('rejects currency symbols as identifiers', () => { expect(requireIsoCurrency('EUR')).toBe('EUR'); expect(() => requireIsoCurrency('€')).toThrow(); });
});
