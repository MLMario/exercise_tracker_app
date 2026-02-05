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

// ============================================================================
// Optimized Components: Lifted State Pattern (no effects)
// ============================================================================

interface OptimizedChildProps {
  isCreating: boolean
  onIsCreatingChange?: (creating: boolean) => void
  spy: RenderSpy
  effectSpy: EffectSpy
}

/**
 * Optimized child component with lifted state.
 * No local state, no effects - just receives state as prop.
 */
function OptimizedChild({ isCreating, onIsCreatingChange, spy, effectSpy }: OptimizedChildProps) {
  spy.recordRender()

  // No local state - isCreating comes from parent
  // No effects - no sync needed

  const startCreate = useCallback(() => {
    onIsCreatingChange?.(true)
  }, [onIsCreatingChange])

  const endCreate = useCallback(() => {
    onIsCreatingChange?.(false)
  }, [onIsCreatingChange])

  return (
    <div>
      <button data-testid="start-create-opt" onClick={startCreate}>Start Create</button>
      <button data-testid="end-create-opt" onClick={endCreate}>End Create</button>
      <span data-testid="child-creating-opt">{isCreating ? 'creating' : 'idle'}</span>
    </div>
  )
}

/**
 * Optimized parent component that owns isCreating state.
 * Passes state down to child as prop.
 */
function OptimizedParent({ parentSpy, childSpy, effectSpy }: ParentProps) {
  parentSpy.recordRender()

  // Parent owns isCreating state
  const [isCreating, setIsCreating] = useState(false)

  // Uses isCreating for dismiss guards
  const canDismiss = !isCreating

  return (
    <div>
      <span data-testid="parent-creating-opt">{isCreating ? 'creating' : 'idle'}</span>
      <span data-testid="can-dismiss-opt">{canDismiss ? 'yes' : 'no'}</span>
      <OptimizedChild
        isCreating={isCreating}
        onIsCreatingChange={setIsCreating}
        spy={childSpy}
        effectSpy={effectSpy}
      />
    </div>
  )
}

// ============================================================================
// Optimized Tests
// ============================================================================

