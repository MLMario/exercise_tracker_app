"""Test swipe using actual touch events via JavaScript"""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    iphone = p.devices['iPhone 14 Pro']
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(**iphone)
    page = context.new_page()

    print("=" * 60)
    print("TOUCH EVENTS TEST - Dispatching real touch events")
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

    # Get bounding box of first set row
    first_row = page.locator('.set-row-wrapper').first
    box = first_row.bounding_box()

    initial_count = page.locator('.set-row-wrapper').count()
    print(f"Initial set count: {initial_count}")

    if box:
        start_x = box['x'] + box['width'] - 30
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 30

        print(f"\nSimulating touch swipe from ({start_x:.0f}, {start_y:.0f}) to ({end_x:.0f}, {start_y:.0f})")

        # Dispatch actual touch events via JavaScript
        result = page.evaluate('''([startX, startY, endX, endY]) => {
            const wrapper = document.querySelector('.set-row-wrapper');
            if (!wrapper) return { error: 'wrapper not found' };

            // Create touch events
            function createTouchEvent(type, x, y) {
                const touch = new Touch({
                    identifier: Date.now(),
                    target: wrapper,
                    clientX: x,
                    clientY: y,
                    radiusX: 2.5,
                    radiusY: 2.5,
                    rotationAngle: 10,
                    force: 0.5,
                });

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

            // Dispatch touchmove events (simulate swipe)
            const steps = 10;
            for (let i = 0; i <= steps; i++) {
                const x = startX + (endX - startX) * i / steps;
                wrapper.dispatchEvent(createTouchEvent('touchmove', x, startY));
            }

            // Dispatch touchend
            wrapper.dispatchEvent(createTouchEvent('touchend', endX, startY));

            // Check result
            return {
                hasSwipeRevealed: wrapper.classList.contains('swipe-revealed'),
                classes: wrapper.className
            };
        }''', [start_x, start_y, end_x, start_y])

        print(f"Result: {result}")

        if result.get('hasSwipeRevealed'):
            print("SUCCESS: swipe-revealed class was added!")
        else:
            print(f"Classes on wrapper: {result.get('classes')}")

        page.screenshot(path='screenshots/touch_test_result.png', full_page=True)
        print("Screenshot saved: screenshots/touch_test_result.png")

        # Now try clicking the delete button
        time.sleep(0.5)
        delete_btn = page.locator('.btn-remove-set').first
        if delete_btn.is_visible():
            print("\nDelete button is visible - clicking...")
            delete_btn.click()
            time.sleep(0.5)

            after_count = page.locator('.set-row-wrapper').count()
            print(f"Set count after delete: {after_count}")

            if after_count == initial_count - 1:
                print("SUCCESS: Set was deleted!")
            else:
                print("FAILED: Set count unchanged")
        else:
            print("Delete button not visible")

    browser.close()
