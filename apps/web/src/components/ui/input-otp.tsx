"use client"

import * as React from "react"
import { useContext } from 'react'
import { OTPInput, OTPInputContext } from "input-otp"
import { 
  AnimatePresence,
  MotionConfig,
  motion 
} from 'motion/react'

import { cn } from "@/lib/utils"

// Componente principal
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

// Grupo de slots
function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

// Animação de números
function InputOTPAnimatedNumber({ value }: { value: string | null }) {
  return (
    <div className="relative flex size-[inherit] items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          data-slot="input-otp-animated-number"
          initial={{ opacity: 0.2, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.09, ease: 'easeOut' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// Fake caret animado
function FakeCaret() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="h-4 w-px bg-foreground motion-safe:animate-caret-blink motion-safe:duration-1000" />
    </div>
  )
}

// Slot com animações
function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  index: number
}) {
  const inputOTPContext = useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}
  const activeSlots = inputOTPContext?.slots.filter(slot => slot.isActive) ?? []
  const isMultiSelect = activeSlots.length > 1

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        data-slot="input-otp-slot"
        data-active={isActive}
        className={cn(
          "relative flex h-10 w-9 items-center justify-center rounded-md border border-input bg-background text-sm shadow-sm transition-all",
          "aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive",
          "data-[active=true]:border-ring data-[active=true]:ring-2 data-[active=true]:ring-ring/50",
          "data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      >
        {char && <InputOTPAnimatedNumber value={char} />}
        {hasFakeCaret && <FakeCaret />}
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key={`${isActive}-${isMultiSelect}`}
              layoutId={isMultiSelect ? `indicator-${index}` : 'indicator'}
              className="absolute inset-0 z-10 rounded-[inherit] ring-2 ring-ring"
              transition={{ duration: 0.12, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  )
}

// Separador
function InputOTPSeparator({ 
  className,
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      aria-hidden
      className={cn("h-0.5 w-2 rounded-full bg-border", className)}
      {...props}
    />
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }