"""
Test swipe-to-delete on mobile (touch simulation)
"""
from playwright.sync_api import sync_playwright
import time

def test_mobile_swipe():
    with sync_playwright() as p:
        # Use a mobile device that has touch
        iphone = p.devices['iPhone 12']

        browser = p.chromium.launch(headless=False)
        context = browser.new_context(**iphone)
        page = context.new_page()

        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))

        print("=== Navigate and Login (Mobile) ===")
        page.goto('http://localhost:8000/?mobile=' + str(int(time.time())))
        page.wait_for_load_state('networkidle')
        page.reload()
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        if page.locator('input[type="email"]').is_visible():
            page.fill('input[type="email"]', 'mariogj1987@gmail.com')
            page.fill('input[type="password"]', 'Mg123456')
            page.click('button[type="submit"]')
            page.wait_for_load_state('networkidle')
            time.sleep(2)

        print("=== Start Pull Day Workout ===")
        template_cards = page.locator('.template-card').all()
        for card in template_cards:
            if 'Pull Day' in card.inner_text():
                card.locator('button:has-text("Start Workout")').click()
                break

        page.wait_for_load_state('networkidle')
        time.sleep(2)

        print("\n=== Test 1: Initial state ===")
        set_rows_before = len(page.locator('.set-row').all())
        print(f"Set rows: {set_rows_before}")
        page.screenshot(path='screenshots/mobile_01_initial.png', full_page=True)

        # Check delete button visibility before swipe
        visible_btns = [btn for btn in page.locator('.btn-remove-set').all() if btn.is_visible()]
        print(f"Visible delete buttons (should be 0 on mobile): {len(visible_btns)}")

        print("\n=== Test 2: Swipe using touch ===")
        first_wrapper = page.locator('.set-row-wrapper').first
        box = first_wrapper.bounding_box()

        # Use touchscreen to swipe
        start_x = box['x'] + box['width'] - 30
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 50

        # Perform touch swipe
        page.touchscreen.tap(start_x, start_y)
        time.sleep(0.1)

        # For swipe, we need to use the lower-level CDP or simulate with multiple taps
        # Let's try using mouse with touch flag
        page.evaluate(f"""
            const wrapper = document.querySelector('.set-row-wrapper');
            const startEvent = new TouchEvent('touchstart', {{
                bubbles: true,
                cancelable: true,
                touches: [new Touch({{
                    identifier: 0,
                    target: wrapper,
                    clientX: {start_x},
                    clientY: {start_y}
                }})]
            }});
            wrapper.dispatchEvent(startEvent);
        """)
        time.sleep(0.1)

        # Move
        steps = 10
        for i in range(steps):
            current_x = start_x + (end_x - start_x) * (i + 1) / steps
            page.evaluate(f"""
                const wrapper = document.querySelector('.set-row-wrapper');
                const moveEvent = new TouchEvent('touchmove', {{
                    bubbles: true,
                    cancelable: true,
                    touches: [new Touch({{
                        identifier: 0,
                        target: wrapper,
                        clientX: {current_x},
                        clientY: {start_y}
                    }})]
                }});
                wrapper.dispatchEvent(moveEvent);
            """)
            time.sleep(0.03)

        # End
        page.evaluate(f"""
            const wrapper = document.querySelector('.set-row-wrapper');
            const endEvent = new TouchEvent('touchend', {{
                bubbles: true,
                cancelable: true,
                changedTouches: [new Touch({{
                    identifier: 0,
                    target: wrapper,
                    clientX: {end_x},
                    clientY: {start_y}
                }})]
            }});
            wrapper.dispatchEvent(endEvent);
        """)
        time.sleep(0.5)

        page.screenshot(path='screenshots/mobile_02_after_swipe.png', full_page=True)

        # Check if swipe revealed
        is_revealed = first_wrapper.evaluate("el => el.classList.contains('swipe-revealed')")
        print(f"Swipe revealed: {is_revealed}")

        # Check delete button
        delete_btn = first_wrapper.locator('.btn-remove-set')
        is_visible = delete_btn.is_visible()
        print(f"Delete button visible after swipe: {is_visible}")

        if is_visible:
            print("\n=== Test 3: Click delete ===")
            sets_before = len(page.locator('.set-row').all())
            print(f"Sets before: {sets_before}")

            delete_btn.dispatch_event('click')
            time.sleep(1)

            sets_after = len(page.locator('.set-row').all())
            print(f"Sets after: {sets_after}")

            page.screenshot(path='screenshots/mobile_03_after_delete.png', full_page=True)

            # Check if any delete buttons are visible now
            visible_after = [btn for btn in page.locator('.btn-remove-set').all() if btn.is_visible()]
            print(f"Visible delete buttons after delete: {len(visible_after)}")

            if len(visible_after) == 0:
                print("\n*** SUCCESS: No delete buttons visible after deletion on mobile! ***")
            else:
                print("\n*** BUG: Delete buttons still visible after deletion ***")

        print("\n=== Done ===")
        time.sleep(5)
        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    test_mobile_swipe()
