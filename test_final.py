"""
Final verification test - uses dispatch_event which works correctly
"""
from playwright.sync_api import sync_playwright
import time

def test_final():
    with sync_playwright() as p:
        # Use mobile device
        iphone = p.devices['iPhone 12']
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(**iphone)
        page = context.new_page()

        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))

        print("=== Test: Swipe-to-Delete Bug Fix Verification ===\n")

        # Login
        page.goto('http://localhost:8000/?t=' + str(int(time.time())))
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
            print("[OK] Logged in")

        # Start workout
        for card in page.locator('.template-card').all():
            if 'Pull Day' in card.inner_text():
                card.locator('button:has-text("Start Workout")').click()
                break
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        print("[OK] Started Pull Day workout")

        # Test 1: Swipe reveals delete button
        print("\n--- Test 1: Swipe to reveal delete button ---")
        initial_sets = len(page.locator('.set-row').all())
        print(f"Initial sets: {initial_sets}")

        first_wrapper = page.locator('.set-row-wrapper').first
        box = first_wrapper.bounding_box()

        # Simulate swipe using touch events
        start_x = box['x'] + box['width'] - 30
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 50

        page.evaluate(f"""() => {{
            const wrapper = document.querySelector('.set-row-wrapper');

            // Simulate touch start
            wrapper.dispatchEvent(new PointerEvent('pointerdown', {{
                bubbles: true,
                clientX: {start_x},
                clientY: {start_y},
                pointerId: 1
            }}));
        }}""")
        time.sleep(0.05)

        # Move in steps
        steps = 10
        for i in range(steps):
            current_x = start_x + (end_x - start_x) * (i + 1) / steps
            page.evaluate(f"""() => {{
                const wrapper = document.querySelector('.set-row-wrapper');
                wrapper.dispatchEvent(new PointerEvent('pointermove', {{
                    bubbles: true,
                    clientX: {current_x},
                    clientY: {start_y},
                    pointerId: 1
                }}));
            }}""")
            time.sleep(0.02)

        page.evaluate(f"""() => {{
            const wrapper = document.querySelector('.set-row-wrapper');
            wrapper.dispatchEvent(new PointerEvent('pointerup', {{
                bubbles: true,
                clientX: {end_x},
                clientY: {start_y},
                pointerId: 1
            }}));
        }}""")
        time.sleep(0.5)

        is_revealed = first_wrapper.evaluate("el => el.classList.contains('swipe-revealed')")
        delete_visible = first_wrapper.locator('.btn-remove-set').is_visible()

        if is_revealed and delete_visible:
            print("[PASS] Swipe reveals delete button correctly")
        else:
            print(f"[FAIL] Swipe not working: revealed={is_revealed}, visible={delete_visible}")

        page.screenshot(path='screenshots/final_01_after_swipe.png', full_page=True)

        # Test 2: Delete button works
        print("\n--- Test 2: Delete button removes set ---")
        delete_btn = first_wrapper.locator('.btn-remove-set')
        delete_btn.dispatch_event('click')
        time.sleep(0.5)

        final_sets = len(page.locator('.set-row').all())
        if final_sets < initial_sets:
            print(f"[PASS] Set deleted: {initial_sets} -> {final_sets}")
        else:
            print(f"[FAIL] Set not deleted: still {final_sets} sets")

        # Test 3: Delete button disappears after deletion
        print("\n--- Test 3: Delete button disappears after deletion ---")

        # Check for swipe-revealed class
        revealed_count = len(page.locator('.set-row-wrapper.swipe-revealed').all())

        # Check transforms on set rows
        transforms = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.set-row')).map(el => el.style.transform);
        }""")
        non_empty_transforms = [t for t in transforms if t and t != '']

        page.screenshot(path='screenshots/final_02_after_delete.png', full_page=True)

        if revealed_count == 0 and len(non_empty_transforms) == 0:
            print("[PASS] No swipe-revealed states and no lingering transforms")
        else:
            print(f"[FAIL] revealed_count={revealed_count}, non_empty_transforms={non_empty_transforms}")

        # Test 4: Subsequent swipes work correctly
        print("\n--- Test 4: Can swipe another row ---")
        second_wrapper = page.locator('.set-row-wrapper').nth(1)
        box = second_wrapper.bounding_box()

        start_x = box['x'] + box['width'] - 30
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 50

        page.evaluate(f"""() => {{
            const wrapper = document.querySelectorAll('.set-row-wrapper')[1];
            wrapper.dispatchEvent(new PointerEvent('pointerdown', {{
                bubbles: true,
                clientX: {start_x},
                clientY: {start_y},
                pointerId: 1
            }}));
        }}""")
        time.sleep(0.05)

        for i in range(10):
            current_x = start_x + (end_x - start_x) * (i + 1) / 10
            page.evaluate(f"""() => {{
                const wrapper = document.querySelectorAll('.set-row-wrapper')[1];
                wrapper.dispatchEvent(new PointerEvent('pointermove', {{
                    bubbles: true,
                    clientX: {current_x},
                    clientY: {start_y},
                    pointerId: 1
                }}));
            }}""")
            time.sleep(0.02)

        page.evaluate(f"""() => {{
            const wrapper = document.querySelectorAll('.set-row-wrapper')[1];
            wrapper.dispatchEvent(new PointerEvent('pointerup', {{
                bubbles: true,
                clientX: {end_x},
                clientY: {start_y},
                pointerId: 1
            }}));
        }}""")
        time.sleep(0.5)

        revealed_after = len(page.locator('.set-row-wrapper.swipe-revealed').all())
        if revealed_after == 1:
            print("[PASS] Can swipe another row (exactly 1 revealed)")
        else:
            print(f"[FAIL] Wrong number of revealed rows: {revealed_after}")

        page.screenshot(path='screenshots/final_03_second_swipe.png', full_page=True)

        print("\n=== Test Complete ===")
        time.sleep(5)
        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    test_final()
