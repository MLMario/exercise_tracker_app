"""
Debug test script for delete button click - with cache bypass
"""
from playwright.sync_api import sync_playwright
import time

def test_delete():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 375, 'height': 812},
            device_scale_factor=2,
            bypass_csp=True  # Allow some cache bypass
        )
        page = context.new_page()

        # Enable detailed console logging
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))

        print("=== Navigate and Login (with cache bypass) ===")
        # Add timestamp to bypass cache
        page.goto('http://localhost:8000/?t=' + str(int(time.time())))
        page.wait_for_load_state('networkidle')

        # Force reload to ensure fresh JS
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

        print("\n=== Test 1: Get set counts ===")
        set_rows_before = len(page.locator('.set-row').all())
        print(f"Set rows before: {set_rows_before}")

        # Get the set numbers displayed
        set_numbers = page.locator('.set-number').all()
        print(f"Set numbers displayed: {[sn.inner_text() for sn in set_numbers[:5]]}")

        print("\n=== Test 2: Swipe first set row ===")
        first_wrapper = page.locator('.set-row-wrapper').first
        box = first_wrapper.bounding_box()

        # Swipe
        start_x = box['x'] + box['width'] - 20
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 50

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        for i in range(15):
            current_x = start_x + (end_x - start_x) * (i + 1) / 15
            page.mouse.move(current_x, start_y)
            time.sleep(0.02)
        time.sleep(0.2)
        page.mouse.up()
        time.sleep(0.5)

        # Check state
        is_revealed = first_wrapper.evaluate("el => el.classList.contains('swipe-revealed')")
        print(f"Swipe revealed: {is_revealed}")

        page.screenshot(path='screenshots/debug_01_swiped.png', full_page=True)

        print("\n=== Test 3: Click delete button via dispatch ===")
        delete_btn = first_wrapper.locator('.btn-remove-set')
        is_visible = delete_btn.is_visible()
        print(f"Delete button visible: {is_visible}")

        if is_visible:
            sets_before = len(page.locator('.set-row').all())
            print(f"Sets before delete: {sets_before}")

            # Dispatch click to trigger the delete
            delete_btn.dispatch_event('click')
            time.sleep(1)

            sets_after = len(page.locator('.set-row').all())
            print(f"Sets after delete: {sets_after}")

            page.screenshot(path='screenshots/debug_02_after_delete.png', full_page=True)

            # Check transforms
            first_set_row = page.locator('.set-row').first
            transform = first_set_row.evaluate("el => el.style.transform")
            print(f"First set row transform after delete: '{transform}'")

            # Check visible delete buttons
            visible_delete_btns = []
            for btn in page.locator('.btn-remove-set').all():
                try:
                    if btn.is_visible():
                        visible_delete_btns.append(btn)
                except:
                    pass
            print(f"Visible delete buttons after delete: {len(visible_delete_btns)}")

            # Check if any swipe-revealed wrappers exist
            revealed = page.locator('.set-row-wrapper.swipe-revealed').all()
            print(f"Swipe-revealed wrappers: {len(revealed)}")

            if len(visible_delete_btns) > 0:
                print("\n*** BUG STILL EXISTS: Delete buttons visible after deletion ***")

                # Check what's causing visibility
                for i, btn in enumerate(visible_delete_btns[:3]):
                    opacity = btn.evaluate("el => getComputedStyle(el).opacity")
                    pointer = btn.evaluate("el => getComputedStyle(el).pointerEvents")
                    parent_hover = btn.evaluate("el => el.closest('.set-row-wrapper').matches(':hover')")
                    print(f"Button {i}: opacity={opacity}, pointer={pointer}, parent_hover={parent_hover}")
            else:
                print("\n*** SUCCESS: No delete buttons visible after deletion! ***")

        print("\n=== Final state ===")
        set_numbers_after = page.locator('.set-number').all()
        print(f"Set numbers displayed after: {[sn.inner_text() for sn in set_numbers_after[:5]]}")

        page.screenshot(path='screenshots/debug_03_final.png', full_page=True)

        print("\n=== Done ===")
        time.sleep(5)
        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    test_delete()
