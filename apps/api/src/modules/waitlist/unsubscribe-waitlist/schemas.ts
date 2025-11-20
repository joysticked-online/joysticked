import { z } from 'zod';

export const unsubscribeFromWaitlistSchema = z.object({
  id: z.uuid()
});

export type UnsubscribeFromWaitlist = z.infer<typeof unsubscribeFromWaitlistSchema>;
