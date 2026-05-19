import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalVariants } from '@lib/motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@lib/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="absolute inset-0 bg-[hsl(222,47%,10%)]/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={modalVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={cn(
              'relative z-10 w-full surface-overlay rounded-xl border border-[hsl(var(--border-subtle))]',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title ?? description) && (
              <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border-subtle))] px-6 py-4">
                <div>
                  {title && (
                    <h2 id="modal-title" className="type-h3">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="type-body-sm mt-0.5">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="shrink-0 mt-0.5"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-[hsl(var(--border-subtle))] px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
