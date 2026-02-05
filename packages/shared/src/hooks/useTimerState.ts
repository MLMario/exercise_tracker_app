import { useState, useCallback } from 'preact/hooks';

export type TimerState =
  | { status: 'idle' }
  | { status: 'active'; exerciseIndex: number; elapsed: number; total: number }
  | { status: 'paused'; exerciseIndex: number; elapsed: number; total: number };

export interface UseTimerState {
  timer: TimerState;
  start: (exerciseIndex: number, totalSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void;
  adjust: (deltaSeconds: number) => void;
}

/**
 * Manages rest timer state as a discriminated union.
 * Eliminates impossible states like active+paused or active with null exercise index.
 *
 * Per `rerender-derived-state`: single state object instead of 5 separate states.
 * Per `rerender-functional-setstate`: tick uses functional setState for stable callback.
 */
export function useTimerState(): UseTimerState {
  const [timer, setTimer] = useState<TimerState>({ status: 'idle' });

  const start = useCallback((exerciseIndex: number, totalSeconds: number) => {
    setTimer({ status: 'active', exerciseIndex, elapsed: 0, total: totalSeconds });
  }, []);

  const pause = useCallback(() => {
    setTimer(prev => {
      if (prev.status !== 'active') return prev;
      return { status: 'paused', exerciseIndex: prev.exerciseIndex, elapsed: prev.elapsed, total: prev.total };
    });
  }, []);

  const resume = useCallback(() => {
    setTimer(prev => {
      if (prev.status !== 'paused') return prev;
      return { status: 'active', exerciseIndex: prev.exerciseIndex, elapsed: prev.elapsed, total: prev.total };
    });
  }, []);

  const stop = useCallback(() => {
    setTimer({ status: 'idle' });
  }, []);

  const tick = useCallback(() => {
    setTimer(prev => {
      if (prev.status !== 'active') return prev;
      return { ...prev, elapsed: prev.elapsed + 1 };
    });
  }, []);

  const adjust = useCallback((deltaSeconds: number) => {
    setTimer(prev => {
      if (prev.status === 'idle') return prev;
      return { ...prev, total: Math.max(0, prev.total + deltaSeconds) };
    });
  }, []);

  return { timer, start, pause, resume, stop, tick, adjust };
}
