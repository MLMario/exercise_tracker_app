/**
 * Baseline Performance Tests for WorkoutSurface Timer State
 *
 * Captures current render behavior before optimization (Task 1.2).
 * These tests document the baseline, not desired state.
 *
 * Timer state under test (WorkoutSurface.tsx lines 172-176):
 * - timerSeconds: number
 * - timerTotalSeconds: number
 * - timerActive: boolean
 * - timerPaused: boolean
 * - activeTimerExerciseIndex: number | null
 *
 * Per `rerender-functional-setstate`: functional setState prevents stale closures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act, waitFor } from '@testing-library/preact'
import { useState, useRef, useCallback } from 'preact/hooks'
import { createRenderSpy, type RenderSpy } from '@ironlift/shared/test-utils'
import { useTimerState } from '@ironlift/shared'

// ============================================================================
// Test Component: Isolated timer state matching WorkoutSurface lines 172-176
// ============================================================================

interface TimerTestChildProps {
  timerSeconds: number
  timerProgress: number
  isTimerActive: boolean
  exerciseIndex: number
  spy: RenderSpy
}

/** Child component to measure child renders during timer tick */
function TimerTestChild({ timerSeconds, timerProgress, isTimerActive, exerciseIndex, spy }: TimerTestChildProps) {
  spy.recordRender()
  return (
    <div data-testid={`child-${exerciseIndex}`}>
      <span data-testid="seconds">{timerSeconds}</span>
      <span data-testid="progress">{timerProgress}</span>
      <span data-testid="active">{isTimerActive ? 'active' : 'idle'}</span>
    </div>
  )
}

interface TimerTestHarnessProps {
  parentSpy: RenderSpy
  childSpy: RenderSpy
}

/**
 * Test harness that replicates WorkoutSurface timer state structure.
 * Allows us to measure render behavior in isolation.
 */
