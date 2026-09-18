import { describe, expect, it } from 'bun:test';

import { generateEmailOtp, hashEmailOtp, normalizeEmail, verifyEmailOtp } from './email-validation';

describe('email validation crypto', () => {
  it('normalizes identifiers', () => {
    expect(normalizeEmail('  Player@Example.COM ')).toBe('player@example.com');
  });

  it('generates six-digit OTPs and stores only verifiable hashes', async () => {
    const otp = generateEmailOtp();
    const hash = await hashEmailOtp(otp);

    expect(otp).toMatch(/^\d{6}$/);
    expect(hash).not.toContain(otp);
    expect(await verifyEmailOtp(otp, hash)).toBe(true);
    expect(await verifyEmailOtp('000000', hash)).toBe(false);
  });
});
