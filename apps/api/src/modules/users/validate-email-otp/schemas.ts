import { z } from 'zod';

export const validateEmailOtpBodySchema = z.object({
  otp: z.string().length(6),
  validateEmailRequestId: z.uuid()
});

export type ValidateEmailOtp = z.infer<typeof validateEmailOtpBodySchema>;

export const validateEmailOtpSuccessResponseSchema = z.object({
  requestId: z.uuid()
});

export const validateEmailBadRequestResponseSchema = z.object({
  code: z.literal('BAD_REQUEST'),
  message: z.literal('Invalid OTP')
});

export const validateEmailNotFoundReponseSchema = z.object({
  code: z.literal('NOT_FOUND'),
  message: z.literal('Validation request not found')
});

export const validateEmailConflictErrorSchema = z.object({
  code: z.literal('CONFLICT'),
  message: z.literal('Validation request has already been validated')
});
