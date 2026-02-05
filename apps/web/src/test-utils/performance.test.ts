import { describe, it, expect, vi } from 'vitest'
import {
  createRenderSpy,
  createEffectSpy,
  measureRenderCount,
  measureRenderTime,
  withRenderTracking,
} from '@ironlift/shared/test-utils'

describe('createRenderSpy', () => {
  it('tracks render count', () => {
    const spy = createRenderSpy()

    expect(spy.getRenderCount()).toBe(0)

    spy.recordRender()
    expect(spy.getRenderCount()).toBe(1)

    spy.recordRender()
    spy.recordRender()
    expect(spy.getRenderCount()).toBe(3)
  })

  it('tracks timestamps with performance.now()', () => {
    const spy = createRenderSpy()

    spy.recordRender()
    spy.recordRender()

    const events = spy.getEvents()
    expect(events).toHaveLength(2)
    expect(events[0].timestamp).toBeLessThanOrEqual(events[1].timestamp)
    expect(events[0].renderIndex).toBe(0)
    expect(events[1].renderIndex).toBe(1)
  })

  it('computes metrics correctly', () => {
    const spy = createRenderSpy()

    // No renders
    let metrics = spy.getMetrics()
    expect(metrics.renderCount).toBe(0)
    expect(metrics.totalTime).toBe(0)
    expect(metrics.averageTime).toBe(0)

    // Single render
    spy.recordRender()
    metrics = spy.getMetrics()
    expect(metrics.renderCount).toBe(1)
    expect(metrics.totalTime).toBe(0) // Can't compute time with only one point
    expect(metrics.averageTime).toBe(0)

    // Multiple renders
    spy.recordRender()
    spy.recordRender()
    metrics = spy.getMetrics()
    expect(metrics.renderCount).toBe(3)
    expect(metrics.totalTime).toBeGreaterThanOrEqual(0)
    expect(metrics.timestamps).toHaveLength(3)
  })

  it('resets correctly', () => {
    const spy = createRenderSpy()

    spy.recordRender()
    spy.recordRender()
    expect(spy.getRenderCount()).toBe(2)

    spy.reset()
    expect(spy.getRenderCount()).toBe(0)
    expect(spy.getEvents()).toHaveLength(0)
  })
})

describe('createEffectSpy', () => {
  it('tracks effect execution count', () => {
    const spy = createEffectSpy()

    expect(spy.getEffectCount()).toBe(0)

    spy.recordEffect()
    expect(spy.getEffectCount()).toBe(1)

    spy.recordEffect()
    spy.recordEffect()
    expect(spy.getEffectCount()).toBe(3)
  })

  it('resets correctly', () => {
    const spy = createEffectSpy()

    spy.recordEffect()
    spy.recordEffect()
    expect(spy.getEffectCount()).toBe(2)

    spy.reset()
    expect(spy.getEffectCount()).toBe(0)
  })
})

describe('measureRenderCount', () => {
  it('measures renders during interaction', async () => {
    const spy = createRenderSpy()

    const metrics = await measureRenderCount({
      spy,
      interaction: () => {
        spy.recordRender()
        spy.recordRender()
      },
    })

    expect(metrics.renderCount).toBe(2)
    expect(metrics.totalTime).toBeGreaterThanOrEqual(0)
  })

  it('resets spy before measurement by default', async () => {
    const spy = createRenderSpy()
    spy.recordRender() // Pre-existing render

    const metrics = await measureRenderCount({
      spy,
      interaction: () => spy.recordRender(),
    })

    expect(metrics.renderCount).toBe(1) // Only the interaction render
  })

  it('can preserve previous renders', async () => {
    const spy = createRenderSpy()
    spy.recordRender() // Pre-existing render

    const metrics = await measureRenderCount({
      spy,
      interaction: () => spy.recordRender(),
      resetBefore: false,
    })

    expect(metrics.renderCount).toBe(1) // Still only counts interaction
    expect(spy.getRenderCount()).toBe(2) // But total is 2
  })

  it('handles async interactions', async () => {
    const spy = createRenderSpy()

    const metrics = await measureRenderCount({
      spy,
      interaction: async () => {
        await Promise.resolve()
        spy.recordRender()
      },
    })

    expect(metrics.renderCount).toBe(1)
  })
})

describe('measureRenderTime', () => {
  it('measures render timing over iterations', async () => {
    const spy = createRenderSpy()

    const metrics = await measureRenderTime({
      spy,
      interaction: () => spy.recordRender(),
      iterations: 3,
    })

    expect(metrics.renderCount).toBe(3)
    expect(metrics.averageTime).toBeGreaterThanOrEqual(0)
  })

  it('handles no renders gracefully', async () => {
    const spy = createRenderSpy()

    const metrics = await measureRenderTime({
      spy,
      interaction: () => { /* no render */ },
      iterations: 3,
    })

    expect(metrics.renderCount).toBe(0)
    expect(metrics.averageTime).toBe(0)
  })
})

describe('withRenderTracking', () => {
  it('wraps component to track renders', () => {
    const spy = createRenderSpy()
    const BaseComponent = (props: { value: number }) => props.value

    const TrackedComponent = withRenderTracking(BaseComponent, spy)

    // Simulate rendering
    TrackedComponent({ value: 1 })
    expect(spy.getRenderCount()).toBe(1)

    TrackedComponent({ value: 2 })
    expect(spy.getRenderCount()).toBe(2)
  })
})
