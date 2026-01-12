# -*- coding: utf-8 -*-
"""
Comprehensive Mobile Testing for Workout Page
Tests the workout logging surface with simulated data
"""
from playwright.sync_api import sync_playwright
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

screenshots_dir = os.path.join(os.path.dirname(__file__), 'screenshots', 'mobile_test')
os.makedirs(screenshots_dir, exist_ok=True)

def test_workout_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
        )
        page = context.new_page()

        # Navigate to app
        page.goto('http://localhost:8000')
        page.wait_for_load_state('networkidle')

        print("=== WORKOUT PAGE MOBILE TESTING ===\n")

        # Inject test state to show workout surface
        # This simulates an active workout without needing to log in
        page.evaluate("""
        () => {
            // Wait for Alpine to initialize
            const app = document.querySelector('[x-data="fitnessApp"]');
            if (app && app._x_dataStack && app._x_dataStack[0]) {
                const state = app._x_dataStack[0];

                // Set user (mock)
                state.user = { id: 'test-user-123', email: 'test@example.com' };
                state.isLoading = false;
                state.currentSurface = 'workout';

                // Set active workout with test data
                state.activeWorkout = {
                    template_id: 'test-template-1',
                    template_name: 'Test Upper Body',
                    started_at: new Date().toISOString(),
                    exercises: [
                        {
                            exercise_id: 'ex-1',
                            name: 'Bench Press',
                            category: 'Chest',
                            order: 0,
                            rest_seconds: 90,
                            sets: [
                                { set_number: 1, weight: 135, reps: 10, is_done: true },
                                { set_number: 2, weight: 135, reps: 10, is_done: false },
                                { set_number: 3, weight: 135, reps: 10, is_done: false }
                            ]
                        },
                        {
                            exercise_id: 'ex-2',
                            name: 'Incline Dumbbell Press',
                            category: 'Chest',
                            order: 1,
                            rest_seconds: 60,
                            sets: [
                                { set_number: 1, weight: 50, reps: 12, is_done: false },
                                { set_number: 2, weight: 50, reps: 12, is_done: false }
                            ]
                        },
                        {
                            exercise_id: 'ex-3',
                            name: 'Barbell Overhead Press',
                            category: 'Shoulders',
                            order: 2,
                            rest_seconds: 90,
                            sets: [
                                { set_number: 1, weight: 95, reps: 8, is_done: false },
                                { set_number: 2, weight: 95, reps: 8, is_done: false },
                                { set_number: 3, weight: 95, reps: 8, is_done: false },
                                { set_number: 4, weight: 95, reps: 8, is_done: false }
                            ]
                        }
                    ]
                };
            }
        }
        """)

        # Wait for Alpine to re-render
        page.wait_for_timeout(500)

        # Take screenshot of workout page
        page.screenshot(path=f'{screenshots_dir}/02_workout_page_mobile.png', full_page=True)
        print("1. Workout Page Screenshot - Captured")

        # Check if workout surface is visible
        workout_surface = page.locator('.workout-surface')
        if workout_surface.is_visible():
            print("   - Workout surface visible: OK")
        else:
            print("   - BUG: Workout surface NOT visible")
            browser.close()
            return

        # 2. Test Header Elements
        print("\n2. Header Elements:")
        workout_header = page.locator('.workout-header')
        if workout_header.is_visible():
            box = workout_header.bounding_box()
            print(f"   - Header visible: OK ({box['width']}x{box['height']}px)")

        # Check Cancel button
        cancel_btn = page.locator('.workout-header .btn-secondary')
        if cancel_btn.is_visible():
            box = cancel_btn.bounding_box()
            if box['height'] >= 36:  # btn-sm has min-height 36px
                print(f"   - Cancel button: {box['width']}x{box['height']}px (OK)")
            else:
                print(f"   - BUG: Cancel button too small: {box['height']}px")

        # Check Finish button
        finish_btn = page.locator('.workout-header .btn-primary')
        if finish_btn.is_visible():
            box = finish_btn.bounding_box()
            if box['height'] >= 36:
                print(f"   - Finish button: {box['width']}x{box['height']}px (OK)")
            else:
                print(f"   - BUG: Finish button too small: {box['height']}px")

        # 3. Test Exercise Cards
        print("\n3. Exercise Cards:")
        exercise_cards = page.locator('.exercise-workout-card')
        card_count = exercise_cards.count()
        print(f"   - Exercise cards found: {card_count}")

        if card_count > 0:
            first_card = exercise_cards.first
            first_card.scroll_into_view_if_needed()
            box = first_card.bounding_box()
            if box:
                print(f"   - First card dimensions: {box['width']}x{box['height']}px")

        # 4. Test Set Inputs
        print("\n4. Set Input Analysis:")
        set_inputs = page.locator('.set-input')
        input_count = set_inputs.count()
        print(f"   - Set inputs found: {input_count}")

        issues_found = []
        for i in range(min(3, input_count)):  # Test first 3
            input_el = set_inputs.nth(i)
            if input_el.is_visible():
                box = input_el.bounding_box()
                if box:
                    if box['height'] >= 44:
                        print(f"     Input {i+1}: {box['height']}px height (OK)")
                    else:
                        print(f"     BUG: Input {i+1}: {box['height']}px height (FAIL, <44px)")
                        issues_found.append(f"Set input {i+1} height: {box['height']}px")

        # 5. Test Checkbox Buttons
        print("\n5. Checkbox Button Analysis:")
        checkboxes = page.locator('.checkbox-btn')
        checkbox_count = checkboxes.count()
        print(f"   - Checkbox buttons found: {checkbox_count}")

        for i in range(min(3, checkbox_count)):
            checkbox = checkboxes.nth(i)
            if checkbox.is_visible():
                box = checkbox.bounding_box()
                if box:
                    if box['width'] >= 44 and box['height'] >= 44:
                        print(f"     Checkbox {i+1}: {box['width']}x{box['height']}px (OK)")
                    else:
                        print(f"     BUG: Checkbox {i+1}: {box['width']}x{box['height']}px (FAIL)")
                        issues_found.append(f"Checkbox {i+1}: {box['width']}x{box['height']}px")

        # 6. Test Rest Timer Bar
        print("\n6. Rest Timer Bar Analysis:")
        timer_bars = page.locator('.rest-timer-bar-container')
        timer_count = timer_bars.count()
        print(f"   - Timer bar containers found: {timer_count}")

        # Check timer adjust buttons
        timer_adjust_btns = page.locator('.btn-timer-adjust')
        adjust_count = timer_adjust_btns.count()
        print(f"   - Timer adjust buttons found: {adjust_count}")

        if adjust_count > 0:
            first_adjust = timer_adjust_btns.first
            if first_adjust.is_visible():
                box = first_adjust.bounding_box()
                if box:
                    # These are small buttons, but should still be tappable
                    print(f"     First adjust button: {box['width']}x{box['height']}px")
                    if box['height'] < 30:
                        print(f"     WARNING: Timer adjust buttons may be hard to tap")

        # 7. Test Add Set Button
        print("\n7. Add Set Button Analysis:")
        add_set_btns = page.locator('.btn-add-set')
        add_set_count = add_set_btns.count()
        print(f"   - Add Set buttons found: {add_set_count}")

        if add_set_count > 0:
            first_add_set = add_set_btns.first
            if first_add_set.is_visible():
                box = first_add_set.bounding_box()
                if box:
                    if box['height'] >= 36:
                        print(f"     Add Set button: {box['width']}x{box['height']}px (OK)")
                    else:
                        print(f"     BUG: Add Set button too small: {box['height']}px")

        # 8. Test Add Exercise Button
        print("\n8. Add Exercise Button:")
        add_exercise_btn = page.locator('.workout-footer .btn-block')
        if add_exercise_btn.is_visible():
            box = add_exercise_btn.bounding_box()
            if box:
                if box['height'] >= 44:
                    print(f"   - Add Exercise button: {box['width']}x{box['height']}px (OK)")
                else:
                    print(f"   - BUG: Add Exercise button: {box['height']}px (FAIL)")

        # 9. Check for horizontal overflow
        print("\n9. Layout Overflow Check:")
        body_width = page.evaluate('document.body.scrollWidth')
        viewport_width = page.evaluate('window.innerWidth')
        if body_width <= viewport_width:
            print(f"   - No horizontal overflow (OK)")
        else:
            print(f"   - BUG: Horizontal overflow: {body_width}px > {viewport_width}px")
            issues_found.append(f"Horizontal overflow: {body_width}px")

        # 10. Test Swipe Gesture (simulate)
        print("\n10. Swipe-to-Delete Test:")
        set_wrappers = page.locator('.set-row-wrapper')
        wrapper_count = set_wrappers.count()
        print(f"    - Set row wrappers found: {wrapper_count}")

        if wrapper_count > 0:
            # Get the first set row wrapper
            first_wrapper = set_wrappers.first
            if first_wrapper.is_visible():
                box = first_wrapper.bounding_box()
                if box:
                    # Simulate swipe left
                    start_x = box['x'] + box['width'] - 50
                    start_y = box['y'] + box['height'] / 2

                    # Perform swipe gesture
                    page.mouse.move(start_x, start_y)
                    page.mouse.down()
                    page.mouse.move(start_x - 80, start_y, steps=10)
                    page.mouse.up()

                    page.wait_for_timeout(300)

                    # Check if delete button is revealed
                    delete_btn = page.locator('.btn-remove-set').first
                    if delete_btn.is_visible():
                        print("    - Swipe revealed delete button: OK")
                    else:
                        # Check if wrapper has swipe-revealed class
                        has_class = first_wrapper.evaluate('el => el.classList.contains("swipe-revealed")')
                        if has_class:
                            print("    - Swipe-revealed class added: OK")
                        else:
                            print("    - WARNING: Swipe may not be working properly")

        # Take final screenshot
        page.screenshot(path=f'{screenshots_dir}/03_workout_page_tested.png', full_page=True)

        # Summary
        print("\n" + "="*50)
        print("SUMMARY")
        print("="*50)
        if issues_found:
            print(f"Issues found: {len(issues_found)}")
            for issue in issues_found:
                print(f"  - {issue}")
        else:
            print("No critical issues found!")

        print("\n=== END WORKOUT PAGE TESTS ===")

        browser.close()

if __name__ == '__main__':
    print("Starting Workout Page Mobile Tests...\n")
    try:
        test_workout_page()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
