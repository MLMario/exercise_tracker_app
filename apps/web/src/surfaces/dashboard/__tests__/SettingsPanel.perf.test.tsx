/**
 * Baseline Performance Tests for SettingsPanel isCreating State Sync
 *
 * Captures current render behavior before optimization (Task 1.4).
 * These tests document the baseline, not desired state.
 *
 * Current pattern violates `rerender-derived-state-no-effect`:
 * - SettingsPanel has isCreating state (line 29)
 * - MyExercisesList also has isCreating state (line 71)
 * - MyExercisesList syncs its state UP to SettingsPanel via effect (lines 76-78):
 *   useEffect(() => { onCreatingChange?.(isCreating); }, [isCreating, onCreatingChange]);
 *
 * This dual-state + effect pattern:
 * - Causes extra renders (effect runs after initial render)
 * - Creates potential for state mismatch between parent and child
 * - Complicates the component relationship
 *
 * Per `rerender-derived-state-no-effect`: "Do not set state in effects solely
 * in response to prop changes; prefer derived values or keyed resets instead."
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/preact'
import { useState, useEffect, useCallback } from 'preact/hooks'
import { createRenderSpy, createEffectSpy, type RenderSpy, type EffectSpy } from '@ironlift/shared/test-utils'

// ============================================================================
// Test Components: Isolated state sync pattern matching actual implementation
// ============================================================================

interface ChildProps {
  onCreatingChange?: (creating: boolean) => void
  spy: RenderSpy
  effectSpy: EffectSpy
}

/**
 * Child component that matches MyExercisesList isCreating pattern.
 * Has its own isCreating state and syncs it up via effect.
 */
function ChildWithEffectSync({ onCreatingChange, spy, effectSpy }: ChildProps) {
  spy.recordRender()

  // Local isCreating state - matches MyExercisesList line 71
  const [isCreating, setIsCreating] = useState(false)

  // Effect-based sync - matches MyExercisesList lines 76-78
  useEffect(() => {
    effectSpy.recordEffect()
    onCreatingChange?.(isCreating)
  }, [isCreating, onCreatingChange])

  const startCreate = useCallback(() => setIsCreating(true), [])
  const endCreate = useCallback(() => setIsCreating(false), [])

  return (
    <div>
      <button data-testid="start-create" onClick={startCreate}>Start Create</button>
      <button data-testid="end-create" onClick={endCreate}>End Create</button>
      <span data-testid="child-creating">{isCreating ? 'creating' : 'idle'}</span>
    </div>
  )
}

interface ParentProps {
  parentSpy: RenderSpy
  childSpy: RenderSpy
  effectSpy: EffectSpy
}

/**
 * Parent component that matches SettingsPanel isCreating pattern.
 * Has its own isCreating state that receives updates from child via callback.
 */
