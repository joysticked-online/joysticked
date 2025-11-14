'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { DesktopAuth } from '@/components/landing/auth/desktop';
import { TabletAndMobileAuth } from '@/components/landing/auth/tablet-and-mobile';

export default function Login() {
  const [isMuted, setIsMuted] = useState(false);

  const isTabletOrMobile = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    setIsMuted(true);
  }, []);

  if (!isMuted) return null;

  if (isTabletOrMobile) {
    return <TabletAndMobileAuth />;
  }
  return <DesktopAuth />;
}
