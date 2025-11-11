'use client';

import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { joinWaitlist } from '@/actions/join-waitlist';
import { FieldInfo } from '@/components/forms/field-info';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LANDING_PAGE_COPY } from '@/constants/landing-page-copy';
import { waitlistSchema } from '@/lib/schemas/waitlist';

const ORIGINAL_WIDTH = 1600;

export function DesktopHero() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const newScale = viewportWidth / ORIGINAL_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const form = useForm({
    defaultValues: {
      email: ''
    },
    onSubmit: async ({ value }) => {
      const { error } = await joinWaitlist(value.email);

      if (error) {
        return toast.error(error);
      }
    }
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>

      <div
        className="absolute bottom-0 left-0 flex origin-bottom-left flex-row items-end"
        style={{
          transform: `scale(${scale})`
        }}
      >
        <Illustrations.Elephant />

        <div className="relative">
          <Illustrations.HalfPortal className="z-0" />
          <Illustrations.Flower className="absolute bottom-0 z-1" />
        </div>

        <div className="relative flex items-end">
          <Illustrations.LeftFloor className="z-0" />
          <Illustrations.Pipe className="absolute bottom-0 z-1 translate-x-[650%]" />
          <Illustrations.RightFloor className="z-0" />

          <div className="absolute right-10 bottom-0 flex flex-col">
            <Illustrations.FlowerThree className="-translate-x-1/3 mb-12 rotate-[-10deg]" />
            <Illustrations.FlowerTwo />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <h1 className="w-fit max-w-4xl text-center font-redaction text-7xl">
          {LANDING_PAGE_COPY.TITLE}
        </h1>

        <p className="max-w-2xl text-center font-geist-sans font-medium text-muted-foreground text-xl">
          {LANDING_PAGE_COPY.SUBTITLE}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="z-10 flex flex-col items-center gap-7"
      >
        <div className="flex flex-col items-center gap-2">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = waitlistSchema.shape.email.safeParse(value);
                if (result.success) return undefined;
                return result.error?.issues?.[0]?.message || 'Invalid email';
              }
            }}
            children={(field) => (
              <>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="kratos@godofwar.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full max-w-80 border-none bg-neutral-800 pr-12"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="default"
              disabled={!canSubmit}
              className="w-2/3 py-1 font-bold font-geist-sans"
            >
              {isSubmitting ? 'Joining...' : 'Join our waitlist'}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
