'use client';

import { useEffect, useState } from 'react';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LANDING_PAGE_COPY } from '@/constants/landing-page-copy';

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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>

      <div
        className="absolute bottom-0 left-0 origin-bottom-left flex flex-row items-end"
        style={{
          transform: `scale(${scale})`,
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

      <div className="z-10 flex flex-col items-center gap-7">
        <Input placeholder="kratos@godofwar.com" className="w-80 bg-neutral-800" />
        <Button variant="default" className="w-2/3 py-1 font-bold font-geist-sans">
          Join our waitlist
        </Button>
      </div>
    </div>
  );
}
