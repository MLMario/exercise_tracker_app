"""Test script to log in and test exercise logging functionality."""
from playwright.sync_api import sync_playwright
import os
import sys

# Create screenshots directory
os.makedirs('screenshots', exist_ok=True)

# Set UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 900})

    # Collect console messages
    console_messages = []
    def log_console(msg):
        console_messages.append(f"[{msg.type}]: {msg.text}")
        print(f"CONSOLE [{msg.type}]: {msg.text}")
    page.on("console", log_console)

    # Navigate to the app
    print("Navigating to http://localhost:8000/")
    page.goto('http://localhost:8000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)  # Wait for Alpine to init

    # Log in with correct credentials
    print("\n--- Logging in with mariogj1987@gmail.com ---")
    page.fill('#auth-email', 'mariogj1987@gmail.com')
    page.fill('#auth-password', 'Mg123456')

    # Click login button
    print("Clicking login button...")
    page.click('button.btn-primary:has-text("Login")')

    # Wait for auth state change and dashboard to load
    page.wait_for_timeout(4000)

    # Take screenshot of current state
    page.screenshot(path='screenshots/03_after_login.png', full_page=True)
    print("Saved: screenshots/03_after_login.png")

    # Check if dashboard is visible
    dashboard_visible = page.locator('.dashboard-surface').is_visible()
    auth_visible = page.locator('.auth-surface').is_visible()
    print(f"\nDashboard visible: {dashboard_visible}")
    print(f"Auth visible: {auth_visible}")

    if not dashboard_visible:
        print("\nWARNING: Dashboard not visible after login!")
        # Check for errors
        error_el = page.locator('.error-message:visible, .toast-error:visible')
        if error_el.count() > 0:
            print(f"Error message: {error_el.first.text_content()}")
        browser.close()
        exit(1)

    # === CONTINUE WITH TESTING ===
    print("\n--- Successfully logged in! ---")

    # Look for templates, specifically "pull day"
    print("\n--- Looking for 'pull day' template ---")
    page.wait_for_timeout(2000)  # Wait for templates to load

    page.screenshot(path='screenshots/04_dashboard.png', full_page=True)
    print("Saved: screenshots/04_dashboard.png")

    # Find all template cards
    templates = page.locator('.template-card').all()
    print(f"Found {len(templates)} template cards")

    pull_day_found = False
    for i, template in enumerate(templates):
        name_el = template.locator('.template-name')
        if name_el.count() > 0:
            name = name_el.text_content()
            print(f"  Template {i+1}: {name}")
            if 'pull' in name.lower():
                pull_day_found = True
                print(f"    -> Found 'pull day' template!")

    if not pull_day_found:
        print("\nWARNING: 'pull day' template not found!")
        # Check empty state message
        empty_state = page.locator('.empty-state:visible')
        if empty_state.count() > 0:
            print(f"Empty state message: {empty_state.first.text_content()}")

    # Now try to start a workout with the pull day template (or first available)
    print("\n--- Starting workout from template ---")

    # Find and click the Start Workout button for pull day or first template
    start_buttons = page.locator('.template-card:has-text("pull") button:has-text("Start Workout")').all()
    if len(start_buttons) == 0:
        # Fall back to first template's Start Workout button
        start_buttons = page.locator('.template-card button:has-text("Start Workout")').all()

    if len(start_buttons) > 0:
        print(f"Found {len(start_buttons)} Start Workout buttons")
        start_buttons[0].click()
        page.wait_for_timeout(2000)

        page.screenshot(path='screenshots/05_workout_started.png', full_page=True)
        print("Saved: screenshots/05_workout_started.png")

        # Check if workout surface is visible
        workout_visible = page.locator('.workout-surface').is_visible()
        print(f"Workout surface visible: {workout_visible}")

        if workout_visible:
            # Check workout exercises
            exercises = page.locator('.exercise-workout-card').all()
            print(f"\nWorkout exercises: {len(exercises)}")
            for i, ex in enumerate(exercises):
                name_el = ex.locator('.exercise-name')
                if name_el.count() > 0:
                    name = name_el.text_content()
                    print(f"  Exercise {i+1}: {name}")

            # Test logging an exercise - update values and check done
            if len(exercises) > 0:
                print("\n--- Testing exercise logging ---")

                # Find the first exercise's inputs
                first_ex = exercises[0]
                sets_input = first_ex.locator('input[id^="workout-sets"]')
                reps_input = first_ex.locator('input[id^="workout-reps"]')
                weight_input = first_ex.locator('input[id^="workout-weight"]')

                # Get current values
                current_sets = sets_input.input_value()
                current_reps = reps_input.input_value()
                current_weight = weight_input.input_value()
                print(f"Current values - Sets: {current_sets}, Reps: {current_reps}, Weight: {current_weight}")

                # Update values
                sets_input.fill('4')
                reps_input.fill('12')
                weight_input.fill('135')

                page.wait_for_timeout(500)

                # Verify values updated
                new_sets = sets_input.input_value()
                new_reps = reps_input.input_value()
                new_weight = weight_input.input_value()
                print(f"New values - Sets: {new_sets}, Reps: {new_reps}, Weight: {new_weight}")

                # Check the exercise as done
                checkbox = first_ex.locator('.checkbox-large')
                checkbox.click()
                page.wait_for_timeout(500)

                page.screenshot(path='screenshots/06_exercise_logged.png', full_page=True)
                print("Saved: screenshots/06_exercise_logged.png")

                # Check if checkbox is checked
                is_checked = checkbox.is_checked()
                print(f"Exercise marked as done: {is_checked}")

                # Try to finish workout
                print("\n--- Testing finish workout ---")
                finish_btn = page.locator('button:has-text("Finish Workout")')
                if finish_btn.is_visible():
                    print("Finish Workout button is visible")

                    # Accept the confirm dialog
                    page.on("dialog", lambda dialog: dialog.accept())

                    finish_btn.click()
                    page.wait_for_timeout(3000)

                    page.screenshot(path='screenshots/07_after_finish.png', full_page=True)
                    print("Saved: screenshots/07_after_finish.png")

                    # Check if we're back on dashboard
                    back_on_dashboard = page.locator('.dashboard-surface').is_visible()
                    print(f"Back on dashboard: {back_on_dashboard}")

                    # Check for success message
                    success_toast = page.locator('.toast-success:visible')
                    if success_toast.count() > 0:
                        print(f"Success message: {success_toast.text_content()}")

                    # Check for error message
                    error_toast = page.locator('.toast-error:visible')
                    if error_toast.count() > 0:
                        print(f"ERROR message: {error_toast.text_content()}")
    else:
        print("No Start Workout button found")
        # List all visible buttons
        all_buttons = page.locator('button:visible').all()
        print(f"\nAll visible buttons ({len(all_buttons)}):")
        for btn in all_buttons:
            text = btn.text_content().strip()
            if text:
                print(f"  - {text}")

    print("\n--- All Console Messages ---")
    for msg in console_messages:
        print(msg)

    browser.close()
    print("\nTest complete!")
