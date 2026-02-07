/**
 * ConfirmationModal Component
 *
 * A reusable confirmation dialog component for workout actions.
 * Used for finish workout, cancel workout, and template update confirmations.
 *
 * Matches structure from:
 * - index.html lines 843-873 (modal HTML structure)
 */

import type { JSX } from 'preact';

/**
 * Props interface for ConfirmationModal component.
 */
export interface ConfirmationModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Title displayed in modal header */
  title: string;
  /** Main message displayed in modal body */
  message: string;
  /** Optional secondary message (muted text) */
  secondaryMessage?: string;
  /** Label for confirm button */
  confirmLabel: string;
  /** Label for cancel button */
  cancelLabel: string;
  /** Variant for confirm button styling */
  confirmVariant?: 'primary' | 'danger';
  /** Whether clicking the overlay dismisses the modal. Defaults to true. */
  dismissOnOverlayClick?: boolean;
  /** Handler called when confirm button is clicked */
  onConfirm: () => void;
  /** Handler called when cancel button is clicked or overlay is clicked */
  onCancel: () => void;
}

/**
 * ConfirmationModal Component
 *
 * Renders a small modal dialog with:
 * - Title header
 * - Message body (with optional secondary message)
 * - Cancel and confirm buttons
 *
 * Clicking the overlay calls onCancel unless dismissOnOverlayClick is false.
 * Matches index.html modal structure (lines 843-873).
 */
export function ConfirmationModal({
  isOpen,
  title,
  message,
  secondaryMessage,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  dismissOnOverlayClick = true,
  onConfirm,
  onCancel
}: ConfirmationModalProps): JSX.Element | null {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  /**
   * Handle click on modal overlay (close modal).
   */
  const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget && dismissOnOverlayClick) {
      onCancel();
    }
  };

  /**
   * Prevent event propagation from modal content.
   */
  const handleModalClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
  };

  return (
    <div class="modal-overlay" onClick={handleOverlayClick}>
      <div class="modal modal-sm" onClick={handleModalClick}>
        <div class="modal-header">
          <h2>{title}</h2>
        </div>
        <div class="modal-body">
          <p>{message}</p>
          {secondaryMessage && <p class="text-muted">{secondaryMessage}</p>}
        </div>
        <div class="modal-footer">
          <button onClick={onCancel} class="btn btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            class={`btn btn-${confirmVariant}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
