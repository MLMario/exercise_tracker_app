# -*- coding: utf-8 -*-
"""
Mobile Testing Script for Workout Logging Page
Tests the workout logging UI on mobile viewports using Playwright
"""
from playwright.sync_api import sync_playwright
import os
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Create screenshots directory
screenshots_dir = os.path.join(os.path.dirname(__file__), 'screenshots', 'mobile_test')
os.makedirs(screenshots_dir, exist_ok=True)

def test_workout_page_mobile():
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)

        # Create context with iPhone 12 Pro viewport
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
        )

        page = context.new_page()

        # Capture console logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # Navigate to the app
        page.goto('http://localhost:8000')
        page.wait_for_load_state('networkidle')

        print("=== MOBILE TESTING RESULTS ===\n")

        # 1. Take screenshot of initial state (auth page)
        page.screenshot(path=f'{screenshots_dir}/01_auth_page_mobile.png', full_page=True)
        print("1. Auth Page - Screenshot captured")

        # 2. Check auth page elements visibility
        brand_title = page.locator('.brand-title')
        if brand_title.is_visible():
            print("   - Brand title visible: OK")

        auth_card = page.locator('.auth-card')
        if auth_card.is_visible():
            print("   - Auth card visible: OK")

        # Check if login form is visible
        login_email = page.locator('#login-email')
        if login_email.is_visible():
            print("   - Login form visible: OK")

        # 3. Analyze tap target sizes
        print("\n2. Tap Target Analysis:")

        # Check visible submit button (login page shows one)
        submit_btn = page.locator('.btn-submit:visible').first
        try:
            box = submit_btn.bounding_box()
            if box:
                height = box['height']
                if height >= 44:
                    print(f"   - Submit button height: {height}px (OK, >=44px)")
                else:
                    print(f"   - BUG: Submit button height: {height}px (FAIL, <44px)")
        except:
            print("   - Submit button: Could not measure")

        # Check auth tabs
        auth_tabs = page.locator('.auth-tab')
        tab_count = auth_tabs.count()
        print(f"   - Auth tabs found: {tab_count}")
        for i in range(tab_count):
            tab = auth_tabs.nth(i)
            box = tab.bounding_box()
            if box:
                if box['height'] >= 44:
                    print(f"     Tab {i+1} height: {box['height']}px (OK)")
                else:
                    print(f"     BUG: Tab {i+1} height: {box['height']}px (FAIL)")

        # 4. Check form input sizes
        print("\n3. Input Field Analysis:")
        inputs = page.locator('input[type="email"], input[type="password"]')
        input_count = inputs.count()
        for i in range(input_count):
            input_el = inputs.nth(i)
            if input_el.is_visible():
                box = input_el.bounding_box()
                if box:
                    if box['height'] >= 44:
                        print(f"   - Input {i+1} height: {box['height']}px (OK)")
                    else:
                        print(f"   - BUG: Input {i+1} height: {box['height']}px (FAIL, <44px)")

        # 5. Check password toggle buttons
        print("\n4. Password Toggle Analysis:")
        password_toggles = page.locator('.password-toggle')
        toggle_count = password_toggles.count()
        print(f"   - Password toggles found: {toggle_count}")
        for i in range(toggle_count):
            toggle = password_toggles.nth(i)
            if toggle.is_visible():
                box = toggle.bounding_box()
                if box:
                    # Check tap target (should be at least 44x44)
                    if box['width'] >= 44 and box['height'] >= 44:
                        print(f"     Toggle {i+1}: {box['width']}x{box['height']}px (OK)")
                    else:
                        print(f"     BUG: Toggle {i+1}: {box['width']}x{box['height']}px (FAIL, <44px)")

        # 6. Test page responsiveness - Check for horizontal overflow
        print("\n5. Layout Overflow Check:")
        body_width = page.evaluate('document.body.scrollWidth')
        viewport_width = page.evaluate('window.innerWidth')
        if body_width <= viewport_width:
            print(f"   - No horizontal overflow: body={body_width}px, viewport={viewport_width}px (OK)")
        else:
            print(f"   - BUG: Horizontal overflow detected: body={body_width}px > viewport={viewport_width}px")

        # 7. Check auth card doesn't overflow
        auth_card_box = auth_card.bounding_box()
        if auth_card_box:
            if auth_card_box['width'] <= viewport_width:
                print(f"   - Auth card width: {auth_card_box['width']}px (OK, fits viewport)")
            else:
                print(f"   - BUG: Auth card overflows: {auth_card_box['width']}px > viewport")

        # Print console errors if any
        print("\n6. Console Errors/Warnings:")
        errors = [log for log in console_logs if 'error' in log.lower() or 'warn' in log.lower()]
        if errors:
            for error in errors[:5]:  # Limit to first 5
                print(f"   - {error}")
        else:
            print("   - No errors or warnings found")

        print("\n=== END OF AUTH PAGE TESTS ===")

        # Close browser
        browser.close()

        return {
            'console_logs': console_logs,
            'screenshots_dir': screenshots_dir
        }

