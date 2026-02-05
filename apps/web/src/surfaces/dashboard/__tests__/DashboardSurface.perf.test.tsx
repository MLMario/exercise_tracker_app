/**
 * Baseline Performance Tests for DashboardSurface Modal State Patterns
 *
 * Captures current render behavior before optimization (Task 1.3).
 * These tests document the baseline, not desired state.
 *
 * Modal state under test (DashboardSurface.tsx lines 90-95):
 * - showDeleteChartModal: boolean
 * - pendingDeleteChartId: string | null
 * - showDeleteTemplateModal: boolean
 * - pendingDeleteTemplateId: string | null
 *
 * Per `rerender-derived-state`: discriminated union eliminates impossible states.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/preact'
import { useState, useCallback } from 'preact/hooks'
import { createRenderSpy, type RenderSpy } from '@ironlift/shared/test-utils'

// ============================================================================
// Test Component: Isolated modal state matching DashboardSurface lines 90-95
// ============================================================================

interface ModalTestChildProps {
  showModal: boolean
  pendingId: string | null
  spy: RenderSpy
}

/** Child component to measure re-renders when modal state changes */
function ModalTestChild({ showModal, pendingId, spy }: ModalTestChildProps) {
  spy.recordRender()
  return (
    <div data-testid="child">
      <span data-testid="show">{showModal ? 'open' : 'closed'}</span>
      <span data-testid="id">{pendingId || 'none'}</span>
    </div>
  )
}

interface ModalTestHarnessProps {
  parentSpy: RenderSpy
  childSpy: RenderSpy
}

/**
 * Test harness that replicates DashboardSurface modal state structure.
 * Uses paired boolean + ID state (the pattern to be optimized).
 */
