import { isAfter } from 'date-fns';

import type { Database } from '../../../shared/database';
import { createValidationRepository } from '../../../shared/database/repositories/validations-repository';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { generateOTP } from '../../../shared/utils/otp/generate-otp';
import type { RequestEmailValidation } from './schemas';

export async function requestEmailValidationUseCase(db: Database, data: RequestEmailValidation) {
  const validationsRepository = createValidationRepository(db);

  const anyCode = await validationsRepository.findByIdentifierAndType({
    type: 'email',
    identifier: data.email
  });

  if (anyCode?.usedAt) {
    const isExpired = isAfter(anyCode.expiresAt, new Date());

    if (!isExpired) return anyCode.id;
  }

  const unusedCode = await validationsRepository.findUnusedByIdentifierAndType({
    type: 'email',
    identifier: data.email
  });
  const isUnusedCodeValid = unusedCode ? isAfter(unusedCode.expiresAt, new Date()) : false;

  if (isUnusedCodeValid && unusedCode)
    throw new ConflictError('A valid verification code already exists for this email');

  if (unusedCode) await validationsRepository.delete(unusedCode.id);

  const otp = generateOTP();

  const { id: requestId } = await validationsRepository.create({
    code: otp,
    identifier: data.email,
    type: 'email'
  });

  // TODO: Send verification email

  return requestId;
}
