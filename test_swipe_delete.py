"""
Test script for exercise tracker app - focusing on swipe-to-delete functionality
"""
from playwright.sync_api import sync_playwright
import time

def test_exercise_logging():
    with sync_playwright() as p:
        # Launch browser in non-headless mode to observe the test and use mobile viewport
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 375, 'height': 812},  # iPhone X dimensions
            device_scale_factor=2
        )
        page = context.new_page()

        # Enable console logging
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))

        print("=== Step 1: Navigate to app ===")
        page.goto('http://localhost:8000/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        # Take initial screenshot
        page.screenshot(path='screenshots/01_initial.png', full_page=True)
        print("Screenshot saved: 01_initial.png")

        print("\n=== Step 2: Login ===")
        # Check if we need to login
        if page.locator('input[type="email"]').is_visible():
            page.fill('input[type="email"]', 'mariogj1987@gmail.com')
            page.fill('input[type="password"]', 'Mg123456')
            page.click('button[type="submit"]')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            print("Logged in successfully")
        else:
            print("Already logged in or login form not visible")

        page.screenshot(path='screenshots/02_after_login.png', full_page=True)
        print("Screenshot saved: 02_after_login.png")

        print("\n=== Step 3: Find and start Pull Day workout ===")
        # Wait for dashboard to load
        time.sleep(2)

        # Look for Pull Day template and click Start Workout
        pull_day_visible = page.locator('text=Pull Day').is_visible()
        print(f"Pull Day template visible: {pull_day_visible}")

        if pull_day_visible:
            # Find the Start Workout button for Pull Day
            template_cards = page.locator('.template-card').all()
            print(f"Found {len(template_cards)} template cards")

            for card in template_cards:
                card_text = card.inner_text()
                if 'Pull Day' in card_text:
                    print(f"Found Pull Day card")
                    start_btn = card.locator('button:has-text("Start Workout")')
                    if start_btn.is_visible():
                        start_btn.click()
                        print("Clicked Start Workout")
                        break

        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='screenshots/03_workout_started.png', full_page=True)
        print("Screenshot saved: 03_workout_started.png")

        print("\n=== Step 4: Examine set rows ===")
        # Look for set row wrappers (these handle the swipe)
        set_row_wrappers = page.locator('.set-row-wrapper').all()
        print(f"Found {len(set_row_wrappers)} set row wrappers")

        set_rows = page.locator('.set-row').all()
        print(f"Found {len(set_rows)} set rows")

        # Count delete buttons
        delete_buttons = page.locator('.btn-remove-set').all()
        print(f"Found {len(delete_buttons)} delete buttons")

        print("\n=== Step 5: Test swipe-to-delete on first set ===")
        if len(set_row_wrappers) > 0:
            first_wrapper = set_row_wrappers[0]
            first_set_row = first_wrapper.locator('.set-row')
            box = first_wrapper.bounding_box()
            print(f"First set row wrapper bounding box: {box}")

            if box:
                # Perform swipe gesture (drag from right to left)
                start_x = box['x'] + box['width'] - 20
                start_y = box['y'] + box['height'] / 2
                end_x = box['x'] + 50  # Swipe left by ~270px
                end_y = start_y

                print(f"Swiping from ({start_x}, {start_y}) to ({end_x}, {end_y})")

                # Perform swipe using mouse events
                page.mouse.move(start_x, start_y)
                page.mouse.down()
                # Move in small steps to simulate real swipe
                steps = 15
                for i in range(steps):
                    current_x = start_x + (end_x - start_x) * (i + 1) / steps
                    page.mouse.move(current_x, start_y)
                    time.sleep(0.02)
                time.sleep(0.3)
                page.mouse.up()

                time.sleep(0.5)
                page.screenshot(path='screenshots/04_after_swipe.png', full_page=True)
                print("Screenshot saved: 04_after_swipe.png")

                # Check if swipe-revealed class was added
                has_revealed_class = first_wrapper.evaluate('el => el.classList.contains("swipe-revealed")')
                print(f"Has 'swipe-revealed' class: {has_revealed_class}")

                # Check if delete button is visible
                delete_btn = first_wrapper.locator('.btn-remove-set')
                delete_visible = delete_btn.is_visible()
                print(f"Delete button visible after swipe: {delete_visible}")

                if delete_visible:
                    print("SUCCESS: Red X delete button appeared after swipe!")

                    # Count sets before deletion
                    sets_before = len(page.locator('.set-row').all())
                    print(f"\nSets before deletion: {sets_before}")

                    # Click delete button
                    print("\n=== Step 6: Click delete button ===")
                    delete_btn.click()
                    time.sleep(1)

                    page.screenshot(path='screenshots/05_after_delete.png', full_page=True)
                    print("Screenshot saved: 05_after_delete.png")

                    # Check sets after deletion
                    sets_after = len(page.locator('.set-row').all())
                    print(f"Sets after deletion: {sets_after}")

                    if sets_after < sets_before:
                        print("SUCCESS: Set was deleted!")
                    else:
                        print("BUG: Set count didn't change after clicking delete")

                    # Check if any delete button is still visible (check for the BUG)
                    time.sleep(0.5)

                    # Check all set-row-wrapper elements for swipe-revealed class
                    revealed_wrappers = page.locator('.set-row-wrapper.swipe-revealed').all()
                    print(f"\nWrappers with 'swipe-revealed' class after deletion: {len(revealed_wrappers)}")

                    # Check if any delete button is still visible
                    visible_delete_btns = [btn for btn in page.locator('.btn-remove-set').all()
                                           if btn.is_visible()]
                    print(f"Visible delete buttons after deletion: {len(visible_delete_btns)}")

                    if len(revealed_wrappers) > 0 or len(visible_delete_btns) > 0:
                        print("\n*** BUG DETECTED: Red X button is still visible after deletion! ***")
                        print("The swipe-revealed state is not being cleared after deleting a set.")

                        # Take a detailed screenshot
                        page.screenshot(path='screenshots/05b_bug_visible_delete.png', full_page=True)
                        print("Screenshot saved: 05b_bug_visible_delete.png")
                    else:
                        print("\nSUCCESS: Delete button properly disappeared after deletion")

                else:
                    print("WARNING: Delete button not visible after swipe - checking CSS transform")
                    # Check the transform value
                    transform = first_set_row.evaluate('el => el.style.transform')
                    print(f"Set row transform: {transform}")
        else:
            print("No set row wrappers found")

        print("\n=== Step 7: Test swiping a different row ===")
        # Get updated list of set rows
        set_row_wrappers = page.locator('.set-row-wrapper').all()
        if len(set_row_wrappers) > 1:
            second_wrapper = set_row_wrappers[1]
            box = second_wrapper.bounding_box()

            if box:
                # Swipe the second row
                start_x = box['x'] + box['width'] - 20
                start_y = box['y'] + box['height'] / 2
                end_x = box['x'] + 50

                page.mouse.move(start_x, start_y)
                page.mouse.down()
                for i in range(15):
                    current_x = start_x + (end_x - start_x) * (i + 1) / 15
                    page.mouse.move(current_x, start_y)
                    time.sleep(0.02)
                time.sleep(0.3)
                page.mouse.up()

                time.sleep(0.5)
                page.screenshot(path='screenshots/06_second_swipe.png', full_page=True)
                print("Screenshot saved: 06_second_swipe.png")

                # Check revealed wrappers - should only be one
                revealed_wrappers = page.locator('.set-row-wrapper.swipe-revealed').all()
                print(f"Wrappers with 'swipe-revealed' after second swipe: {len(revealed_wrappers)}")

                if len(revealed_wrappers) > 1:
                    print("*** BUG: Multiple rows have swipe-revealed state! ***")
                elif len(revealed_wrappers) == 1:
                    print("SUCCESS: Only one row has swipe-revealed state")

        print("\n=== Step 8: Final state ===")
        page.screenshot(path='screenshots/07_final.png', full_page=True)
        print("Screenshot saved: 07_final.png")

        # Keep browser open for manual inspection
        print("\n=== Test complete. Keeping browser open for 5 seconds ===")
        time.sleep(5)

        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('screenshots', exist_ok=True)
    test_exercise_logging()
