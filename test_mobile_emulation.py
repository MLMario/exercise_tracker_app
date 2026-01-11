"""Test the app with mobile device emulation"""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    # Launch with iPhone 14 Pro emulation
    iphone = p.devices['iPhone 14 Pro']
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        **iphone,
        locale='en-US'
    )
    page = context.new_page()

    print("=" * 60)
    print("MOBILE EMULATION TEST - iPhone 14 Pro")
    print(f"Viewport: {iphone['viewport']}")
    print("=" * 60)

    # Navigate to the app
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    # Screenshot: Login page on mobile
    page.screenshot(path='screenshots/mobile_01_login.png', full_page=True)
    print("Screenshot: mobile_01_login.png")

    # Login
    page.locator('#auth-email').type('mariogj1987@gmail.com', delay=30)
    page.locator('#auth-password').type('Mg123456', delay=30)
    page.locator('.auth-form button[type="submit"]').click()
    time.sleep(3)

    # Screenshot: Dashboard on mobile
    page.screenshot(path='screenshots/mobile_02_dashboard.png', full_page=True)
    print("Screenshot: mobile_02_dashboard.png")

    # Start workout
    start_btn = page.locator('button:has-text("Start Workout")').first
    if start_btn.count() > 0:
        start_btn.click()
        time.sleep(2)

    # Screenshot: Workout view on mobile
    page.screenshot(path='screenshots/mobile_03_workout.png', full_page=True)
    print("Screenshot: mobile_03_workout.png")

    # Test tap on checkbox (mobile touch)
    checkbox = page.locator('.checkbox-btn').first
    if checkbox.count() > 0:
        checkbox.tap()  # Use tap instead of click for mobile
        time.sleep(1)

    # Screenshot: After tapping checkbox
    page.screenshot(path='screenshots/mobile_04_set_done.png', full_page=True)
    print("Screenshot: mobile_04_set_done.png")

    # Test: Can we see remove button without hover on mobile?
    # On mobile, the X should ideally be visible or accessible via long-press
    remove_btns = page.locator('.btn-remove-set:visible')
    print(f"\nRemove buttons visible on mobile: {remove_btns.count()}")

    if remove_btns.count() == 0:
        print("NOTE: Remove buttons require hover - may need mobile-friendly alternative")

    # Test Add Set button
    add_set_btn = page.locator('button:has-text("+ Add Set")').first
    if add_set_btn.count() > 0:
        add_set_btn.tap()
        time.sleep(0.5)
        page.screenshot(path='screenshots/mobile_05_added_set.png', full_page=True)
        print("Screenshot: mobile_05_added_set.png")

    print("\n" + "=" * 60)
    print("Mobile emulation test complete!")
    print("=" * 60)

    browser.close()
