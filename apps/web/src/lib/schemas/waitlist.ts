import { z } from 'zod';

export const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
