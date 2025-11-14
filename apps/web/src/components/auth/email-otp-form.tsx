'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useOtpCooldown } from '@/hooks/otp-cooldown';
import { authClient } from '@/lib/auth-client';
import { EmailInputForm } from './email-input-form';
import { OtpVerificationForm } from './otp-verification-form';

type EmailOtpFormProps = {
  className?: string;
  onSuccessRedirect?: string;
};

type FormStep = 'email' | 'otp';

export function EmailOtpForm({ className, onSuccessRedirect = '/profile' }: EmailOtpFormProps) {
  const [step, setStep] = useState<FormStep>('email');
  const [userEmail, setUserEmail] = useState('');
  const { cooldown, startCooldown, isActive: isCooldownActive } = useOtpCooldown();

  const handleEmailSuccess = (email: string) => {
    setUserEmail(email);
    setStep('otp');
  };

  const handleChangeEmail = () => {
    setStep('email');
  };

  const handleResendOtp = async () => {
    if (isCooldownActive) return;

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: userEmail,
        type: 'sign-in'
      });
      startCooldown();
      toast.success('A new code has been sent.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'It was not possible to resend the code.';
      toast.error(message);
    }
  };

  if (step === 'otp') {
    return (
      <OtpVerificationForm
        className={className}
        email={userEmail}
        onSuccessRedirect={onSuccessRedirect}
        onChangeEmail={handleChangeEmail}
        onResendOtp={handleResendOtp}
        cooldown={cooldown}
        isCooldownActive={isCooldownActive}
      />
    );
  }

  return (
    <EmailInputForm
      className={className}
      onSuccess={handleEmailSuccess}
      onStartCooldown={startCooldown}
    />
  );
}
