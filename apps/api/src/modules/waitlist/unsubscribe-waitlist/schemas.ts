import { z } from 'zod';

export const unsubscribeFromWaitlistSchema = z.object({
  email: z.email()
});

export type UnsubscribeFromWaitlist = z.infer<typeof unsubscribeFromWaitlistSchema>;
