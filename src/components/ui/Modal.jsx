import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  footer,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-content ${sizeClasses[size]}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-surface2 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t border-border mt-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-text-muted text-sm mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