function ModalTestHarness({ parentSpy, childSpy }: ModalTestHarnessProps) {
  parentSpy.recordRender()

  // Modal state for delete chart - exact copy from DashboardSurface lines 90-91
  const [showDeleteChartModal, setShowDeleteChartModal] = useState(false)
  const [pendingDeleteChartId, setPendingDeleteChartId] = useState<string | null>(null)

  // Modal state for delete template - exact copy from DashboardSurface lines 94-95
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false)
  const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(null)

  // Open chart modal - matches handleDeleteChart
  const handleDeleteChart = useCallback((id: string): void => {
    setPendingDeleteChartId(id)
    setShowDeleteChartModal(true)
  }, [])

  // Dismiss chart modal - matches dismissDeleteChartModal
  const dismissDeleteChartModal = useCallback((): void => {
    setShowDeleteChartModal(false)
    setPendingDeleteChartId(null)
  }, [])

  // Open template modal - matches handleDeleteTemplate
  const handleDeleteTemplate = useCallback((id: string): void => {
    setPendingDeleteTemplateId(id)
    setShowDeleteTemplateModal(true)
  }, [])

  // Dismiss template modal - matches dismissDeleteTemplateModal
  const dismissDeleteTemplateModal = useCallback((): void => {
    setShowDeleteTemplateModal(false)
    setPendingDeleteTemplateId(null)
  }, [])

  return (
    <div>
      <button data-testid="open-chart-modal" onClick={() => handleDeleteChart('chart-1')}>
        Delete Chart
      </button>
      <button data-testid="close-chart-modal" onClick={dismissDeleteChartModal}>
        Close Chart Modal
      </button>
      <button data-testid="open-template-modal" onClick={() => handleDeleteTemplate('template-1')}>
        Delete Template
      </button>
      <button data-testid="close-template-modal" onClick={dismissDeleteTemplateModal}>
        Close Template Modal
      </button>

      {/* Children that receive modal state */}
      <ModalTestChild
        showModal={showDeleteChartModal}
        pendingId={pendingDeleteChartId}
        spy={childSpy}
      />
    </div>
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('DashboardSurface Modal State - Baseline Performance', () => {
  let parentSpy: RenderSpy
  let childSpy: RenderSpy

  beforeEach(() => {
    parentSpy = createRenderSpy()
    childSpy = createRenderSpy()
  })

  afterEach(() => {
    parentSpy.reset()
    childSpy.reset()
  })

  it('should capture baseline: initial render count', () => {
    render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    /**
     * BASELINE: Initial render
     * Parent: 1 render
     * Child: 1 render
     */
    expect(parentSpy.getRenderCount()).toBe(1)
    expect(childSpy.getRenderCount()).toBe(1)
  })

  it('should capture baseline: render count when opening delete chart modal', async () => {
    const { getByTestId } = render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    parentSpy.reset()
    childSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('open-chart-modal'))
    })

    /**
     * BASELINE: Opening modal
     * handleDeleteChart() sets 2 states:
     * - setPendingDeleteChartId(id)
     * - setShowDeleteChartModal(true)
     *
     * With separate states, Preact should batch these.
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Open Chart Modal: Parent=${parentRenders}, Child=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(1)
  })

  it('should capture baseline: render count when closing delete chart modal', async () => {
    const { getByTestId } = render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Open modal first
    await act(async () => {
      fireEvent.click(getByTestId('open-chart-modal'))
    })

    parentSpy.reset()
    childSpy.reset()

    // Close modal
    await act(async () => {
      fireEvent.click(getByTestId('close-chart-modal'))
    })

    /**
     * BASELINE: Closing modal
     * dismissDeleteChartModal() sets 2 states:
     * - setShowDeleteChartModal(false)
     * - setPendingDeleteChartId(null)
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Close Chart Modal: Parent=${parentRenders}, Child=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    expect(childRenders).toBeGreaterThanOrEqual(1)
  })

  it('should capture baseline: render count when opening delete template modal', async () => {
    const { getByTestId } = render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    parentSpy.reset()
    childSpy.reset()

    await act(async () => {
      fireEvent.click(getByTestId('open-template-modal'))
    })

    /**
     * BASELINE: Opening template modal
     * Similar pattern to chart modal.
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - Open Template Modal: Parent=${parentRenders}, Child=${childRenders}`)

    expect(parentRenders).toBeGreaterThanOrEqual(1)
    // Child doesn't receive template modal state in this test, so it may not re-render
  })

  it('should capture baseline: rapid open/close cycles', async () => {
    const { getByTestId } = render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    parentSpy.reset()
    childSpy.reset()

    // Rapid cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        fireEvent.click(getByTestId('open-chart-modal'))
      })
      await act(async () => {
        fireEvent.click(getByTestId('close-chart-modal'))
      })
    }

    /**
     * BASELINE: 5 open/close cycles
     * With paired state, each cycle requires 2 setState calls on open + 2 on close = 4 per cycle
     * Expected: ~5-10 parent renders (depending on batching), ~5-10 child renders
     */
    const parentRenders = parentSpy.getRenderCount()
    const childRenders = childSpy.getRenderCount()

    console.log(`BASELINE - 5 Open/Close Cycles: Parent=${parentRenders}, Child=${childRenders}`)
    console.log(`BASELINE - Per Cycle: Parent=${parentRenders / 5}, Child=${childRenders / 5}`)

    expect(parentRenders).toBeGreaterThanOrEqual(5)
    expect(childRenders).toBeGreaterThanOrEqual(5)
  })

  it('should verify no stale state: pendingId should be set before modal opens', async () => {
    const { getByTestId, queryByTestId } = render(
      <ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />
    )

    await act(async () => {
      fireEvent.click(getByTestId('open-chart-modal'))
    })

    /**
     * CORRECTNESS CHECK: With paired state, there's a potential bug:
     * If the states don't batch correctly, the modal could briefly open with null pendingId.
     *
     * This test verifies that after click, the child sees both open=true AND id='chart-1'.
     * With useConfirmationModal discriminated union, this bug becomes impossible.
     */
    expect(getByTestId('show').textContent).toBe('open')
    expect(getByTestId('id').textContent).toBe('chart-1')
  })

  it('should verify no stale state: pendingId should be null after modal closes', async () => {
    const { getByTestId } = render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)

    // Open then close
    await act(async () => {
      fireEvent.click(getByTestId('open-chart-modal'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('close-chart-modal'))
    })

    /**
     * CORRECTNESS CHECK: After closing, modal should be closed AND pendingId should be null.
     * With paired state, if close batching fails, we could have show=false but stale id='chart-1'.
     */
    expect(getByTestId('show').textContent).toBe('closed')
    expect(getByTestId('id').textContent).toBe('none')
  })
})

/**
 * BASELINE SUMMARY (captured 2026-02-04):
 *
 * | Operation          | Parent Renders | Child Renders |
 * |--------------------|----------------|---------------|
 * | Initial render     | 1              | 1             |
 * | Open chart modal   | 1              | 1             |
 * | Close chart modal  | 1              | 1             |
 * | Open template modal| 1              | 1             |
 * | 5 open/close cycles| 10             | 10            |
 * | Per cycle          | 2              | 2             |
 *
 * ANALYSIS:
 * - Preact batches the paired setState calls effectively (1 render per action)
 * - 5 cycles = 10 renders (2 per cycle: open + close)
 * - Current render efficiency is optimal
 *
 * VALUE OF OPTIMIZATION:
 * The main benefit of useConfirmationModal is TYPE SAFETY, not render performance:
 * - Discriminated union: impossible to have isOpen=true with null data
 * - Eliminates entire class of bugs (stale ID, mismatched state)
 * - Cleaner API: single hook call vs 4 state declarations
 *
 * Target after optimization:
 * - Maintain same render efficiency (1 render per action)
 * - Add TypeScript-enforced state consistency
 * - Reduce boilerplate (4 lines -> 2 lines per modal)
 */
