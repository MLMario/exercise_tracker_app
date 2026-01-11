"""Test the complete workout flow with per-set tracking"""
from playwright.sync_api import sync_playwright
import time

BUGS_FOUND = []

def log_bug(description, screenshot_name=None):
    """Log a bug found during testing"""
    BUGS_FOUND.append({
        'description': description,
        'screenshot': screenshot_name
    })
    print(f"BUG FOUND: {description}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Enable console logging for errors
    errors = []
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)

    # Navigate to the app
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    print("=" * 60)
    print("STEP 1: LOGIN")
    print("=" * 60)

    # Login
    email_input = page.locator('#auth-email')
    password_input = page.locator('#auth-password')

    email_input.click()
    email_input.type('mariogj1987@gmail.com', delay=30)
    password_input.click()
    password_input.type('Mg123456', delay=30)

    page.locator('.auth-form button[type="submit"]').click()
    time.sleep(3)
    page.wait_for_load_state('networkidle')

    # Verify login
    logout_btn = page.locator('button:has-text("Logout"):visible')
    if logout_btn.count() > 0:
        print("Login successful!")
    else:
        print("ERROR: Login failed")
        page.screenshot(path='screenshots/error_login_failed.png', full_page=True)
        browser.close()
        exit(1)

    print("\n" + "=" * 60)
    print("STEP 2: START WORKOUT FROM TEMPLATE")
    print("=" * 60)

    # Look for Start Workout button
    start_workout_btn = page.locator('button:has-text("Start Workout")').first
    if start_workout_btn.count() > 0:
        print("Found 'Start Workout' button, clicking...")
        start_workout_btn.click()
        time.sleep(2)
        page.wait_for_load_state('networkidle')
    else:
        log_bug("No 'Start Workout' button found on dashboard")

    # Take screenshot of workout view
    page.screenshot(path='screenshots/04_workout_started.png', full_page=True)
    print("Screenshot saved: screenshots/04_workout_started.png")

    print("\n" + "=" * 60)
    print("STEP 3: VERIFY PER-SET UI STRUCTURE")
    print("=" * 60)

    # Check for exercise cards
    exercise_cards = page.locator('.exercise-workout-card')
    exercise_count = exercise_cards.count()
    print(f"Found {exercise_count} exercise card(s)")

    if exercise_count == 0:
        log_bug("No exercise cards found in workout view", "04_workout_started.png")
    else:
        # Check for set rows
        set_rows = page.locator('.set-row')
        set_count = set_rows.count()
        print(f"Found {set_count} set row(s)")

        # Check for set header columns
        set_header = page.locator('.set-header')
        if set_header.count() > 0:
            header_text = set_header.first.inner_text()
            print(f"Set header: {header_text}")
            if 'Set' not in header_text or 'lbs' not in header_text or 'Reps' not in header_text:
                log_bug("Set header missing expected columns (Set, lbs, Reps)")

        # Check for Add Set button
        add_set_btns = page.locator('button:has-text("+ Add Set")')
        print(f"Found {add_set_btns.count()} 'Add Set' button(s)")

        if add_set_btns.count() == 0:
            log_bug("No '+ Add Set' button found")

    print("\n" + "=" * 60)
    print("STEP 4: TEST EDITING WEIGHT/REPS FOR DIFFERENT SETS")
    print("=" * 60)

    # Get all set inputs
    weight_inputs = page.locator('.set-row .set-input').nth(0)  # First weight input
    reps_inputs = page.locator('.set-row .set-input').nth(1)    # First reps input

    if page.locator('.set-row').count() > 0:
        # Edit first set - weight
        try:
            first_weight = page.locator('.set-row').first.locator('.set-input').first
            first_weight.click()
            first_weight.fill('135')
            print("Set weight to 135 for first set")

            # Edit first set - reps
            first_reps = page.locator('.set-row').first.locator('.set-input').nth(1)
            first_reps.click()
            first_reps.fill('10')
            print("Set reps to 10 for first set")

            # Check if there's a second set and edit it differently
            if page.locator('.set-row').count() > 1:
                second_weight = page.locator('.set-row').nth(1).locator('.set-input').first
                second_weight.click()
                second_weight.fill('145')
                print("Set weight to 145 for second set")

                second_reps = page.locator('.set-row').nth(1).locator('.set-input').nth(1)
                second_reps.click()
                second_reps.fill('8')
                print("Set reps to 8 for second set")

            page.screenshot(path='screenshots/05_edited_sets.png', full_page=True)
            print("Screenshot saved: screenshots/05_edited_sets.png")

        except Exception as e:
            log_bug(f"Error editing set inputs: {e}")

    print("\n" + "=" * 60)
    print("STEP 5: TEST CHECKMARK BUTTON (MARK SET AS DONE)")
    print("=" * 60)

    # Find checkbox buttons
    checkbox_btns = page.locator('.checkbox-btn')
    print(f"Found {checkbox_btns.count()} checkbox button(s)")

    if checkbox_btns.count() > 0:
        # Click first checkbox to mark set as done
        first_checkbox = checkbox_btns.first
        print("Clicking first checkbox to mark set as done...")
        first_checkbox.click()
        time.sleep(1)

        # Check if it has 'checked' class
        has_checked_class = 'checked' in (first_checkbox.get_attribute('class') or '')
        print(f"Checkbox has 'checked' class: {has_checked_class}")

        if not has_checked_class:
            log_bug("Checkbox did not get 'checked' class after clicking")

        # Take screenshot
        page.screenshot(path='screenshots/06_set_marked_done.png', full_page=True)
        print("Screenshot saved: screenshots/06_set_marked_done.png")
    else:
        log_bug("No checkbox buttons found for marking sets as done")

    print("\n" + "=" * 60)
    print("STEP 6: TEST REST TIMER (should start after marking set done)")
    print("=" * 60)

    # Check if timer is active
    timer_section = page.locator('.timer-section:visible')
    time.sleep(1)  # Give timer a moment to appear

    if timer_section.count() > 0:
        timer_display = page.locator('.timer-display')
        if timer_display.count() > 0:
            timer_text = timer_display.inner_text()
            print(f"Timer display: {timer_text}")
            page.screenshot(path='screenshots/07_timer_active.png', full_page=True)
            print("Screenshot saved: screenshots/07_timer_active.png")
        else:
            log_bug("Timer section visible but no timer display found")
    else:
        log_bug("Rest timer did not appear after marking set as done", "06_set_marked_done.png")

    print("\n" + "=" * 60)
    print("STEP 7: TEST ADD SET FUNCTIONALITY")
    print("=" * 60)

    # Count current sets
    initial_set_count = page.locator('.set-row').count()
    print(f"Initial set count: {initial_set_count}")

    # Click Add Set button
    add_set_btn = page.locator('button:has-text("+ Add Set")').first
    if add_set_btn.count() > 0:
        add_set_btn.click()
        time.sleep(0.5)

        new_set_count = page.locator('.set-row').count()
        print(f"Set count after adding: {new_set_count}")

        if new_set_count != initial_set_count + 1:
            log_bug(f"Add Set did not increase set count. Expected {initial_set_count + 1}, got {new_set_count}")

        # Check if new set has values copied from last set
        if new_set_count > initial_set_count:
            last_set = page.locator('.set-row').last
            last_weight_input = last_set.locator('.set-input').first
            last_weight_value = last_weight_input.input_value()
            print(f"New set weight value: {last_weight_value}")

        page.screenshot(path='screenshots/08_set_added.png', full_page=True)
        print("Screenshot saved: screenshots/08_set_added.png")
    else:
        log_bug("Could not find Add Set button to test")

    print("\n" + "=" * 60)
    print("STEP 8: TEST REMOVE SET FUNCTIONALITY")
    print("=" * 60)

    # Look for remove set button (the red X that appears on hover)
    current_set_count = page.locator('.set-row').count()
    print(f"Current set count before removal: {current_set_count}")

    if current_set_count > 1:
        # Find the remove button - it should be .btn-remove-set
        remove_btns = page.locator('.btn-remove-set')
        print(f"Found {remove_btns.count()} remove buttons")

        if remove_btns.count() > 0:
            # Hover over a set row to make the X visible
            set_row_wrapper = page.locator('.set-row-wrapper').first
            set_row_wrapper.hover()
            time.sleep(0.3)

            # Take screenshot showing the hover state
            page.screenshot(path='screenshots/09_hover_remove.png', full_page=True)
            print("Screenshot saved: screenshots/09_hover_remove.png")

            # Click remove on the first removable set
            visible_remove_btn = page.locator('.btn-remove-set:visible').first
            if visible_remove_btn.count() > 0:
                visible_remove_btn.click()
                time.sleep(0.5)

                after_remove_count = page.locator('.set-row').count()
                print(f"Set count after removal: {after_remove_count}")

                if after_remove_count != current_set_count - 1:
                    log_bug(f"Remove set did not decrease count. Expected {current_set_count - 1}, got {after_remove_count}")

                page.screenshot(path='screenshots/10_set_removed.png', full_page=True)
            else:
                log_bug("Remove button not visible even after hover")
        else:
            log_bug("No remove set buttons found in DOM")
    else:
        print("Only 1 set - cannot test removal (by design)")

    print("\n" + "=" * 60)
    print("STEP 9: FINISH WORKOUT")
    print("=" * 60)

    # Click Finish Workout button
    finish_btn = page.locator('button:has-text("Finish Workout")')
    if finish_btn.count() > 0:
        print("Clicking 'Finish Workout' button...")
        finish_btn.click()
        time.sleep(2)
        page.wait_for_load_state('networkidle')

        page.screenshot(path='screenshots/11_workout_finished.png', full_page=True)
        print("Screenshot saved: screenshots/11_workout_finished.png")

        # Check if we're back on dashboard
        if page.locator('text="My Templates"').count() > 0:
            print("Successfully returned to dashboard after finishing workout")
        else:
            log_bug("Did not return to dashboard after finishing workout")
    else:
        log_bug("Could not find 'Finish Workout' button")

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    # Check for console errors
    if errors:
        print(f"\nConsole errors during test: {len(errors)}")
        for err in errors[:10]:  # Print first 10 errors
            print(f"  - {err}")

    print(f"\nTotal bugs found: {len(BUGS_FOUND)}")
    if BUGS_FOUND:
        print("\nBUGS:")
        for i, bug in enumerate(BUGS_FOUND, 1):
            print(f"  {i}. {bug['description']}")
            if bug['screenshot']:
                print(f"     Screenshot: {bug['screenshot']}")
    else:
        print("No bugs found!")

    browser.close()
