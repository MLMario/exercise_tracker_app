/**
 * SetRow Component
 *
 * Presentational component for a single set row within an active workout.
 * Renders weight/reps inputs, done checkbox, and delete button.
 * Implements swipe-to-delete gesture handling for mobile-friendly set deletion.
 *
 * Structure matches index.html lines 579-615.
 * Swipe handlers match js/app.js lines 773-896.
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import type { WorkoutSet } from './WorkoutSurface';

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Internal swipe tracking data.
 */
interface SwipeData {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  pointerId: number | null;
}

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
 * Matches index.html lines 579-615.
 * Swipe handling matches js/app.js lines 773-896.
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
  // Matches js/app.js lines 790-796

  const [swipeData, setSwipeData] = useState<SwipeData | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setRowRef = useRef<HTMLDivElement>(null);

  // ==================== SWIPE HANDLERS ====================
  // Matches js/app.js lines 775-881

  /**
   * Reset swipe to original position.
   */
  const resetSwipe = (): void => {
    setIsRevealed(false);
    if (setRowRef.current) {
      setRowRef.current.style.transform = '';
    }
    onSwipeStateChange?.(false);
  };

  /**
   * Handle swipe start (pointerdown/touchstart).
   * Matches js/app.js lines 775-802.
   */
  const handleSwipeStart = (event: PointerEvent | TouchEvent): void => {
    // Don't interfere if clicking the delete button
    if ((event.target as HTMLElement).closest('.btn-remove-set')) {
      return;
    }

    // Close this row if already revealed
    if (isRevealed) {
      resetSwipe();
      return;
    }

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    setSwipeData({
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      isDragging: false,
      pointerId: 'pointerId' in event ? event.pointerId : null
    });

    // Capture pointer for smoother tracking
    if ('pointerId' in event && wrapperRef.current?.setPointerCapture) {
      wrapperRef.current.setPointerCapture(event.pointerId);
    }
  };

  /**
   * Handle swipe move (pointermove/touchmove).
   * Matches js/app.js lines 804-843.
   */
  const handleSwipeMove = (event: PointerEvent | TouchEvent): void => {
    if (!swipeData) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - swipeData.startX;
    const deltaY = clientY - swipeData.startY;

    // Only handle horizontal swipes
    if (!swipeData.isDragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
      setSwipeData(prev => prev ? { ...prev, isDragging: true } : null);
    }

    if (swipeData.isDragging) {
      // Prevent scrolling when swiping horizontally
      if ('cancelable' in event && event.cancelable) {
        event.preventDefault();
      }

      // Only allow swiping left, constrain to max distance
      const swipeDistance = Math.min(0, deltaX);
      const maxSwipe = -80;
      const constrainedDistance = Math.max(maxSwipe, swipeDistance);

      // Apply transform directly
      if (setRowRef.current) {
        setRowRef.current.style.transform = `translateX(${constrainedDistance}px)`;
      }

      setSwipeData(prev => prev ? { ...prev, currentX: clientX } : null);
    }
  };

  /**
   * Handle swipe end (pointerup/touchend/pointercancel).
   * Matches js/app.js lines 846-881.
   */
  const handleSwipeEnd = (event: PointerEvent | TouchEvent): void => {
    if (!swipeData) return;

    const deltaX = swipeData.currentX - swipeData.startX;
    const threshold = -40;

    if (swipeData.isDragging && deltaX < threshold) {
      // Snap to revealed position
      setIsRevealed(true);
      if (setRowRef.current) {
        setRowRef.current.style.transform = 'translateX(-70px)';
      }
      onSwipeStateChange?.(true);
    } else {
      // Snap back to original
      resetSwipe();
    }

    // Release pointer capture
    if (swipeData.pointerId && wrapperRef.current?.releasePointerCapture) {
      try {
        wrapperRef.current.releasePointerCapture(swipeData.pointerId);
      } catch (e) {
        // Ignore if already released
      }
    }

    setSwipeData(null);
  };

  // ==================== EFFECTS ====================

  /**
   * Reset swipe when requested by parent.
   */
  useEffect(() => {
    if (shouldResetSwipe && isRevealed) {
      resetSwipe();
    }
  }, [shouldResetSwipe]);

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

  // Style to prevent text selection during swipe
  const wrapperStyle = swipeData?.isDragging ? { userSelect: 'none' as const } : {};

  return (
    <div
      ref={wrapperRef}
      class={`set-row-wrapper ${swipeData?.isDragging ? 'swiping' : ''} ${isRevealed ? 'swipe-revealed' : ''}`}
      style={wrapperStyle}
      onPointerDown={handleSwipeStart}
      onPointerMove={handleSwipeMove}
      onPointerUp={handleSwipeEnd}
      onPointerCancel={handleSwipeEnd}
      onTouchStart={handleSwipeStart}
      onTouchMove={handleSwipeMove}
      onTouchEnd={handleSwipeEnd}
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
        style={{ visibility: canDelete && isRevealed ? 'visible' : 'hidden' }}
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
