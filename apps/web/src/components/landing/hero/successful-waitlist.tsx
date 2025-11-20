'use client';

import { motion } from 'motion/react';
import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';

export function SuccessfulWaitlist() {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background"
    >
      <Illustrations.Clouds className="absolute top-10 flex w-full flex-row items-center justify-between lg:hidden" />

      <div className="absolute top-14 left-12 z-20 md:left-1/2 md:flex md:flex-col md:items-center md:justify-center">
        <Logos.Joysticked className="absolute md:top-14" />
      </div>

      <div className="flex flex-col items-start justify-center gap-4 px-10 md:px-10 md:text-center md:items-center">
        <h1 className="flex-wrap pl-2 text-left font-redaction text-5xl md:text-center md:text-8xl">
          Checkpoint Reached
        </h1>
        <p className="hidden w-fit pl-2 text-left font-geist-sans font-medium text-muted-foreground text-sm md:max-w-2xl md:text-center md:text-xl lg:block">
          Glad you respawned! Your queue spot is secure. Get ready to explore, rate, and discuss
          every game as soon as we launch!
        </p>
        <p className="block w-fit pl-2.5 text-left font-geist-sans font-medium text-md text-muted-foreground md:max-w-2xl md:text-center md:text-xl lg:hidden">
          Glad you respawned! Your queue spot is secure.
        </p>
      </div>

      <div className="absolute bottom-2/12 left-0 flex flex-col items-start justify-start md:bottom-[22%]">
        <Illustrations.Flower className="-left-15 absolute md:left-0 md:mb-[15px]" />
      </div>

      <div className="absolute right-0 bottom-0 flex flex-col items-end justify-end md:right-0">
        <Illustrations.FlowerThree className="absolute right-0 mb-[89px] md:mb-[270px]" />
        <Illustrations.FlowerTwo className="absolute bottom-0 mb-5 md:mb-[170px]" />
      </div>

      <div className="absolute bottom-0 flex w-full flex-col items-center justify-center">
        <Illustrations.Flag className="relative z-10 w-32" />
        <Illustrations.FloorWaitlist className="relative z-0 w-full" />
      </div>
    </motion.div>
  );
}
