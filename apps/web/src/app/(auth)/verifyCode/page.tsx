'use client';

import { useMediaQuery } from 'usehooks-ts';

import { useVerifyCode } from '@/hooks/use-verify-code';
import { TabletAndMobileVerifyCode } from '@/components/landing/verifyCode/tablet-and-mobile';
import { DesktopVerifyCode } from '@/components/landing/verifyCode/desktop';

export default function VerifyCode() {
  const isTabletOrMobile = useMediaQuery('(max-width: 1024px)');
  
  const {
    email,
    isMounted,
    cooldown,
    isCooldownActive,
    handleChangeEmail,
    handleResendOtp
  } = useVerifyCode();

  if (!isMounted || !email) {
    return null;
  }

  const verifyCodeProps = {
    email,
    cooldown,
    isCooldownActive,
    handleChangeEmail,
    handleResendOtp
  };

  if (isTabletOrMobile) {
    return <TabletAndMobileVerifyCode {...verifyCodeProps} />;
  }

  return <DesktopVerifyCode {...verifyCodeProps} />;
}
