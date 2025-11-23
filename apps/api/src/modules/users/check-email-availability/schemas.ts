import { z } from 'zod';

export const checkEmailAvailabilityBodySchema = z.object({
  email: z.email()
});

export type CheckEmailAvailability = z.infer<typeof checkEmailAvailabilityBodySchema>;

export const checkEmailAvailabilitySuccessResponseSchema = z.object({
  available: z.literal(true)
});

export const checkEmailAvailabilityConflictResponseSchema = z.object({
  code: z.literal('CONFLICT'),
  message: z.literal('User with this email already exists')
});
