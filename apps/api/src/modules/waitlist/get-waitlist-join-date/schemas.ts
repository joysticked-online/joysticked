import { z } from 'zod';
import { zDate } from '../../../shared/schemas/zod-date';

export const getWaitlistJoinDateQuerySchema = z.object({
  email: z.email()
});

export type GetWaitlistJoinDate = z.infer<typeof getWaitlistJoinDateQuerySchema>;

export const getWaitlistJoinDateResponseSchema = z.object({
  joinDate: zDate
});
