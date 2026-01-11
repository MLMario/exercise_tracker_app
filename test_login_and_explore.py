"""Login and explore the dashboard"""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Enable console logging
    page.on('console', lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))

    # Navigate to the app
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    time.sleep(1)  # Wait for Alpine.js to initialize

    print("=== LOGIN ===")

    # Use type() instead of fill() to trigger Alpine.js reactivity
    email_input = page.locator('#auth-email')
    password_input = page.locator('#auth-password')

    # Clear and type to trigger input events
    email_input.click()
    email_input.fill('')
    email_input.type('mariogj1987@gmail.com', delay=50)

    password_input.click()
    password_input.fill('')
    password_input.type('Mg123456', delay=50)

    # Take screenshot before clicking login
    page.screenshot(path='screenshots/02_login_filled.png', full_page=True)
    print("Screenshot saved: screenshots/02_login_filled.png")

    # Submit the form by clicking the button in the auth form
    submit_button = page.locator('.auth-form button[type="submit"]')
    print(f"Found submit button: {submit_button.count()}")
    submit_button.click()

    # Wait for response
    print("Waiting for login response...")
    time.sleep(4)  # Wait for auth to complete

    page.wait_for_load_state('networkidle')

    # Take screenshot after login attempt
    page.screenshot(path='screenshots/03_after_login.png', full_page=True)
    print("Screenshot saved: screenshots/03_after_login.png")
    print(f"Current URL: {page.url}")

    # Check for Logout button visibility as indicator of logged in state
    logout_btn = page.locator('button:has-text("Logout"):visible')
    if logout_btn.count() > 0:
        print("LOGIN SUCCESSFUL - Logout button visible")
    else:
        print("Login may have failed - checking for errors...")
        # Check for error message
        error_elem = page.locator('.error-message:visible, .toast-error:visible')
        if error_elem.count() > 0:
            print(f"Error message: {error_elem.inner_text()}")

    # Print visible text on the page
    body_text = page.locator('body').inner_text()
    print(f"\nPage content (first 1500 chars):\n{body_text[:1500]}")

    browser.close()
