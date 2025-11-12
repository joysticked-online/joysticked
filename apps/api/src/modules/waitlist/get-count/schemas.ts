import { z } from 'zod';

export const getWaitlistCountSuccessReponseSchema = z.object({
  count: z.number().int()
});
