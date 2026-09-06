import z from 'zod';

export const requestMagicLinkBodySchema = z.object({
  email: z.email()
});

export const requestMagicLinkSuccessResponseSchema = z.object({
  message: z.string()
});
