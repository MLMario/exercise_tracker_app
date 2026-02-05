/**
 * Performance test utilities for measuring render behavior
 *
 * Works with Preact Testing Library to measure render counts and timing.
 * Per `rerender-functional-setstate`: stable callbacks prevent unnecessary re-renders.
 */

/** Timestamp of a render event */
interface RenderEvent {
  timestamp: number
  renderIndex: number
}

/** Results from render measurement */
export interface RenderMetrics {
  renderCount: number
  totalTime: number
  averageTime: number
  timestamps: number[]
}

/** A spy that tracks render calls */
export interface RenderSpy {
  /** Call this in your component to record a render */
  recordRender: () => void
  /** Get the current render count */
  getRenderCount: () => number
  /** Get all render events with timestamps */
  getEvents: () => RenderEvent[]
  /** Get computed metrics */
  getMetrics: () => RenderMetrics
  /** Reset the spy for a new measurement */
  reset: () => void
}

/**
 * Creates a render spy to track component renders.
 *
 * Usage:
 * ```tsx
 * const spy = createRenderSpy()
 *
 * function TestComponent() {
 *   spy.recordRender()
 *   return <div>Test</div>
 * }
 *
 * render(<TestComponent />)
 * expect(spy.getRenderCount()).toBe(1)
 * ```
 */
export function createRenderSpy(): RenderSpy {
  let events: RenderEvent[] = []
  let startTime: number | null = null

  return {
    recordRender() {
      const now = performance.now()
      if (startTime === null) {
        startTime = now
      }
      events.push({
        timestamp: now,
        renderIndex: events.length,
      })
    },

    getRenderCount() {
      return events.length
    },

    getEvents() {
      return [...events]
    },

    getMetrics() {
      const count = events.length
      if (count === 0) {
        return {
          renderCount: 0,
          totalTime: 0,
          averageTime: 0,
          timestamps: [],
        }
      }

      const timestamps = events.map(e => e.timestamp)
      const totalTime = count > 1
        ? timestamps[count - 1] - timestamps[0]
        : 0

      return {
        renderCount: count,
        totalTime,
        averageTime: count > 1 ? totalTime / (count - 1) : 0,
        timestamps,
      }
    },

    reset() {
      events = []
      startTime = null
    },
  }
}

/** Options for measuring renders during an interaction */
interface MeasureRenderOptions {
  /** The spy to use for tracking renders */
  spy: RenderSpy
  /** The interaction to perform (should trigger renders) */
  interaction: () => void | Promise<void>
  /** Whether to reset the spy before measurement */
  resetBefore?: boolean
}

/**
 * Measures render count during an interaction.
 *
 * Usage:
 * ```tsx
 * const spy = createRenderSpy()
 * const { getRenderCount } = await measureRenderCount({
 *   spy,
 *   interaction: () => fireEvent.click(button),
 * })
 * expect(getRenderCount()).toBeLessThanOrEqual(2)
 * ```
 */
export async function measureRenderCount(options: MeasureRenderOptions): Promise<RenderMetrics> {
  const { spy, interaction, resetBefore = true } = options

  if (resetBefore) {
    spy.reset()
  }

  const startCount = spy.getRenderCount()
  const startTime = performance.now()

  await interaction()

  const endTime = performance.now()
  const endCount = spy.getRenderCount()

  const rendersDuringInteraction = endCount - startCount
  const duration = endTime - startTime

  return {
    renderCount: rendersDuringInteraction,
    totalTime: duration,
    averageTime: rendersDuringInteraction > 0 ? duration / rendersDuringInteraction : 0,
    timestamps: spy.getEvents().slice(startCount).map(e => e.timestamp),
  }
}

/** Options for measuring render time with multiple interactions */
interface MeasureRenderTimeOptions {
  /** The spy to use for tracking renders */
  spy: RenderSpy
  /** The interaction to perform (will be run multiple times) */
  interaction: () => void | Promise<void>
  /** Number of times to run the interaction (default: 5) */
  iterations?: number
}

/**
 * Measures render timing over multiple interaction cycles.
 * Useful for benchmarking average render performance.
 *
 * Usage:
 * ```tsx
 * const spy = createRenderSpy()
 * const metrics = await measureRenderTime({
 *   spy,
 *   interaction: () => {
 *     fireEvent.click(button)
 *   },
 *   iterations: 10,
 * })
 * console.log(`Average render time: ${metrics.averageTime}ms`)
 * ```
 */
export async function measureRenderTime(options: MeasureRenderTimeOptions): Promise<RenderMetrics> {
  const { spy, interaction, iterations = 5 } = options

  spy.reset()

  const allTimings: number[] = []
  let totalRenders = 0

  for (let i = 0; i < iterations; i++) {
    const startCount = spy.getRenderCount()
    const startTime = performance.now()

    await interaction()

    const endTime = performance.now()
    const endCount = spy.getRenderCount()

    const rendersDelta = endCount - startCount
    totalRenders += rendersDelta

    if (rendersDelta > 0) {
      allTimings.push((endTime - startTime) / rendersDelta)
    }
  }

  const totalTime = allTimings.reduce((sum, t) => sum + t, 0)
  const averageTime = allTimings.length > 0 ? totalTime / allTimings.length : 0

  return {
    renderCount: totalRenders,
    totalTime,
    averageTime,
    timestamps: spy.getEvents().map(e => e.timestamp),
  }
}

/**
 * Creates a wrapper component that tracks renders of its children.
 * This is a higher-order component pattern for measuring subtree renders.
 *
 * Usage with Preact:
 * ```tsx
 * const spy = createRenderSpy()
 * const TrackedComponent = withRenderTracking(MyComponent, spy)
 *
 * render(<TrackedComponent />)
 * expect(spy.getRenderCount()).toBe(1)
 * ```
 */
export function withRenderTracking<P extends object>(
  Component: (props: P) => any,
  spy: RenderSpy
): (props: P) => any {
  return function TrackedComponent(props: P) {
    spy.recordRender()
    return Component(props)
  }
}

/** Effect tracking for measuring effect execution counts */
export interface EffectSpy {
  /** Call this at the start of your effect to record it */
  recordEffect: () => void
  /** Get the current effect execution count */
  getEffectCount: () => number
  /** Reset the spy */
  reset: () => void
}

/**
 * Creates an effect spy to track effect executions.
 * Per `rerender-derived-state-no-effect`: avoid effects for state sync.
 *
 * Usage:
 * ```tsx
 * const effectSpy = createEffectSpy()
 *
 * function TestComponent() {
 *   useEffect(() => {
 *     effectSpy.recordEffect()
 *     // effect logic
 *   }, [dep])
 *   return <div>Test</div>
 * }
 *
 * // After interactions...
 * expect(effectSpy.getEffectCount()).toBe(1) // Initial mount only
 * ```
 */
export function createEffectSpy(): EffectSpy {
  let count = 0

  return {
    recordEffect() {
      count++
    },
    getEffectCount() {
      return count
    },
    reset() {
      count = 0
    },
  }
}
