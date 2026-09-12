'use client';

import { Check, Heart, Link as LinkIcon, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';
import { PixelHeart } from '@/components/landing/pixel-heart';

/* =========================================================================
   1. FAVORITE BUTTON (Amicro btn-5: Pulse & Fill Micro-transition)
   ========================================================================= */
interface FavoriteMicroButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export function FavoriteMicroButton({
  isFavorite,
  onToggle,
  className = ''
}: FavoriteMicroButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      animate={{
        paddingLeft: isHovered ? 16 : 14,
        paddingRight: isHovered ? 16 : 14,
        backgroundColor: isFavorite
          ? 'rgba(255, 255, 255, 0.12)'
          : isHovered
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.04)'
      }}
      className={`relative inline-flex h-9 cursor-pointer select-none items-center justify-center rounded-full border border-white/15 font-medium text-neutral-200 text-xs backdrop-blur-md transition-colors duration-200 focus:outline-hidden ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: isFavorite ? [1, 1.35, 1] : isHovered ? [1, 1.22, 1] : 1
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <Heart
            className={`size-3.5 transition-colors duration-200 ${
              isFavorite ? 'fill-white text-white' : isHovered ? 'text-white' : 'text-neutral-400'
            }`}
          />
        </motion.div>
      </div>
      <motion.span
        layout
        className={`ml-2 whitespace-nowrap font-medium text-xs tracking-tight transition-colors duration-200 ${
          isFavorite ? 'font-semibold text-white' : 'text-neutral-300'
        }`}
      >
        {isFavorite ? 'Favorito' : 'Favoritar'}
      </motion.span>
    </motion.button>
  );
}

/* =========================================================================
   2. COPY LINK BUTTON (Amicro Morph Micro-transition: Link -> Check)
   ========================================================================= */
interface CopyLinkMicroButtonProps {
  onCopy: () => void;
  className?: string;
}

export function CopyLinkMicroButton({ onCopy, className = '' }: CopyLinkMicroButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      type="button"
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileTap={{ scale: 0.94 }}
      animate={{
        paddingLeft: isHovered ? 16 : 14,
        paddingRight: isHovered ? 16 : 14,
        backgroundColor: copied
          ? 'rgba(255, 255, 255, 0.12)'
          : isHovered
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.04)'
      }}
      className={`relative inline-flex h-9 cursor-pointer select-none items-center justify-center rounded-full border border-white/15 font-medium text-neutral-200 text-xs backdrop-blur-md transition-colors duration-200 focus:outline-hidden ${className}`}
    >
      <div className="relative flex size-3.5 shrink-0 items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {!copied ? (
            <motion.div
              key="link-icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              className="flex items-center justify-center"
            >
              <LinkIcon className="size-3.5 text-neutral-400 group-hover:text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="check-icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              className="flex items-center justify-center"
            >
              <Check className="size-3.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.span
        layout
        className={`ml-2 whitespace-nowrap font-medium text-xs tracking-tight transition-colors duration-200 ${
          copied ? 'font-semibold text-white' : 'text-neutral-300'
        }`}
      >
        {copied ? 'Copiado!' : 'Copiar link'}
      </motion.span>
    </motion.button>
  );
}

/* =========================================================================
   3. REVIEW BUTTON (Amicro btn-30: Star Color-Morph / Pop Micro-transition)
   ========================================================================= */
interface ReviewMicroButtonProps {
  onClick: () => void;
  className?: string;
}

export function ReviewMicroButton({ onClick, className = '' }: ReviewMicroButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      animate={{
        paddingLeft: isHovered ? 16 : 14,
        paddingRight: isHovered ? 16 : 14,
        backgroundColor: isHovered ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.04)',
        borderColor: isHovered ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.15)'
      }}
      className={`relative inline-flex h-9 cursor-pointer select-none items-center justify-center rounded-full border font-medium text-neutral-200 text-xs backdrop-blur-md transition-colors duration-200 focus:outline-hidden ${className}`}
    >
      <div className="relative flex size-3.5 shrink-0 items-center justify-center">
        <motion.div
          animate={{
            scale: isHovered ? [1, 1.35, 1] : 1
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <PixelHeart
            size={14}
            variant="full"
            color="#EF4444"
            className={isHovered ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : 'opacity-85'}
          />
        </motion.div>
      </div>

      <motion.span
        layout
        className={`ml-2 whitespace-nowrap font-medium text-xs tracking-tight transition-colors duration-200 ${
          isHovered ? 'text-white font-semibold' : 'text-neutral-300'
        }`}
      >
        Avaliar
      </motion.span>
    </motion.button>
  );
}
