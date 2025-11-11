'use client';

import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Jumping } from './jumping';
import { StepOne } from './step-one';
import { StepThree } from './step-three';
import { StepTwo } from './step-two';
import { Stopped } from './stopped';

const ELEPHANTS = {
  STEP_ONE: StepOne,
  STEP_TWO: StepTwo,
  STEP_THREE: StepThree,
  STOPPED: Stopped,
  JUMPING: Jumping
} as const;

// Original design dimensions
const ORIGINAL_WIDTH = 1600;
const ORIGINAL_START_X = -550;
const ORIGINAL_END_X = 1100;
const ORIGINAL_DURATION = 3;

export function Elephant() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [windowWidth, setWindowWidth] = useState(ORIGINAL_WIDTH);

  const walkingSteps = useMemo(
    () => [ELEPHANTS.STEP_ONE, ELEPHANTS.STEP_TWO, ELEPHANTS.STEP_THREE],
    []
  );

  const CurrentElephant = isJumping ? ELEPHANTS.JUMPING : walkingSteps[stepIndex];

  // Calculate responsive animation values
  const animationValues = useMemo(() => {
    const scale = windowWidth / ORIGINAL_WIDTH;
    const startX = ORIGINAL_START_X * scale;
    const endX = ORIGINAL_END_X * scale;
    const duration = ORIGINAL_DURATION * scale;

    return { startX, endX, duration };
  }, [windowWidth]);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const runCycle = () => {
      setIsJumping(false);

      setTimeout(() => {
        setIsJumping(true);
      }, 500);

      setTimeout(() => {
        setIsJumping(false);
      }, 1005);
    };

    runCycle();

    const interval = setInterval(runCycle, animationValues.duration * 1000);

    return () => clearInterval(interval);
  }, [animationValues.duration]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isJumping) {
        setStepIndex((prev) => (prev + 1) % 3);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isJumping]);

  return (
    <motion.div
      key={windowWidth} // Force re-mount on width change to reset animation
      initial={{ x: animationValues.startX, y: -50 }}
      animate={{ x: animationValues.endX, y: [-50, 0, -100, -10] }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeOut',
        duration: animationValues.duration,
        y: {
          duration: animationValues.duration / 2,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: animationValues.duration / 2
        }
      }}
      className="-translate-y-[60%] absolute z-10 translate-x-[520%]"
    >
      <CurrentElephant />
    </motion.div>
  );
}
