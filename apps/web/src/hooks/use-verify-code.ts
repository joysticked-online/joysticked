'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useOtpCooldown } from '@/hooks/otp-cooldown';
import { authClient } from '@/lib/auth-client';

export function useVerifyCode() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { cooldown, startCooldown, isActive: isCooldownActive } = useOtpCooldown();

  useEffect(() => {
    setIsMounted(true);

    const storedEmail = sessionStorage.getItem('verifyEmail');
    const otpSentAt = sessionStorage.getItem('otpSentAt');

    if (!storedEmail) {
      toast.error('Session expired. Please enter your email again');
      router.push('/login');
      return;
    }

    setEmail(storedEmail);

    if (otpSentAt) {
      const sentTime = parseInt(otpSentAt, 10);
      const elapsedSeconds = Math.floor((Date.now() - sentTime) / 1000);
      const remainingCooldown = 60 - elapsedSeconds;

      if (remainingCooldown > 0) {
        startCooldown();
      }
    }
  }, [router, startCooldown]);

  const handleChangeEmail = () => {
    sessionStorage.removeItem('verifyEmail');
    sessionStorage.removeItem('otpSentAt');
    router.push('/login');
  };

  const handleResendOtp = async () => {
    if (isCooldownActive) return;

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in'
      });
      sessionStorage.setItem('otpSentAt', Date.now().toString());
      startCooldown();
      toast.success('A new code has been sent.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not resend the code.';
      toast.error(message);
    }
  };

  return {
    email,
    isMounted,
    cooldown,
    isCooldownActive,
    handleChangeEmail,
    handleResendOtp
  };
}

