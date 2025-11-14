'use client';

import { EmailInputForm } from '@/components/auth/email-input-form';
import { SignInButtons } from '@/components/auth/sign-in';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';

export function DesktopAuth() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>

      <h1 className="font-redaction text-7xl">Start Now</h1>

      <div className="relative z-50 mt-10 flex flex-col items-center gap-4">
        <SignInButtons />
        <EmailInputForm redirectToVerifyPage={true} />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 w-full">
        <div
          className="absolute right-0 bottom-16 left-0 flex items-end justify-between px-30"
          style={{
            transformOrigin: 'bottom center',
            zIndex: 1
          }}
        >
          <div className="relative">
            <Illustrations.Dragon />
          </div>

          <div className="relative">
            <Illustrations.Mage />
          </div>
        </div>

        <div className="relative flex w-full">
          <Illustrations.RightFloor className="w-full object-cover" />
          <Illustrations.RightFloor className="w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
