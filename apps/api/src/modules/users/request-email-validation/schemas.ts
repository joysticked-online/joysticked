import { z } from 'zod';

export const requestEmailValidationBodySchema = z.object({
  email: z.email()
});

export type RequestEmailValidation = z.infer<typeof requestEmailValidationBodySchema>;

export const requestEmailValidationSuccessResponseSchema = z.object({
  requestId: z.uuid()
});

export const requestEmailValidationConflictErrorResponseSchema = z.object({
  code: z.literal('CONFLICT'),
  message: z.enum([
    'Email already verified. Please proceed to create your account',
    'A valid verification code already exists for this email'
  ])
});
