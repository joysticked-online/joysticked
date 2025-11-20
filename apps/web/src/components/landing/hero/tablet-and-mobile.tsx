'use client';

import { useForm } from '@tanstack/react-form';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { joinWaitlist } from '@/actions/join-waitlist';
import { FieldInfo } from '@/components/forms/field-info';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LANDING_PAGE_COPY } from '@/constants/landing-page-copy';
import { waitlistSchema } from '@/lib/schemas/waitlist';
import { SuccessfulWaitlist } from './successful-waitlist';

export function TabletAndMobileHero() {
  const [isMounted, setIsMounted] = useState(false);
  const [alreadyJoinedWaitlist, setAlreadyJoinedWaitlist] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    const hasAlreadyJoined = localStorage.getItem('alreadyJoinedWaitlist') === 'true';
    setAlreadyJoinedWaitlist(hasAlreadyJoined);
  }, []);

  const markAsJoined = () => {
    localStorage.setItem('alreadyJoinedWaitlist', 'true');
    setAlreadyJoinedWaitlist(true);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const form = useForm({
    defaultValues: {
      email: ''
    },
    async onSubmit({ value }) {
      const { error } = await joinWaitlist(value.email);

      if (error) {
        return toast.error(error);
      }

      toast.success('You have successfully joined the waitlist!');
      markAsJoined();
    }
  });

  if (!isMounted) return null;

  return (
    <>
      {alreadyJoinedWaitlist && <SuccessfulWaitlist />}
      <div className="relative flex min-h-screen flex-col items-start justify-center gap-6 overflow-hidden md:items-center">
        <div className="absolute top-14 left-6 z-20">
          <Logos.Joysticked />
        </div>

        <div className="absolute top-10 flex w-full flex-row items-center justify-between">
          <Illustrations.Clouds className="w-full overflow-visible bg-transparent" />
        </div>

        <div className="relative z-10 flex w-fit flex-col gap-6 max-md:pl-5">
          <div className="flex flex-col items-start gap-2.5 md:items-center">
            <h1 className="w-fit max-w-[250px] font-redaction text-3xl md:max-w-xl md:text-center md:text-5xl">
              {LANDING_PAGE_COPY.TITLE}
            </h1>

            <p className="max-w-md font-geist-sans font-medium text-muted-foreground text-xs max-md:max-w-xs md:text-center md:text-sm">
              {LANDING_PAGE_COPY.SUBTITLE}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="z-10 flex flex-col items-start gap-6 md:items-center"
          >
            <div className="flex flex-col items-start gap-2 md:items-center">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const result = waitlistSchema.shape.email.safeParse(value);
                    if (result.success) return undefined;
                    return result.error?.issues?.[0]?.message || 'Invalid email';
                  }
                }}
                // biome-ignore lint/correctness/noChildrenProp: its how tanstack form works
                children={(field) => (
                  <>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="jarjarbinks@sith.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-8 w-full max-w-80 border-none bg-neutral-800 max-lg:rounded-lg"
                    />
                    <FieldInfo field={field} />
                  </>
                )}
              />
            </div>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              // biome-ignore lint/correctness/noChildrenProp: its how tanstack form works
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="default"
                  disabled={!canSubmit}
                  className="h-8 w-1/2 font-geist-sans font-semibold max-md:rounded-lg md:h-fit md:w-1/3 md:font-bold"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Join our waitlist'}
                </Button>
              )}
            />
          </form>
        </div>

        <div className="w-full">
          <div>
            <Illustrations.StoppedElephantTwo className="absolute right-8 bottom-[345px] md:right-40" />
            <Illustrations.TopFloor className="-right-32 absolute bottom-80 md:right-0" />
          </div>

          <div className="absolute bottom-0 w-full">
            <Illustrations.RightFloor className="w-full scale-125" />
            <Illustrations.Ladder className="absolute right-0 bottom-18" />
          </div>
        </div>
      </div>
    </>
  );
}
