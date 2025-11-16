'use client';

import { OtpVerificationForm } from '@/components/auth/otp-verification-form';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';

type TabletAndMobileVerifyCodeProps = {
  email: string;
  cooldown: number;
  isCooldownActive: boolean;
  handleChangeEmail: () => void;
  handleResendOtp: () => Promise<void>;
};

export function TabletAndMobileVerifyCode({
  email,
  cooldown,
  isCooldownActive,
  handleChangeEmail,
  handleResendOtp
}: TabletAndMobileVerifyCodeProps) {
  return (

    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden pt-60 ">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>
      <div className="relative z-50 flex flex-col items-center gap-12 ">
      <h1 className="font-redaction text-6xl ">Start Now</h1>

        <OtpVerificationForm
          email={email}
          onSuccessRedirect="/profile"
          onChangeEmail={handleChangeEmail}
          onResendOtp={handleResendOtp}
          cooldown={cooldown}
          isCooldownActive={isCooldownActive}
        />
      </div>
      <div className="pointer-events-none w-full  ">
        <Illustrations.DragonMobile className="absolute bottom-40 left-8 " />
        <Illustrations.MageMobile className="absolute right-4 bottom-18 " />
        <div className="absolute bottom-0 w-full">
          <Illustrations.RightFloor className="w-full object-cover  scale-300 " />
          
        </div>
      </div>
    </div>
  )
}