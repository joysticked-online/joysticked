'use client';

import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { FieldInfo } from '@/components/forms/field-info';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { otpVerificationSchema } from '@/lib/schemas/EmailOtp';
import { cn } from '@/lib/utils';

type OtpVerificationFormProps = {
  className?: string;
  email: string;
  onSuccessRedirect?: string;
  onChangeEmail: () => void;
  onResendOtp: () => void;
  cooldown: number;
  isCooldownActive: boolean;
};

const OTP_LENGTH = 6;

export function OtpVerificationForm({
  className,
  email,
  onSuccessRedirect = '/profile',
  onChangeEmail,
  onResendOtp,
  cooldown,
  isCooldownActive
}: OtpVerificationFormProps) {
  const [hasError, setHasError] = useState(false);

  const otpForm = useForm({
    defaultValues: {
      otp: ''
    },
    onSubmit: async ({ value }) => {
      if (value.otp.length !== OTP_LENGTH) {
        toast.error(`The code must have ${OTP_LENGTH} digits.`);
        return;
      }

      try {
        setHasError(false);

        const result = await authClient.signIn.emailOtp({
          email,
          otp: value.otp
        });

        if (result?.error) {
          throw new Error(result.error.message || 'Invalid or expired code.');
        }

        toast.success('Login successful! Redirecting...', {
          duration: 1000
        });

        setTimeout(() => {
          sessionStorage.removeItem('verifyEmail');
          sessionStorage.removeItem('otpSentAt');
          window.location.href = onSuccessRedirect;
        }, 1000);
      } catch (error) {
        console.error('OTP verification error:', error);
        setHasError(true);

        let errorMessage = 'Incorrect code. Please try again.';

        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('expired')) {
            errorMessage = 'Code expired. Request a new code.';
          } else if (error.message.toLowerCase().includes('invalid')) {
            errorMessage = 'Incorrect code. Please check the code in your email.';
          } else {
            errorMessage = error.message;
          }
        }

        toast.error(errorMessage, {
          duration: 4000
        });

        otpForm.reset();
        setTimeout(() => {
          setTimeout(() => setHasError(false), 3000);
        }, 100);

      }
    }
  });


  const slotClassName = "w-14 h-20 md:w-14 md:h-24 border-none text-center bg-[#44403c]/[30%] text-2xl font-semibold !rounded-full  text-white  flex items-center justify-center";

  const erroSlots = hasError ? "border-red-500 bg-red-850/20" : "border-neutral-700";
  return (
    <form

      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        otpForm.handleSubmit();
      }}
      className={cn('relative z-50 flex w-full flex-col items-center gap-6', className)}
    >


      <div className="relative z-50 flex flex-col items-center gap-6">
        <otpForm.Field
          name="otp"
          validators={{
            onChange: ({ value }) => {
              if (!value) return undefined;

              if (value.length < OTP_LENGTH) {
                return `Digite todos os ${OTP_LENGTH} dígitos`;
              }

              const result = otpVerificationSchema.shape.otp.safeParse(value);
              if (result.success) return undefined;
              return result.error?.issues?.[0]?.message || 'Código inválido';
            }
          }}
          children={(field) => (
            <>
              <div className="relative flex flex-col items-center gap-2">
                <InputOTP
                  maxLength={OTP_LENGTH}
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value);
                    if (hasError) setHasError(false);
                  }}
                  onBlur={field.handleBlur}
                  disabled={otpForm.state.isSubmitting}
                  containerClassName="relative z-50"
                  autoFocus

                >
                  <InputOTPGroup className={cn(
                    "gap-2",
                    hasError && "[&>div]:border-red-500 [&>div]:bg-red-950/20 [&>div]:text-red-400"
                  )}>
                    <InputOTPSlot
                      index={0}
                      className={cn(
                        slotClassName,erroSlots

                      )}
                    />
                    <InputOTPSlot
                      index={1}
                      className={cn(
                        slotClassName,erroSlots
                      )}
                    />
                    <InputOTPSlot
                      index={2}
                      className={cn(
                        slotClassName,erroSlots
                      )}
                    />

                  </InputOTPGroup>

                  <InputOTPSeparator/>

                  <InputOTPGroup
                  className={cn( "gap-2",
                  hasError && "[&>div]:border-red-500 [&>div]:bg-red-950/20 [&>div]:text-red-400")}
                  >

                    <InputOTPSlot
                      index={3}
                      className={cn(
                        slotClassName,erroSlots
                      )}
                    />
                    <InputOTPSlot
                      index={4}
                      className={cn(
                        slotClassName,erroSlots
                      )}
                    />

                    <InputOTPSlot
                      index={5}
                      className={cn(
                        slotClassName,erroSlots
                      )}
                    />
                  </InputOTPGroup>
                </InputOTP>

              </div>

              <div className="flex flex-col items-center justify-center gap-1">
                <span className="font-semibold  font-geist-sans ">Please enter the one-time password sent </span>
                <span className="font-semibold  font-geist-sans">to your e-mail.</span>
              </div>

            </>
          )}
        />
      </div>

      <otpForm.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            variant="default"
            disabled={!canSubmit || otpForm.state.values.otp.length !== OTP_LENGTH}
            className="relative z-50 w-3/7 cursor-pointer rounded-[14px] font-bold font-geist-sans text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        )}
      />
    </form>
  );
}
