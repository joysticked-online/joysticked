import type { Database } from '../../../shared/database';
import { createValidationRepository } from '../../../shared/database/repositories/validations-repository';
import { BadRequestError } from '../../../shared/errors/bad-request-error';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import type { ValidateEmailOtp } from './schemas';

export async function validateEmailOtpUseCase(db: Database, data: ValidateEmailOtp) {
  const validationsRepository = createValidationRepository(db);

  const validationRequest = await validationsRepository.findByIdAndType({
    id: data.validateEmailRequestId,
    type: 'email'
  });

  if (!validationRequest) {
    throw new ResourceNotFoundError('Validation request not found');
  }

  if (validationRequest.usedAt) {
    throw new ConflictError('Validation request has already been validated');
  }

  const isValidOtp = validationRequest.code === data.otp;

  if (!isValidOtp) {
    throw new BadRequestError('Invalid OTP');
  }

  await validationsRepository.markAsUsed(validationRequest.id);

  return validationRequest.id;
}
