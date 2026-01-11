"""Final test of swipe-to-delete with debugging"""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    iphone = p.devices['iPhone 14 Pro']
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(**iphone)
    page = context.new_page()

    # Track console messages
    console_msgs = []
    page.on('console', lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))

    print("=" * 60)
    print("FINAL SWIPE-TO-DELETE TEST")
    print("=" * 60)

    # Navigate and login
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    page.locator('#auth-email').type('mariogj1987@gmail.com', delay=20)
    page.locator('#auth-password').type('Mg123456', delay=20)
    page.locator('.auth-form button[type="submit"]').click()
    time.sleep(3)

    # Start workout
    page.locator('button:has-text("Start Workout")').first.click()
    time.sleep(2)

    initial_count = page.locator('.set-row-wrapper').count()
    print(f"\n1. Initial set count: {initial_count}")

    # Take initial screenshot
    page.screenshot(path='screenshots/swipe_final_01_initial.png', full_page=True)

    # Perform swipe using JavaScript touch events
    print("\n2. Performing swipe gesture...")

    swipe_result = page.evaluate('''() => {
        const wrapper = document.querySelector('.set-row-wrapper');
        if (!wrapper) return { error: 'No wrapper found' };

        const rect = wrapper.getBoundingClientRect();
        const startX = rect.right - 30;
        const startY = rect.top + rect.height / 2;
        const endX = rect.left + 30;

        // Create and dispatch touch events
        function createTouch(x, y) {
            return new Touch({
                identifier: Date.now(),
                target: wrapper,
                clientX: x,
                clientY: y,
                radiusX: 2.5,
                radiusY: 2.5,
                rotationAngle: 0,
                force: 0.5,
            });
        }

        function createTouchEvent(type, x, y) {
            const touch = createTouch(x, y);
            return new TouchEvent(type, {
                cancelable: true,
                bubbles: true,
                touches: type === 'touchend' ? [] : [touch],
                targetTouches: type === 'touchend' ? [] : [touch],
                changedTouches: [touch],
            });
        }

        // Dispatch touchstart
        wrapper.dispatchEvent(createTouchEvent('touchstart', startX, startY));

        // Dispatch touchmove events
        const steps = 15;
        for (let i = 0; i <= steps; i++) {
            const x = startX + (endX - startX) * i / steps;
            wrapper.dispatchEvent(createTouchEvent('touchmove', x, startY));
        }

        // Dispatch touchend
        wrapper.dispatchEvent(createTouchEvent('touchend', endX, startY));

        // Get the set-row transform
        const setRow = wrapper.querySelector('.set-row');
        const transform = setRow ? setRow.style.transform : 'none';

        return {
            classes: wrapper.className,
            hasSwipeRevealed: wrapper.classList.contains('swipe-revealed'),
            transform: transform
        };
    }''')

    print(f"   Swipe result: {swipe_result}")

    time.sleep(0.5)
    page.screenshot(path='screenshots/swipe_final_02_swiped.png', full_page=True)
    print("   Screenshot saved: swipe_final_02_swiped.png")

    # Check delete button state
    print("\n3. Checking delete button...")

    btn_info = page.evaluate('''() => {
        const btn = document.querySelector('.btn-remove-set');
        if (!btn) return { error: 'No button found' };

        const style = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();

        return {
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
            display: style.display,
            visibility: style.visibility,
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y
        };
    }''')
    print(f"   Button info: {btn_info}")

    # Try clicking the delete button directly via JavaScript
    print("\n4. Clicking delete button via JavaScript...")

    click_result = page.evaluate('''() => {
        const btn = document.querySelector('.set-row-wrapper.swipe-revealed .btn-remove-set');
        if (!btn) {
            // Try first visible button
            const allBtns = document.querySelectorAll('.btn-remove-set');
            for (const b of allBtns) {
                const style = window.getComputedStyle(b);
                if (style.opacity !== '0' && style.pointerEvents !== 'none') {
                    b.click();
                    return { clicked: true, method: 'visible button' };
                }
            }
            return { error: 'No clickable button found' };
        }
        btn.click();
        return { clicked: true, method: 'swipe-revealed button' };
    }''')
    print(f"   Click result: {click_result}")

    time.sleep(0.5)

    after_count = page.locator('.set-row-wrapper').count()
    print(f"\n5. Set count after click: {after_count}")

    if after_count < initial_count:
        print("   SUCCESS: Set was deleted!")
    else:
        print("   Set not deleted - checking why...")

        # Check if Alpine is preventing the action
        alpine_check = page.evaluate('''() => {
            const wrapper = document.querySelector('.set-row-wrapper');
            const exercise = wrapper?.closest('.exercise-workout-card');
            const setsCount = exercise?.querySelectorAll('.set-row-wrapper').length;
            return { setsInExercise: setsCount };
        }''')
        print(f"   Alpine check: {alpine_check}")

    page.screenshot(path='screenshots/swipe_final_03_after_click.png', full_page=True)
    print("\n   Screenshot saved: swipe_final_03_after_click.png")

    # Print any console errors
    errors = [m for m in console_msgs if '[error]' in m.lower()]
    if errors:
        print(f"\n   Console errors: {errors}")

    browser.close()
