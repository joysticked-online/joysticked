import { z } from 'zod';
import { zDate } from '../../../shared/schemas/zod-date';

export const getWaitlistJoinDateQuerySchema = z.object({
  id: z.uuid()
});

export type GetWaitlistJoinDate = z.infer<typeof getWaitlistJoinDateQuerySchema>;

export const getWaitlistJoinDateResponseSchema = z.object({
  joinDate: zDate
});