function ParentWithCallback({ parentSpy, childSpy, effectSpy }: ParentProps) {
  parentSpy.recordRender()

  // Parent's isCreating state - matches SettingsPanel line 29
  const [isCreating, setIsCreating] = useState(false)

  // Uses isCreating for dismiss guards (like SettingsPanel lines 38, 47, 56)
  const canDismiss = !isCreating

  return (
    <div>
      <span data-testid="parent-creating">{isCreating ? 'creating' : 'idle'}</span>
      <span data-testid="can-dismiss">{canDismiss ? 'yes' : 'no'}</span>
      <ChildWithEffectSync
        onCreatingChange={setIsCreating}
        spy={childSpy}
        effectSpy={effectSpy}
      />
    </div>
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('SettingsPanel isCreating Sync - Baseline Performance', () => {
  let parentSpy: RenderSpy
  let childSpy: RenderSpy
  let effectSpy: EffectSpy

  beforeEach(() => {
    parentSpy = createRenderSpy()
    childSpy = createRenderSpy()
    effectSpy = createEffectSpy()
  })

  afterEach(() => {
    parentSpy.reset()
    childSpy.reset()
    effectSpy.reset()
  })

  it('should capture baseline: initial render and effect execution', () => {
    render(<ParentWithCallback parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />)

    /**
     * BASELINE: Initial render + effect
     * - Parent renders once
     * - Child renders once
     * - Effect fires once on mount (syncing initial isCreating=false to parent)
     *
     * With effect-based sync, the parent receives callback on mount even though
     * the state hasn't changed. This is wasteful.
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()
    const effectExecutions = effectSpy.getEffectCount()

    console.log(`BASELINE - Initial: Parent=${parentRenders}, Child=${childRenders}, Effects=${effectExecutions}`)

    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(1)
    expect(effectExecutions).toBe(1) // Effect runs on mount
  })

  it('should capture baseline: effect count during create flow', async () => {
    const { getByTestId } = render(
      <ParentWithCallback parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Reset after initial render
    parentSpy.reset()
    childSpy.reset()
    effectSpy.reset()

    // Start create
    await act(async () => {
      fireEvent.click(getByTestId('start-create'))
    })

    /**
     * BASELINE: Starting create
     * - Child state changes: isCreating = true
     * - Effect fires: onCreatingChange(true)
     * - Parent state changes: isCreating = true
     * - Parent re-renders
     *
     * Expected: 1 child render, 1 effect execution, 1+ parent renders
     */
    let parentRenders = parentSpy.getRenderCount()
    let childRenders = childSpy.getRenderCount()
    let effectExecutions = effectSpy.getEffectCount()

    console.log(`BASELINE - Start Create: Parent=${parentRenders}, Child=${childRenders}, Effects=${effectExecutions}`)

    expect(effectExecutions).toBeGreaterThanOrEqual(1) // Effect syncs state up

    // End create
    parentSpy.reset()
    childSpy.reset()
    effectSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('end-create'))
    })

    /**
     * BASELINE: Ending create
     * - Child state changes: isCreating = false
     * - Effect fires: onCreatingChange(false)
     * - Parent state changes: isCreating = false
     * - Parent re-renders
     */
    parentRenders = parentSpy.getRenderCount()
    childRenders = childSpy.getRenderCount()
    effectExecutions = effectSpy.getEffectCount()

    console.log(`BASELINE - End Create: Parent=${parentRenders}, Child=${childRenders}, Effects=${effectExecutions}`)

    expect(effectExecutions).toBeGreaterThanOrEqual(1)
  })

  it('should capture baseline: state consistency between parent and child', async () => {
    const { getByTestId } = render(
      <ParentWithCallback parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Initial state should match
    expect(getByTestId('parent-creating').textContent).toBe('idle')
    expect(getByTestId('child-creating').textContent).toBe('idle')
    expect(getByTestId('can-dismiss').textContent).toBe('yes')

    // Start create
    await act(async () => {
      fireEvent.click(getByTestId('start-create'))
    })

    /**
     * BASELINE: State consistency after create starts
     * Both parent and child should show "creating"
     * Dismiss should be blocked
     */
    expect(getByTestId('parent-creating').textContent).toBe('creating')
    expect(getByTestId('child-creating').textContent).toBe('creating')
    expect(getByTestId('can-dismiss').textContent).toBe('no')

    // End create
    await act(async () => {
      fireEvent.click(getByTestId('end-create'))
    })

    // State should be back to idle
    expect(getByTestId('parent-creating').textContent).toBe('idle')
    expect(getByTestId('child-creating').textContent).toBe('idle')
    expect(getByTestId('can-dismiss').textContent).toBe('yes')
  })

  it('should capture baseline: multiple create cycles', async () => {
    const { getByTestId } = render(
      <ParentWithCallback parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Reset after initial
    effectSpy.reset()

    // Do 3 create cycles
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        fireEvent.click(getByTestId('start-create'))
      })
      await act(async () => {
        fireEvent.click(getByTestId('end-create'))
      })
    }

    /**
     * BASELINE: 3 create cycles
     * Each cycle has 2 effect executions (start + end)
     * Expected: 6 effect executions
     *
     * After optimization (lifting state to parent):
     * Expected: 0 effect executions (no effect-based sync needed)
     */
    const effectExecutions = effectSpy.getEffectCount()

    console.log(`BASELINE - 3 Create Cycles: Effects=${effectExecutions}`)

    expect(effectExecutions).toBe(6) // 2 per cycle
  })

  it('should capture baseline: render cascade during state sync', async () => {
    const { getByTestId } = render(
      <ParentWithCallback parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Reset after initial
    parentSpy.reset()
    childSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('start-create'))
    })

    /**
     * BASELINE: Render cascade
     * 1. Click -> Child setState(true) -> Child re-renders
     * 2. Child render -> Effect runs -> Parent setState(true)
     * 3. Parent re-renders (child already rendered, may not re-render again)
     *
     * With lifted state:
     * 1. Click -> Parent setState(true) -> Parent re-renders
     * 2. Child receives new prop -> Child re-renders
     * Total: 2 renders, 0 effects
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Render Cascade: Parent=${parentRenders}, Child=${childRenders}`)

    // Document the current behavior
    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(1)
  })
})

/**
 * BASELINE SUMMARY (captured 2026-02-04):
 *
 * | Operation          | Parent Renders | Child Renders | Effects |
 * |--------------------|----------------|---------------|---------|
 * | Initial render     | 1              | 1             | 1       |
 * | Start create       | 1              | 2             | 1       |
 * | End create         | 1              | 2             | 1       |
 * | 3 create cycles    | -              | -             | 6       |
 *
 * KEY ISSUE: Effect-based sync fires on every state change
 * - Initial mount: effect fires even though state is unchanged (false -> false)
 * - Each state change in child triggers effect, which triggers parent re-render
 * - Child renders twice per action (once for local state, once for parent re-render cascade)
 *
 * Target after optimization (lift state to SettingsPanel):
 * - Initial mount: 0 effects (no sync needed)
 * - State changes: 0 effects (direct prop passing)
 * - Parent owns isCreating, passes to child as prop
 * - Child calls onIsCreatingChange(value) directly in handlers (not via effect)
 * - Expected: 1 parent render, 1 child render per action (down from 2 child renders)
 */
