"""Complete test of swipe-to-delete including actual deletion"""
from playwright.sync_api import sync_playwright
import time

BUGS_FOUND = []

def log_bug(description, screenshot_name=None):
    BUGS_FOUND.append({'description': description, 'screenshot': screenshot_name})
    print(f"BUG FOUND: {description}")

with sync_playwright() as p:
    iphone = p.devices['iPhone 14 Pro']
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(**iphone, locale='en-US')
    page = context.new_page()

    console_errors = []
    page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

    print("=" * 60)
    print("COMPLETE SWIPE-TO-DELETE TEST")
    print("=" * 60)

    # Navigate and login
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    print("\n[1] Logging in...")
    page.locator('#auth-email').type('mariogj1987@gmail.com', delay=20)
    page.locator('#auth-password').type('Mg123456', delay=20)
    page.locator('.auth-form button[type="submit"]').click()
    time.sleep(3)
    print("   Done")

    # Start workout
    print("\n[2] Starting workout...")
    page.locator('button:has-text("Start Workout")').first.click()
    time.sleep(2)
    print("   Done")

    # Add extra sets so we have something to delete
    print("\n[3] Adding extra sets...")
    add_btn = page.locator('button:has-text("+ Add Set")').first
    add_btn.tap()
    time.sleep(0.3)
    add_btn.tap()
    time.sleep(0.3)

    initial_count = page.locator('.set-row-wrapper').count()
    print(f"   Set count: {initial_count}")

    # Test swipe and delete
    print("\n[4] Testing swipe-to-delete on first exercise...")

    # Get the first set row of first exercise
    first_row = page.locator('.set-row-wrapper').first
    box = first_row.bounding_box()

    if box:
        # Swipe left
        start_x = box['x'] + box['width'] - 20
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 20

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        for i in range(11):
            x = start_x + (end_x - start_x) * i / 10
            page.mouse.move(x, start_y)
            time.sleep(0.02)
        page.mouse.up()
        time.sleep(0.5)

        page.screenshot(path='screenshots/swipe_complete_01_swiped.png', full_page=True)
        print("   Swiped to reveal delete button")

        # Check if swipe-revealed class was added
        first_row_classes = first_row.get_attribute('class')
        if 'swipe-revealed' not in (first_row_classes or ''):
            log_bug("swipe-revealed class not added after swipe", "swipe_complete_01_swiped.png")
        else:
            print("   swipe-revealed class added correctly")

        # Now click the delete button
        delete_btn = page.locator('.btn-remove-set').first
        if delete_btn.is_visible():
            print("   Clicking delete button...")
            delete_btn.click()
            time.sleep(0.5)

            after_delete_count = page.locator('.set-row-wrapper').count()
            print(f"   Set count after delete: {after_delete_count}")

            if after_delete_count != initial_count - 1:
                log_bug(f"Delete did not remove set. Expected {initial_count - 1}, got {after_delete_count}")
            else:
                print("   Set deleted successfully!")

            page.screenshot(path='screenshots/swipe_complete_02_deleted.png', full_page=True)
        else:
            log_bug("Delete button not visible after swipe")

    print("\n[5] Testing cancel swipe (tap elsewhere)...")

    # Swipe another row
    second_row = page.locator('.set-row-wrapper').nth(1)
    box2 = second_row.bounding_box()

    if box2:
        start_x = box2['x'] + box2['width'] - 20
        start_y = box2['y'] + box2['height'] / 2
        end_x = box2['x'] + 20

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        for i in range(11):
            x = start_x + (end_x - start_x) * i / 10
            page.mouse.move(x, start_y)
            time.sleep(0.02)
        page.mouse.up()
        time.sleep(0.3)

        # Check revealed
        classes_before = second_row.get_attribute('class')
        has_revealed = 'swipe-revealed' in (classes_before or '')
        print(f"   Row revealed: {has_revealed}")

        # Tap elsewhere to cancel
        page.locator('.section-title, .app-title').first.click()
        time.sleep(0.3)

        classes_after = second_row.get_attribute('class')
        still_revealed = 'swipe-revealed' in (classes_after or '')
        print(f"   Row still revealed after tap elsewhere: {still_revealed}")

        if still_revealed:
            log_bug("Swipe did not cancel when tapping elsewhere")
        else:
            print("   Swipe cancel works correctly!")

        page.screenshot(path='screenshots/swipe_complete_03_cancelled.png', full_page=True)

    print("\n[6] Testing that single set cannot be deleted...")

    # Find an exercise with only 1 set or reduce to 1
    # First, count sets in first exercise card
    first_exercise = page.locator('.exercise-workout-card').first
    sets_in_first = first_exercise.locator('.set-row-wrapper').count()
    print(f"   Sets in first exercise: {sets_in_first}")

    # Delete sets until only 1 remains
    while sets_in_first > 1:
        row = first_exercise.locator('.set-row-wrapper').first
        box = row.bounding_box()
        if box:
            start_x = box['x'] + box['width'] - 20
            start_y = box['y'] + box['height'] / 2
            end_x = box['x'] + 20

            page.mouse.move(start_x, start_y)
            page.mouse.down()
            for i in range(11):
                x = start_x + (end_x - start_x) * i / 10
                page.mouse.move(x, start_y)
                time.sleep(0.02)
            page.mouse.up()
            time.sleep(0.3)

            delete_btn = first_exercise.locator('.btn-remove-set').first
            if delete_btn.is_visible():
                delete_btn.click()
                time.sleep(0.3)

        sets_in_first = first_exercise.locator('.set-row-wrapper').count()

    print(f"   Reduced to {sets_in_first} set(s)")

    # Try to swipe the last remaining set
    if sets_in_first == 1:
        last_row = first_exercise.locator('.set-row-wrapper').first
        box = last_row.bounding_box()
        if box:
            start_x = box['x'] + box['width'] - 20
            start_y = box['y'] + box['height'] / 2
            end_x = box['x'] + 20

            page.mouse.move(start_x, start_y)
            page.mouse.down()
            for i in range(11):
                x = start_x + (end_x - start_x) * i / 10
                page.mouse.move(x, start_y)
                time.sleep(0.02)
            page.mouse.up()
            time.sleep(0.3)

            # Delete button should NOT be visible for single set
            delete_btn = first_exercise.locator('.btn-remove-set:visible')
            if delete_btn.count() > 0:
                log_bug("Delete button visible for single set (should be hidden)")
            else:
                print("   Single set protection works - delete button not shown")

    page.screenshot(path='screenshots/swipe_complete_04_single_set.png', full_page=True)

    # Cleanup
    context.close()
    browser.close()

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    if console_errors:
        print(f"\nConsole errors: {len(console_errors)}")
        for err in console_errors[:5]:
            print(f"  - {err}")

    print(f"\nBugs found: {len(BUGS_FOUND)}")
    if BUGS_FOUND:
        for i, bug in enumerate(BUGS_FOUND, 1):
            print(f"  {i}. {bug['description']}")
            if bug['screenshot']:
                print(f"     Screenshot: {bug['screenshot']}")
    else:
        print("All tests passed!")
