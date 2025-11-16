'use client';

import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { FieldInfo } from '@/components/forms/field-info';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { emailOtpSchema } from '@/lib/schemas/EmailOtp';
import { cn } from '@/lib/utils';

type EmailInputFormProps = {
  className?: string;
  onSuccess?: (email: string) => void;
  onStartCooldown?: () => void;
  redirectToVerifyPage?: boolean;
};

export function EmailInputForm({
  className,
  onSuccess,
  onStartCooldown,
  redirectToVerifyPage = false
}: EmailInputFormProps) {
  const router = useRouter();
  const emailForm = useForm({
    defaultValues: {
      email: ''
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.emailOtp.sendVerificationOtp({
          email: value.email,
          type: 'sign-in'
        });

        toast.success(``);

        if (redirectToVerifyPage) {
          sessionStorage.setItem('verifyEmail', value.email);
          sessionStorage.setItem('otpSentAt', Date.now().toString());
          router.push('/verifyCode');
        } else {
          onSuccess?.(value.email);
          onStartCooldown?.();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The code could not be sent.';
        toast.error(message);
      }
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        emailForm.handleSubmit();
      }}
      className={cn('relative z-50 flex w-full flex-col items-center gap-4', className)}
    >
      <div className="relative z-50 flex flex-col items-center gap-2">
        <emailForm.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const result = emailOtpSchema.shape.email.safeParse(value);
              if (result.success) return undefined;
              return result.error?.issues?.[0]?.message || 'Invalid email address';
            }
          }}
          children={(field) => (
            <>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                inputMode="email"
                placeholder="email@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="email"
                disabled={emailForm.state.isSubmitting}
                className="relative z-50 mt-4 h-7 w-[220px] rounded-3xl border-none bg-neutral-800 p-4"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>

      <emailForm.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            variant="default"
            disabled={!canSubmit}
            className="relative z-50 h-7 cursor-pointer rounded-[14px] px-6 font-geist-sans text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send me a OTP'
            )}
          </Button>
        )}
      />
    </form>
  );
}
