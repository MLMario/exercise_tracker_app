/**
 * SetRow Component
 *
 * Presentational component for a single set row within an active workout.
 * Renders weight/reps inputs, done checkbox, and delete button.
 * Implements swipe-to-delete gesture handling for mobile-friendly set deletion.
 *
 * Structure matches index.html lines 579-615.
 * Swipe gesture uses @use-gesture/react for simplified handling.
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { useDrag } from '@use-gesture/react';
import type { WorkoutSet } from './WorkoutSurface';

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Props for SetRow component.
 */
export interface SetRowProps {
  /** The set data */
  set: WorkoutSet;
  /** Index of the parent exercise */
  exerciseIndex: number;
  /** Index of this set */
  setIndex: number;
  /** Whether this set can be deleted (true if exercise has more than 1 set) */
  canDelete: boolean;
  /** Callback to update weight */
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: number) => void;
  /** Callback to update reps */
  onRepsChange: (exerciseIndex: number, setIndex: number, reps: number) => void;
  /** Callback to toggle done state */
  onToggleDone: (exerciseIndex: number, setIndex: number) => void;
  /** Callback to delete this set */
  onDelete: (exerciseIndex: number, setIndex: number) => void;
  /** Whether this row should reset its swipe state */
  shouldResetSwipe?: boolean;
  /** Callback when swipe state changes */
  onSwipeStateChange?: (isRevealed: boolean) => void;
}

/**
 * SetRow component
 *
 * Renders a single set row with:
 * - Set number
 * - Weight input
 * - Reps input
 * - Done checkbox button
 * - Delete button (revealed via swipe gesture)
 *
 * Structure matches index.html lines 579-615.
 */
export function SetRow({
  set,
  exerciseIndex,
  setIndex,
  canDelete,
  onWeightChange,
  onRepsChange,
  onToggleDone,
  onDelete,
  shouldResetSwipe,
  onSwipeStateChange
}: SetRowProps) {
  // ==================== SWIPE STATE ====================

  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setRowRef = useRef<HTMLDivElement>(null);

  // ==================== SWIPE HANDLERS ====================

  /**
   * Reset swipe to original position.
   */
  const resetSwipe = useCallback((): void => {
    setIsRevealed(false);
    setIsDragging(false);
    if (setRowRef.current) {
      setRowRef.current.style.transform = '';
    }
    onSwipeStateChange?.(false);
  }, [onSwipeStateChange]);

  /**
   * useDrag hook from @use-gesture/react for swipe gesture handling.
   * Replaces manual pointer event handlers with simplified declarative API.
   */
  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], active, tap, event }) => {
      // Don't interfere with delete button clicks
      if ((event?.target as HTMLElement)?.closest('.btn-remove-set')) {
        return;
      }

      // Tap on revealed row closes it
      if (tap && isRevealed) {
        resetSwipe();
        return;
      }

      // Track dragging state for CSS class
      setIsDragging(active);

      // Constrain to left swipe only with rubberband past -80px
      const maxDrag = -80;
      let x: number;
      if (mx >= 0) {
        x = 0; // No right swipe
      } else if (mx >= maxDrag) {
        x = mx; // Normal drag range
      } else {
        // Rubberband: resistance increases past max
        // Every pixel past -80 adds only 0.2 pixels of movement
        const overDrag = mx - maxDrag;
        x = maxDrag + overDrag * 0.2;
      }

      if (active) {
        // During drag - follow finger
        if (setRowRef.current) {
          setRowRef.current.style.transform = `translateX(${x}px)`;
        }
      } else if (!tap) {
        // On release (not tap) - snap to position
        // Use velocity for quick swipes (vx is in px/ms, typically 0.1-2.0 for normal swipes)
        const positionThreshold = -40;
        const velocityThreshold = 0.5; // Fast left swipe snaps regardless of position

        const shouldReveal = mx < positionThreshold || (mx < -10 && vx < -velocityThreshold);

        if (shouldReveal) {
          // Snap to revealed
          setIsRevealed(true);
          if (setRowRef.current) {
            setRowRef.current.style.transform = 'translateX(-70px)';
          }
          onSwipeStateChange?.(true);
        } else {
          // Snap back
          resetSwipe();
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  );

  // ==================== EFFECTS ====================

  /**
   * Reset swipe when requested by parent.
   */
  useEffect(() => {
    if (shouldResetSwipe && isRevealed) {
      resetSwipe();
    }
  }, [shouldResetSwipe, isRevealed, resetSwipe]);

  // ==================== INPUT HANDLERS ====================

  /**
   * Handle weight input change.
   */
  const handleWeightChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    onWeightChange(exerciseIndex, setIndex, value);
  };

  /**
   * Handle reps input change.
   */
  const handleRepsChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    onRepsChange(exerciseIndex, setIndex, value);
  };

  /**
   * Handle checkbox click.
   */
  const handleToggleDone = (): void => {
    onToggleDone(exerciseIndex, setIndex);
  };

  /**
   * Handle delete button click.
   */
  const handleDelete = (e: Event): void => {
    e.stopPropagation();
    onDelete(exerciseIndex, setIndex);
  };

  // ==================== RENDER ====================
  // Structure matches index.html lines 569-615

  return (
    <div
      ref={wrapperRef}
      class={`set-row-wrapper ${isDragging ? 'swiping' : ''} ${isRevealed ? 'swipe-revealed' : ''}`}
      style={{ touchAction: 'pan-y' }}
      {...bind()}
      onClick={(e) => e.stopPropagation()}
    >
      <div ref={setRowRef} class={`set-row ${set.is_done ? 'set-done' : ''}`}>
        <div class="set-number">{set.set_number}</div>
        <input
          type="number"
          class="set-input"
          value={set.weight}
          onInput={handleWeightChange}
          min={0}
          step={0.5}
          placeholder="0"
        />
        <input
          type="number"
          class="set-input"
          value={set.reps}
          onInput={handleRepsChange}
          min={0}
          placeholder="0"
        />
        <div class="set-checkbox">
          <button
            type="button"
            class={`checkbox-btn ${set.is_done ? 'checked' : ''}`}
            onClick={handleToggleDone}
          >
            {set.is_done && <span>&#10003;</span>}
          </button>
        </div>
      </div>
      <button
        type="button"
        class="btn-remove-set"
        onClick={handleDelete}
        style={{ visibility: canDelete && (isRevealed || isDragging) ? 'visible' : 'hidden' }}
        title="Remove Set"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export default SetRow;
