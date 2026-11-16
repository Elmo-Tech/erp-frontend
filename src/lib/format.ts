export function companyLabel(code: 'EG' | 'IT'): string { return code === 'EG' ? 'Elmo Tech Egypt' : 'Elmo Tech Italy'; }
export function requireIsoCurrency(value: string): string {
  if (!/^[A-Z]{3}$/.test(value)) throw new Error('Expected an ISO 4217 currency code');
  return value;
}