describe('SettingsPanel isCreating - Optimized Performance (lifted state)', () => {
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

  it('optimized: initial render - no effect execution', () => {
    render(<OptimizedParent parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />)

    /**
     * OPTIMIZED: Initial render with lifted state
     * - Parent renders once
     * - Child renders once
     * - No effects needed (child receives state as prop)
     *
     * Improvement: Effects reduced from 1 to 0
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()
    const effectExecutions = effectSpy.getEffectCount()

    console.log(`OPTIMIZED - Initial: Parent=${parentRenders}, Child=${childRenders}, Effects=${effectExecutions}`)

    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(1)
    expect(effectExecutions).toBe(0) // Down from 1 in baseline
  })

  it('optimized: create flow - no effect sync', async () => {
    const { getByTestId } = render(
      <OptimizedParent parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Reset after initial render
    parentSpy.reset()
    childSpy.reset()
    effectSpy.reset()

    // Start create
    await act(async () => {
      fireEvent.click(getByTestId('start-create-opt'))
    })

    /**
     * OPTIMIZED: Starting create
     * - Child calls onIsCreatingChange(true) directly in handler
     * - Parent state changes: isCreating = true
     * - Parent re-renders
     * - Child re-renders with new prop
     *
     * No effects needed - direct state update
     */
    let parentRenders = parentSpy.getRenderCount()
    let childRenders = childSpy.getRenderCount()
    let effectExecutions = effectSpy.getEffectCount()

    console.log(`OPTIMIZED - Start Create: Parent=${parentRenders}, Child=${childRenders}, Effects=${effectExecutions}`)

    expect(effectExecutions).toBe(0) // Down from 1 in baseline

    // End create
    parentSpy.reset()
    childSpy.reset()
    effectSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('end-create-opt'))
    })

    /**
     * OPTIMIZED: Ending create
     * - Child calls onIsCreatingChange(false) directly in handler
     * - Parent state changes: isCreating = false
     * - Parent re-renders
     * - Child re-renders with new prop
     */
    parentRenders = parentSpy.getRenderCount()
    childRenders = childSpy.getRenderCount()
    effectExecutions = effectSpy.getEffectCount()

    console.log(`OPTIMIZED - End Create: Parent=${parentRenders}, Child=${childRenders}, Effects=${effectExecutions}`)

    expect(effectExecutions).toBe(0) // Down from 1 in baseline
  })

  it('optimized: state consistency between parent and child', async () => {
    const { getByTestId } = render(
      <OptimizedParent parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Initial state should match
    expect(getByTestId('parent-creating-opt').textContent).toBe('idle')
    expect(getByTestId('child-creating-opt').textContent).toBe('idle')
    expect(getByTestId('can-dismiss-opt').textContent).toBe('yes')

    // Start create
    await act(async () => {
      fireEvent.click(getByTestId('start-create-opt'))
    })

    /**
     * OPTIMIZED: State consistency after create starts
     * Both parent and child should show "creating"
     * Dismiss should be blocked
     * State is always consistent because there's only one source of truth
     */
    expect(getByTestId('parent-creating-opt').textContent).toBe('creating')
    expect(getByTestId('child-creating-opt').textContent).toBe('creating')
    expect(getByTestId('can-dismiss-opt').textContent).toBe('no')

    // End create
    await act(async () => {
      fireEvent.click(getByTestId('end-create-opt'))
    })

    // State should be back to idle
    expect(getByTestId('parent-creating-opt').textContent).toBe('idle')
    expect(getByTestId('child-creating-opt').textContent).toBe('idle')
    expect(getByTestId('can-dismiss-opt').textContent).toBe('yes')
  })

  it('optimized: multiple create cycles - zero effects', async () => {
    const { getByTestId } = render(
      <OptimizedParent parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Reset after initial
    effectSpy.reset()

    // Do 3 create cycles
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        fireEvent.click(getByTestId('start-create-opt'))
      })
      await act(async () => {
        fireEvent.click(getByTestId('end-create-opt'))
      })
    }

    /**
     * OPTIMIZED: 3 create cycles
     * Each cycle has 0 effect executions (direct state updates)
     * Expected: 0 effect executions
     *
     * Improvement: Down from 6 effects in baseline
     */
    const effectExecutions = effectSpy.getEffectCount()

    console.log(`OPTIMIZED - 3 Create Cycles: Effects=${effectExecutions}`)

    expect(effectExecutions).toBe(0) // Down from 6 in baseline
  })

  it('optimized: render cascade - no extra child renders', async () => {
    const { getByTestId } = render(
      <OptimizedParent parentSpy={parentSpy} childSpy={childSpy} effectSpy={effectSpy} />
    )

    // Reset after initial
    parentSpy.reset()
    childSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('start-create-opt'))
    })

    /**
     * OPTIMIZED: Render cascade with lifted state
     * 1. Click -> onIsCreatingChange(true) -> Parent setState(true)
     * 2. Parent re-renders -> Child receives new prop -> Child re-renders
     * Total: 1 parent render, 1 child render, 0 effects
     *
     * Improvement: Child renders reduced from 2 to 1
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`OPTIMIZED - Render Cascade: Parent=${parentRenders}, Child=${childRenders}`)

    expect(parentRenders).toBe(1)
    expect(childRenders).toBe(1) // Down from 2 in baseline
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
 * OPTIMIZED SUMMARY (lifted state pattern):
 *
 * | Operation          | Parent Renders | Child Renders | Effects |
 * |--------------------|----------------|---------------|---------|
 * | Initial render     | 1              | 1             | 0       |
 * | Start create       | 1              | 1             | 0       |
 * | End create         | 1              | 1             | 0       |
 * | 3 create cycles    | -              | -             | 0       |
 *
 * BASELINE vs OPTIMIZED COMPARISON:
 *
 * | Metric                      | Baseline | Optimized | Improvement |
 * |-----------------------------|----------|-----------|-------------|
 * | Effects on initial render   | 1        | 0         | -1 (100%)   |
 * | Effects per state change    | 1        | 0         | -1 (100%)   |
 * | Effects per 3 cycles        | 6        | 0         | -6 (100%)   |
 * | Child renders per action    | 2        | 1         | -1 (50%)    |
 *
 * OPTIMIZED PATTERN BENEFITS:
 * - Effects eliminated: 100% reduction (all effect-based sync removed)
 * - Child renders reduced: 50% reduction (2 → 1 per action)
 * - Single source of truth: Parent owns isCreating, child receives as prop
 * - Direct state updates: Child calls onIsCreatingChange() in handlers (not via effect)
 * - No state mismatch risk: Only one state variable, always consistent
 * - Simpler mental model: Standard React/Preact unidirectional data flow
 */
