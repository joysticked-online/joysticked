const OTP_LENGTH = 6;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateEmailOtp(): string {
  const limit = Math.floor(2 ** 32 / 1_000_000) * 1_000_000;
  const bytes = new Uint32Array(1);

  do {
    crypto.getRandomValues(bytes);
  } while ((bytes[0] ?? 0) >= limit);

  return ((bytes[0] ?? 0) % 1_000_000).toString().padStart(OTP_LENGTH, '0');
}

export async function hashEmailOtp(otp: string): Promise<string> {
  return Bun.password.hash(otp, { algorithm: 'argon2id' });
}

export async function verifyEmailOtp(otp: string, hash: string): Promise<boolean> {
  return Bun.password.verify(otp, hash);
}