function TimerTestHarness({ parentSpy, childSpy }: TimerTestHarnessProps) {
  parentSpy.recordRender()

  // Timer state - exact copy from WorkoutSurface lines 172-176
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [_timerPaused, setTimerPaused] = useState(false)
  const [activeTimerExerciseIndex, setActiveTimerExerciseIndex] = useState<number | null>(null)

  const timerIntervalRef = useRef<number | null>(null)

  const stopTimer = useCallback((): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerActive(false)
    setTimerSeconds(0)
    setTimerTotalSeconds(0)
    setActiveTimerExerciseIndex(null)
  }, [])

  const startTimer = useCallback((seconds: number, exIndex: number): void => {
    stopTimer()
    setTimerActive(true)
    setTimerSeconds(seconds)
    setTimerTotalSeconds(seconds)
    setActiveTimerExerciseIndex(exIndex)

    timerIntervalRef.current = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          stopTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  const pauseTimer = useCallback((): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerPaused(true)
  }, [])

  const resumeTimer = useCallback((): void => {
    setTimerPaused(false)
    timerIntervalRef.current = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          stopTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  // Calculate timer progress for child
  const isTimerActiveForExercise = (exIndex: number): boolean => {
    return timerActive && activeTimerExerciseIndex === exIndex
  }

  const getTimerProgress = (exIndex: number): number => {
    if (!isTimerActiveForExercise(exIndex)) return 100
    if (timerTotalSeconds <= 0) return 0
    return Math.round((timerSeconds / timerTotalSeconds) * 100)
  }

  // Simulate having 2 exercise cards like WorkoutSurface
  const exercises = [0, 1]

  return (
    <div>
      <button data-testid="start-0" onClick={() => startTimer(90, 0)}>Start Timer 0</button>
      <button data-testid="start-1" onClick={() => startTimer(60, 1)}>Start Timer 1</button>
      <button data-testid="pause" onClick={pauseTimer}>Pause</button>
      <button data-testid="resume" onClick={resumeTimer}>Resume</button>
      <button data-testid="stop" onClick={stopTimer}>Stop</button>

      {exercises.map(exIndex => (
        <TimerTestChild
          key={exIndex}
          exerciseIndex={exIndex}
          timerSeconds={isTimerActiveForExercise(exIndex) ? timerSeconds : 90}
          timerProgress={getTimerProgress(exIndex)}
          isTimerActive={isTimerActiveForExercise(exIndex)}
          spy={childSpy}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('WorkoutSurface Timer State - Baseline Performance', () => {
  let parentSpy: RenderSpy
  let childSpy: RenderSpy

  beforeEach(() => {
    vi.useFakeTimers()
    parentSpy = createRenderSpy()
    childSpy = createRenderSpy()
  })

  afterEach(() => {
    vi.useRealTimers()
    parentSpy.reset()
    childSpy.reset()
  })

  it('should capture baseline: initial render count', () => {
    render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    /**
     * BASELINE: Initial render
     * Parent: 1 render
     * Children: 2 renders (one per exercise)
     */
    expect(parentSpy.getRenderCount()).toBe(1)
    expect(childSpy.getRenderCount()).toBe(2) // 2 children
  })

  it('should capture baseline: render count when starting timer', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    parentSpy.reset()
    childSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    /**
     * BASELINE: Starting timer causes state updates:
     * - stopTimer(): setTimerActive(false), setTimerSeconds(0), setTimerTotalSeconds(0), setActiveTimerExerciseIndex(null) = 4 setters
     * - startTimer(): setTimerActive(true), setTimerSeconds(90), setTimerTotalSeconds(90), setActiveTimerExerciseIndex(0) = 4 setters
     *
     * Preact batches these, but we're measuring the rendered result.
     * Parent renders: depends on batching (expected ~1-2)
     * Child renders: 2x per parent render
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Start Timer: Parent=${parentRenders}, Children=${childRenders}`)

    // Document baseline (tests pass regardless - capturing current behavior)
    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(2) // At least both children re-render
  })

  it('should capture baseline: render count during timer tick', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Advance timer by 1 second (one tick)
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    /**
     * BASELINE: Timer tick
     * Each tick calls setTimerSeconds(prev => prev - 1)
     * This should cause 1 parent render, 2 child renders
     *
     * Current state: All 5 timer states are separate, risking unnecessary re-renders.
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Timer Tick: Parent=${parentRenders}, Children=${childRenders}`)

    // Document baseline
    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(2)
  })

  it('should capture baseline: render count when pausing timer', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Pause timer
    await act(async () => {
      fireEvent.click(getByTestId('pause'))
    })

    /**
     * BASELINE: Pausing timer
     * pauseTimer() only sets timerPaused = true (1 setter)
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Pause Timer: Parent=${parentRenders}, Children=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(2)
  })

  it('should capture baseline: render count when resuming timer', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start and pause timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('pause'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Resume timer
    await act(async () => {
      fireEvent.click(getByTestId('resume'))
    })

    /**
     * BASELINE: Resuming timer
     * resumeTimer() sets timerPaused = false (1 setter)
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Resume Timer: Parent=${parentRenders}, Children=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(2)
  })

  it('should capture baseline: render count when stopping timer', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Stop timer
    await act(async () => {
      fireEvent.click(getByTestId('stop'))
    })

    /**
     * BASELINE: Stopping timer
     * stopTimer() sets 4 states: timerActive, timerSeconds, timerTotalSeconds, activeTimerExerciseIndex
     * These may or may not batch depending on context.
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Stop Timer: Parent=${parentRenders}, Children=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(2)
  })

  it('should capture baseline: child renders during multiple timer ticks', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer with 10 seconds
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Advance 5 ticks
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
    }

    /**
     * BASELINE: 5 timer ticks
     * Expected: 5 parent renders, 10 child renders (2 children per tick)
     *
     * After optimization with useTimerState hook, we expect:
     * - Single state update per tick
     * - Potentially fewer child renders if we optimize prop passing
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - 5 Ticks: Parent=${parentRenders}, Children=${childRenders}`)
    console.log(`BASELINE - Per Tick Average: Parent=${parentRenders / 5}, Children=${childRenders / 5}`)

    // Document baseline
    expect(parentRenders).toBeGreaterThanOrEqual(5) // At least 1 per tick
    expect(childRenders).toBeGreaterThanOrEqual(10) // At least 2 per tick (both children)
  })

  it('should capture baseline: switching timer between exercises', async () => {
    const { getByTestId } = render(<TimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer on exercise 0
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Switch to exercise 1 (should stop 0 and start 1)
    await act(async () => {
      fireEvent.click(getByTestId('start-1'))
    })

    /**
     * BASELINE: Switching timer
     * stopTimer() + startTimer() = potentially 8 state updates
     * Both children re-render as timer state changes
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Switch Timer: Parent=${parentRenders}, Children=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(2)
  })
})

// ============================================================================
// Optimized Test Component: Using useTimerState hook
// ============================================================================

/**
 * Optimized test harness that uses useTimerState hook instead of 5 separate states.
 * Tests if consolidating state improves type safety without sacrificing render performance.
 */
function OptimizedTimerTestHarness({ parentSpy, childSpy }: TimerTestHarnessProps) {
  parentSpy.recordRender()

  // Optimized: Single state hook with discriminated union
  const { timer, start, pause, resume, stop, tick } = useTimerState()

  const timerIntervalRef = useRef<number | null>(null)

  const stopTimer = useCallback((): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    stop()
  }, [stop])

  const startTimer = useCallback((seconds: number, exIndex: number): void => {
    stopTimer()
    start(exIndex, seconds)

    timerIntervalRef.current = window.setInterval(() => {
      tick()
    }, 1000)
  }, [start, tick, stopTimer])

  const pauseTimer = useCallback((): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    pause()
  }, [pause])

  const resumeTimer = useCallback((): void => {
    resume()
    timerIntervalRef.current = window.setInterval(() => {
      tick()
    }, 1000)
  }, [resume, tick])

  // Derive child props from timer state
  const isTimerActiveForExercise = (exIndex: number): boolean => {
    return timer.status === 'active' && timer.exerciseIndex === exIndex
  }

  const getTimerSeconds = (exIndex: number): number => {
    if (timer.status === 'active' && timer.exerciseIndex === exIndex) {
      return timer.total - timer.elapsed
    }
    return 90
  }

  const getTimerProgress = (exIndex: number): number => {
    if (timer.status === 'active' && timer.exerciseIndex === exIndex) {
      return Math.round(((timer.total - timer.elapsed) / timer.total) * 100)
    }
    return 100
  }

  // Simulate having 2 exercise cards like WorkoutSurface
  const exercises = [0, 1]

  return (
    <div>
      <button data-testid="start-0" onClick={() => startTimer(90, 0)}>Start Timer 0</button>
      <button data-testid="start-1" onClick={() => startTimer(60, 1)}>Start Timer 1</button>
      <button data-testid="pause" onClick={pauseTimer}>Pause</button>
      <button data-testid="resume" onClick={resumeTimer}>Resume</button>
      <button data-testid="stop" onClick={stopTimer}>Stop</button>

      {exercises.map(exIndex => (
        <TimerTestChild
          key={exIndex}
          exerciseIndex={exIndex}
          timerSeconds={getTimerSeconds(exIndex)}
          timerProgress={getTimerProgress(exIndex)}
          isTimerActive={isTimerActiveForExercise(exIndex)}
          spy={childSpy}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Optimized Tests
// ============================================================================

describe('WorkoutSurface Timer State - Optimized Performance (useTimerState)', () => {
  let parentSpy: RenderSpy
  let childSpy: RenderSpy

  beforeEach(() => {
    vi.useFakeTimers()
    parentSpy = createRenderSpy()
    childSpy = createRenderSpy()
  })

  afterEach(() => {
    vi.useRealTimers()
    parentSpy.reset()
    childSpy.reset()
  })

  it('optimized: initial render count', () => {
    render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Initial Render: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })

  it('optimized: render count when starting timer', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    parentSpy.reset()
    childSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Start Timer: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })

  it('optimized: render count during timer tick', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Advance timer by 1 second (one tick)
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Timer Tick: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })

  it('optimized: render count when pausing timer', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Pause timer
    await act(async () => {
      fireEvent.click(getByTestId('pause'))
    })

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Pause Timer: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })

  it('optimized: render count when resuming timer', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start and pause timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('pause'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Resume timer
    await act(async () => {
      fireEvent.click(getByTestId('resume'))
    })

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Resume Timer: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })

  it('optimized: render count when stopping timer', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Stop timer
    await act(async () => {
      fireEvent.click(getByTestId('stop'))
    })

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Stop Timer: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })

  it('optimized: child renders during 5 timer ticks', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer with 90 seconds
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Advance 5 ticks
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
    }

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - 5 Ticks: Parent=${parentRenders}, Children=${childRenders}`)
    console.log(`OPTIMIZED - Per Tick Average: Parent=${parentRenders / 5}, Children=${childRenders / 5}`)

    // Should match baseline: 5 parent, 10 children
    expect(parentRenders).toBe(5)
    expect(childRenders).toBe(10)
  })

  it('optimized: switching timer between exercises', async () => {
    const { getByTestId } = render(<OptimizedTimerTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Start timer on exercise 0
    await act(async () => {
      fireEvent.click(getByTestId('start-0'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Switch to exercise 1 (should stop 0 and start 1)
    await act(async () => {
      fireEvent.click(getByTestId('start-1'))
    })

    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Switch Timer: Parent=${parentRenders}, Children=${childRenders}`)

    // Should match baseline: 1 parent, 2 children
    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(2)
  })
})

/**
 * BASELINE SUMMARY (captured 2026-02-04):
 *
 * | Operation        | Baseline Parent | Baseline Children | Optimized Parent | Optimized Children |
 * |------------------|-----------------|-------------------|------------------|--------------------|
 * | Initial render   | 1               | 2                 | 1                | 2                  |
 * | Start timer      | 1               | 2                 | 1                | 2                  |
 * | Timer tick       | 1               | 2                 | 1                | 2                  |
 * | Pause timer      | 1               | 2                 | 1                | 2                  |
 * | Resume timer     | 1               | 2                 | 1                | 2                  |
 * | Stop timer       | 1               | 2                 | 1                | 2                  |
 * | 5 ticks          | 5               | 10                | 5                | 10                 |
 * | Switch timer     | 1               | 2                 | 1                | 2                  |
 *
 * ANALYSIS:
 * - Preact batches multiple setState calls effectively
 * - Current render counts are optimal (1 parent, 2 children per operation)
 * - The main value of consolidating to useTimerState is TYPE SAFETY:
 *   - Eliminates impossible states (e.g., timerActive=true with null exerciseIndex)
 *   - Discriminated union prevents bugs at compile time
 *
 * OPTIMIZATION RESULTS:
 * - Render performance: MAINTAINED (identical render counts)
 * - Type safety: IMPROVED (discriminated union enforces valid states)
 * - Code maintainability: IMPROVED (single state hook vs 5 separate states)
 * - State consistency: IMPROVED (impossible states eliminated at compile time)
 *
 * Target after optimization:
 * - Maintain same render efficiency (1 parent, 2 children per operation) ✓
 * - Add TypeScript-enforced state consistency ✓
 * - Simplify timer logic with single state transition function ✓
 */
