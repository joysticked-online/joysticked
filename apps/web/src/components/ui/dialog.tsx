'use client';

import { type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Accessible modal foundation for product dialogs.
 * It keeps keyboard focus inside the dialog, restores it to the trigger when
 * closed, and makes Escape/backdrop dismissal consistent across the app.
 */
export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? dialog)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onOpenChange, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar diálogo"
        className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn('relative z-10 w-full outline-none', className)}
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>,
    document.body
  );
}
