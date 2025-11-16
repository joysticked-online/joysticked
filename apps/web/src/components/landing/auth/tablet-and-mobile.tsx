'use client';

import { EmailInputForm } from '@/components/auth/email-input-form';
import { SignInButtons } from '@/components/auth/sign-in';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';
import { cn } from '@/lib/utils';

export function TabletAndMobileAuth({className}:{className?:string}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden pt-60">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>

      <div className="relative z-50 flex flex-col items-center gap-16 ">
        <h1 className="font-redaction text-6xl font-medium">Start Now</h1>

       <div className="flex items-center flex-col justify-center gap-4">
         <SignInButtons className={cn('w-[220px]',className)} />
         <EmailInputForm redirectToVerifyPage={true} />
       </div>
      </div>
      <div className="pointer-events-none w-full  ">
        <Illustrations.DragonMobile className="absolute bottom-40 left-8 " />
        <Illustrations.MageMobile className="absolute right-4 bottom-18 " />
        <div className="absolute bottom-0 w-full">
          <Illustrations.RightFloor className="w-full object-cover  scale-300 " />
          
        </div>
      </div>
    </div>
  );
}
