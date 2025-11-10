import z from 'zod';

export const joinWaitlistBodySchema = z.object({
  email: z.email()
});
