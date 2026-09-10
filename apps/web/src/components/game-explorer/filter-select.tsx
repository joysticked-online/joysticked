'use client';

import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative space-y-1 ${isOpen ? 'z-30' : 'z-10'}`}>
      <span className="font-medium text-[11px] text-neutral-400">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-9.5 w-full items-center justify-between rounded-xl border px-3 text-left text-xs transition-all duration-200 ${
          isOpen
            ? 'border-white/25 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_3px_rgba(255,255,255,0.04)]'
            : 'border-white/[0.08] bg-white/[0.04] text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.16] hover:bg-white/[0.07]'
        }`}
      >
        <span className="truncate">{value}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-3.5 text-neutral-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#161616]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_18px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  option === value
                    ? 'bg-white font-medium text-black shadow-sm'
                    : 'text-neutral-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>{option}</span>
                {option === value && <Check className="size-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
