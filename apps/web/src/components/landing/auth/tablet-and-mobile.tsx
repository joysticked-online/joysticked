'use client';

import { EmailInputForm } from '@/components/auth/email-input-form';
import { SignInButtons } from '@/components/auth/sign-in';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';

export function TabletAndMobileAuth() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>

      <div className="relative z-50 flex flex-col items-center gap-4">
        <h1 className="font-redaction text-7xl">Start Now</h1>

        <SignInButtons />
        <EmailInputForm redirectToVerifyPage={true} />
      </div>
      <div className="pointer-events-none w-full">
        <Illustrations.DragonMobile className="absolute bottom-40" />
        <Illustrations.MageMobile className="absolute right-0 bottom-40" />
        <div className="absolute bottom-0 w-full">
          <Illustrations.RightFloor className="w-full scale-125" />
        </div>
      </div>
    </div>
  );
}