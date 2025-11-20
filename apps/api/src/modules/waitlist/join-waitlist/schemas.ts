import z from 'zod';
import { zDate } from '../../../shared/schemas/zod-date';

export const joinWaitlistBodySchema = z.object({
  email: z.email()
});

export const joinWaitlistSuccessResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  joinedAt: zDate
});
