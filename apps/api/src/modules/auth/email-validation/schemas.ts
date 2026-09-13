import { z } from 'zod';

export const requestEmailValidationBodySchema = z.object({ email: z.email() });
export const requestEmailValidationResponseSchema = z.object({ requestId: z.uuid() });

export const verifyEmailValidationBodySchema = z.object({
  requestId: z.uuid(),
  otp: z.string().regex(/^\d{6}$/)
});
export const verifyEmailValidationResponseSchema = z.object({ verified: z.literal(true) });

export type RequestEmailValidation = z.infer<typeof requestEmailValidationBodySchema>;
export type VerifyEmailValidation = z.infer<typeof verifyEmailValidationBodySchema>;
