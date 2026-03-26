import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "./Button";

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export function Modal({
  children,
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && closeOnEscape) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="modal-overlay animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className="modal-container">
        <div className={sizeClasses[size]}>
          <div className="modal animate-scale-in">
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Modal sub-components
export function ModalHeader({ children, className, ...props }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`border-b border-surface-border px-6 py-4 ${className || ""}`} {...props}>
      {children}
    </div>
  );
}

export function ModalBody({ children, className, ...props }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`px-6 py-4 ${className || ""}`} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className, ...props }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`border-t border-surface-border px-6 py-4 ${className || ""}`} {...props}>
      {children}
    </div>
  );
}

