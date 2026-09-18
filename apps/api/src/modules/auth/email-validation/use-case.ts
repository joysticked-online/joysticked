import type { Database } from '../../../shared/database';
import { createEmailValidationRepository } from '../../../shared/database/repositories/email-validation-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { BadRequestError } from '../../../shared/errors/bad-request-error';
import { InternalServerError } from '../../../shared/errors/internal-server-error';
import { emailService } from '../../../shared/providers/emails';
import {
  generateEmailOtp,
  hashEmailOtp,
  normalizeEmail,
  verifyEmailOtp
} from '../../../shared/utils/email-validation';
import type { RequestEmailValidation, VerifyEmailValidation } from './schemas';

const VALIDATION_TTL_MS = 10 * 60 * 1000;

export async function requestEmailValidationUseCase(
  db: Database,
  { email }: RequestEmailValidation
) {
  const identifier = normalizeEmail(email);
  const otp = generateEmailOtp();
  const otpHash = await hashEmailOtp(otp);
  const repository = createEmailValidationRepository(db);

  const validation = await executeTransaction(db, async (tx) => {
    await repository.deleteActive(identifier, tx);
    return repository.create(
      { identifier, otpHash, expiresAt: new Date(Date.now() + VALIDATION_TTL_MS) },
      tx
    );
  });

  if (!validation) throw new InternalServerError('Failed to create email validation');

  await emailService.sendEmail({
    to: identifier,
    template: 'email-verification',
    otp,
    idempotencyKey: `email-validation:${validation.id}`
  });

  return { requestId: validation.id };
}

export async function verifyEmailValidationUseCase(
  db: Database,
  { requestId, otp }: VerifyEmailValidation
): Promise<{ verified: true; email: string }> {
  const repository = createEmailValidationRepository(db);
  const result = await executeTransaction(db, (tx) =>
    repository.consume({ id: requestId, otp, verifyOtp: verifyEmailOtp }, tx)
  );

  if (result.kind !== 'success') {
    throw new BadRequestError('Invalid or expired verification code');
  }

  return { verified: true, email: result.validation.identifier };
}