def test_workout_surface_static():
    """
    Test the workout surface by examining the HTML structure
    Since we can't login without credentials, we analyze the static HTML
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
        )
        page = context.new_page()

        # Load the HTML file directly to analyze structure
        html_path = os.path.join(os.path.dirname(__file__), 'index.html')
        page.goto(f'file:///{html_path}')
        page.wait_for_load_state('domcontentloaded')

        print("\n=== WORKOUT SURFACE STRUCTURE ANALYSIS ===\n")

        # Analyze workout surface structure
        workout_surface = page.locator('.workout-surface')
        print(f"1. Workout surface element found: {workout_surface.count() > 0}")

        # Analyze workout header
        workout_header = page.locator('.workout-header')
        print(f"2. Workout header element found: {workout_header.count() > 0}")

        # Analyze set table structure
        set_table = page.locator('.set-table')
        print(f"3. Set table elements found: {set_table.count()}")

        # Analyze set row structure
        set_row = page.locator('.set-row')
        print(f"4. Set row elements found: {set_row.count()}")

        # Analyze buttons
        btn_add_set = page.locator('.btn-add-set')
        print(f"5. Add set buttons found: {btn_add_set.count()}")

        # Analyze rest timer
        rest_timer = page.locator('.rest-timer-bar-container')
        print(f"6. Rest timer bar containers found: {rest_timer.count()}")

        # Analyze timer adjust buttons
        timer_adjust = page.locator('.btn-timer-adjust')
        print(f"7. Timer adjust buttons found: {timer_adjust.count()}")

        # Analyze swipe-to-delete wrapper
        swipe_wrapper = page.locator('.set-row-wrapper')
        print(f"8. Swipe row wrappers found: {swipe_wrapper.count()}")

        # Analyze modals
        modals = page.locator('.modal')
        print(f"9. Modal elements found: {modals.count()}")

        # Analyze checkbox buttons
        checkbox_btn = page.locator('.checkbox-btn')
        print(f"10. Checkbox buttons found: {checkbox_btn.count()}")

        browser.close()

        print("\n=== END STRUCTURE ANALYSIS ===")

def analyze_css_for_mobile_issues():
    """
    Analyze the CSS for potential mobile issues
    """
    css_path = os.path.join(os.path.dirname(__file__), 'css', 'styles.css')

    print("\n=== CSS MOBILE ANALYSIS ===\n")

    with open(css_path, 'r') as f:
        css_content = f.read()

    # Check for min-tap-target usage
    if '--min-tap-target: 44px' in css_content:
        print("1. Min tap target variable defined: OK (44px)")
    else:
        print("1. BUG: Min tap target not properly defined")

    # Check for touch-action property
    if 'touch-action' in css_content:
        print("2. Touch-action property used: OK (swipe handling)")
    else:
        print("2. WARNING: touch-action not found (may affect swipe)")

    # Check for mobile breakpoint
    if '@media (max-width: 400px)' in css_content:
        print("3. Small mobile breakpoint found: OK (<=400px)")
    else:
        print("3. WARNING: No small mobile breakpoint found")

    # Check for hover media query (hover-only styles)
    if '@media (hover: hover)' in css_content:
        print("4. Hover-only media query found: OK (touch vs mouse)")
    else:
        print("4. WARNING: No hover media query (may show hover states on touch)")

    # Check for overflow handling
    if 'overflow' in css_content:
        overflow_count = css_content.count('overflow')
        print(f"5. Overflow properties found: {overflow_count} occurrences")

    # Check for potential issues
    issues = []

    # Check if .btn-remove-set has sufficient size
    if '.btn-remove-set' in css_content:
        # Find the block
        start = css_content.find('.btn-remove-set {')
        if start != -1:
            end = css_content.find('}', start)
            block = css_content[start:end]
            if 'width: 60px' in block:
                print("6. Delete button width: 60px (OK)")
            if 'height: 70%' in block:
                print("   Delete button height: 70% (relative - check if sufficient)")

    # Check set-input sizing
    if '.set-input' in css_content:
        start = css_content.find('.set-input {')
        if start != -1:
            end = css_content.find('}', start)
            block = css_content[start:end]
            if 'min-height: 40px' in block:
                print("7. Set input min-height: 40px (POTENTIAL ISSUE - should be 44px)")
            else:
                print("7. Set input min-height not specified")

    # Check checkbox button sizing
    if '.checkbox-btn {' in css_content:
        start = css_content.find('.checkbox-btn {')
        if start != -1:
            end = css_content.find('}', start)
            block = css_content[start:end]
            if 'width: 36px' in block and 'height: 36px' in block:
                print("8. BUG: Checkbox button 36x36px (FAIL - should be >=44px for touch)")

    # Check set-number sizing
    if '.set-number {' in css_content:
        start = css_content.find('.set-number {')
        if start != -1:
            end = css_content.find('}', start)
            block = css_content[start:end]
            if 'width: 36px' in block and 'height: 36px' in block:
                print("9. Set number badge 36x36px (OK - not interactive)")

    print("\n=== END CSS ANALYSIS ===")

if __name__ == '__main__':
    # Run CSS analysis first (doesn't require server)
    analyze_css_for_mobile_issues()

    # Run structure analysis (file:// protocol)
    test_workout_surface_static()

    # Run live tests (requires server)
    print("\n" + "="*50)
    print("Starting live mobile tests (requires server on port 8000)")
    print("="*50)
    try:
        test_workout_page_mobile()
    except Exception as e:
        print(f"Error during live tests: {e}")
        print("Make sure to run: python -m http.server 8000")
