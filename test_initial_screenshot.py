"""Initial screenshot to explore the app state"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')

    # Take a screenshot
    page.screenshot(path='screenshots/01_initial_state.png', full_page=True)
    print("Screenshot saved: screenshots/01_initial_state.png")

    # Print page title and URL
    print(f"Page title: {page.title()}")
    print(f"Current URL: {page.url}")

    # Print HTML content to understand the structure
    content = page.content()
    print(f"\nPage content length: {len(content)} characters")

    browser.close()
