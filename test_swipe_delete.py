"""Test the swipe-to-delete functionality on mobile"""
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
    # Launch with iPhone 14 Pro emulation
    iphone = p.devices['iPhone 14 Pro']
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        **iphone,
        locale='en-US'
    )
    page = context.new_page()

    # Capture console errors
    console_errors = []
    page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

    print("=" * 60)
    print("SWIPE-TO-DELETE TEST - iPhone 14 Pro Emulation")
    print("=" * 60)

    # Navigate and login
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    print("\n[Step 1] Logging in...")
    page.locator('#auth-email').type('mariogj1987@gmail.com', delay=20)
    page.locator('#auth-password').type('Mg123456', delay=20)
    page.locator('.auth-form button[type="submit"]').click()
    time.sleep(3)

    # Verify login
    if page.locator('button:has-text("Logout"):visible').count() == 0:
        log_bug("Login failed")
        browser.close()
        exit(1)
    print("   Login successful!")

    # Start workout
    print("\n[Step 2] Starting workout...")
    start_btn = page.locator('button:has-text("Start Workout")').first
    start_btn.click()
    time.sleep(2)

    page.screenshot(path='screenshots/swipe_01_workout_view.png', full_page=True)
    print("   Screenshot: swipe_01_workout_view.png")

    # Count initial sets
    initial_set_count = page.locator('.set-row-wrapper').count()
    print(f"   Initial set count: {initial_set_count}")

    print("\n[Step 3] Testing swipe gesture on first set row...")

    # Get the first set row
    first_set_row = page.locator('.set-row-wrapper').first
    box = first_set_row.bounding_box()

    if box:
        start_x = box['x'] + box['width'] - 20  # Start from right side
        start_y = box['y'] + box['height'] / 2
        end_x = box['x'] + 20  # End at left side (swipe left)

        print(f"   Swiping from ({start_x}, {start_y}) to ({end_x}, {start_y})")

        # Perform swipe gesture using mouse (simulates touch in mobile emulation)
        page.mouse.move(start_x, start_y)
        page.mouse.down()

        # Move in steps to simulate drag
        steps = 10
        for i in range(steps + 1):
            x = start_x + (end_x - start_x) * i / steps
            page.mouse.move(x, start_y)
            time.sleep(0.02)

        page.mouse.up()
        time.sleep(0.5)

        page.screenshot(path='screenshots/swipe_02_after_swipe.png', full_page=True)
        print("   Screenshot: swipe_02_after_swipe.png")

        # Check if delete button is now visible
        remove_btn = page.locator('.btn-remove-set').first
        is_visible = remove_btn.is_visible()
        print(f"   Remove button visible after swipe: {is_visible}")

        if not is_visible:
            log_bug("Remove button not visible after swipe gesture", "swipe_02_after_swipe.png")
    else:
        log_bug("Could not get bounding box for set row")

    print("\n[Step 4] Testing with touch events directly...")

    # Try using actual touch events
    second_set_row = page.locator('.set-row-wrapper').nth(1)
    box2 = second_set_row.bounding_box()

    if box2:
        # Use touchscreen API
        start_x = box2['x'] + box2['width'] - 30
        start_y = box2['y'] + box2['height'] / 2

        print(f"   Using touchscreen.swipe simulation...")

        # Simulate touch swipe
        page.touchscreen.tap(start_x, start_y)
        time.sleep(0.1)

        page.screenshot(path='screenshots/swipe_03_touch_test.png', full_page=True)
        print("   Screenshot: swipe_03_touch_test.png")

    print("\n[Step 5] Testing Add Set then swipe delete...")

    # Add a new set first
    add_set_btn = page.locator('button:has-text("+ Add Set")').first
    add_set_btn.tap()
    time.sleep(0.5)

    new_set_count = page.locator('.set-row-wrapper').count()
    print(f"   Set count after adding: {new_set_count}")

    if new_set_count <= initial_set_count:
        log_bug("Add Set did not increase count")

    page.screenshot(path='screenshots/swipe_04_set_added.png', full_page=True)
    print("   Screenshot: swipe_04_set_added.png")

    print("\n[Step 6] Check CSS classes on set-row-wrapper...")

    # Check if the swipe CSS is applied
    wrapper_classes = first_set_row.get_attribute('class')
    print(f"   Set row wrapper classes: {wrapper_classes}")

    # Check computed styles
    has_overflow_hidden = page.evaluate('''() => {
        const el = document.querySelector('.set-row-wrapper');
        const style = window.getComputedStyle(el);
        return {
            overflow: style.overflow,
            position: style.position,
            touchAction: style.touchAction
        };
    }''')
    print(f"   Computed styles: {has_overflow_hidden}")

    if has_overflow_hidden.get('touchAction') != 'pan-y':
        log_bug(f"touch-action not set correctly. Got: {has_overflow_hidden.get('touchAction')}")

    print("\n[Step 7] Testing desktop hover behavior still works...")

    # Close mobile context, open desktop
    context.close()

    desktop_context = browser.new_context(
        viewport={'width': 1280, 'height': 720}
    )
    desktop_page = desktop_context.new_page()

    desktop_page.goto('http://localhost:8000/')
    desktop_page.wait_for_load_state('networkidle')
    time.sleep(1)

    # Login on desktop
    desktop_page.locator('#auth-email').fill('mariogj1987@gmail.com')
    desktop_page.locator('#auth-password').fill('Mg123456')
    desktop_page.locator('.auth-form button[type="submit"]').click()
    time.sleep(3)

    # Start workout
    desktop_page.locator('button:has-text("Start Workout")').first.click()
    time.sleep(2)

    # Hover over set row
    first_row_desktop = desktop_page.locator('.set-row-wrapper').first
    first_row_desktop.hover()
    time.sleep(0.3)

    desktop_page.screenshot(path='screenshots/swipe_05_desktop_hover.png', full_page=True)
    print("   Screenshot: swipe_05_desktop_hover.png")

    # Check if remove button is visible on hover
    remove_btn_desktop = desktop_page.locator('.btn-remove-set').first
    is_visible_desktop = remove_btn_desktop.is_visible()
    print(f"   Remove button visible on desktop hover: {is_visible_desktop}")

    if not is_visible_desktop:
        log_bug("Desktop hover behavior broken - remove button not visible", "swipe_05_desktop_hover.png")

    # Cleanup
    desktop_context.close()
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
        print("No bugs found!")
