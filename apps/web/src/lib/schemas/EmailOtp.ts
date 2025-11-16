import { z } from 'zod';

export const emailOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const otpVerificationSchema = z.object({
  otp: z.string().min(4, 'The code must have at least 4 digits')
});

export type EmailOtpFormData = z.infer<typeof emailOtpSchema>;
export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;

