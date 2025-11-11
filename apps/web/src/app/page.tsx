'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { DesktopHero } from '@/components/landing/hero/desktop';
import { TabletAndMobileHero } from '@/components/landing/hero/tablet-and-mobile';

export default function Home() {
  const [isMuted, setIsMuted] = useState(false);

  const isTabletOrMobile = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    setIsMuted(true);
  }, []);

  if (!isMuted) return null;

  if (isTabletOrMobile) {
    return <TabletAndMobileHero />;
  }

  return <DesktopHero />;
}
