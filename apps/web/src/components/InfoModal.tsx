/**
 * InfoModal Component
 *
 * A reusable informational modal component for displaying messages to users.
 * Used for notifications that require acknowledgment but not a choice (single action button).
 *
 * Follows same pattern as ConfirmationModal but simplified for info-only messages.
 */

import type { JSX, ComponentChildren } from 'preact';

/**
 * Props interface for InfoModal component.
 */
export interface InfoModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Title displayed in modal header */
  title: string;
  /** Message displayed in modal body - can be string or JSX for multi-paragraph content */
  message: ComponentChildren;
  /** Label for the action button */
  buttonLabel: string;
  /** Handler called when button is clicked or overlay is clicked */
  onClose: () => void;
}

/**
 * InfoModal Component
 *
 * Renders a small modal dialog with:
 * - Title header
 * - Message body (supports JSX for rich content)
 * - Single action button
 *
 * Click overlay to dismiss (same as ConfirmationModal pattern).
 */
export function InfoModal({
  isOpen,
  title,
  message,
  buttonLabel,
  onClose
}: InfoModalProps): JSX.Element | null {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  /**
   * Handle click on modal overlay (close modal).
   */
  const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
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
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div class="modal-footer">
          <button onClick={onClose} class="btn btn-primary">
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
