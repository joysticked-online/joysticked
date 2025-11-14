import { z } from 'zod';

export const emailOtpSchema = z.object({
  email: z.string().email('Informe um email válido')
});

export const otpVerificationSchema = z.object({
  otp: z.string().min(4, 'O código deve ter pelo menos 4 dígitos')
});

export type EmailOtpFormData = z.infer<typeof emailOtpSchema>;
export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;

