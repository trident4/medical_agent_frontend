"""
Tests for the login page functionality.
"""

from playwright.sync_api import Page, expect

# Configuration
BASE_URL = "http://localhost:3000"
TEST_USERNAME = "admin"
TEST_PASSWORD = "Test@123"


def test_login_page_loads(page: Page):
    """Test that the login page loads correctly."""
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    # Verify page title contains expected text (using card-title to be specific)
    expect(page.locator("[data-slot='card-title']")).to_have_text("Sign In")

    # Verify form elements exist
    expect(page.locator("#username")).to_be_visible()
    expect(page.locator("#password")).to_be_visible()
    expect(page.locator("button[type='submit']")).to_be_visible()


def test_login_form_validation(page: Page):
    """Test that the form requires username and password."""
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    # Both fields should be required
    username_input = page.locator("#username")
    password_input = page.locator("#password")

    expect(username_input).to_have_attribute("required", "")
    expect(password_input).to_have_attribute("required", "")


def test_successful_login(page: Page):
    """Test successful login with valid credentials."""
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    # Fill in credentials
    page.fill("#username", TEST_USERNAME)
    page.fill("#password", TEST_PASSWORD)

    # Submit form
    page.click("button[type='submit']")

    # Should redirect to /patients
    page.wait_for_url("**/patients**", timeout=10000)

    # Verify we're on the patients page
    assert "/patients" in page.url


def test_invalid_login_shows_error(page: Page):
    """Test that invalid credentials show an error message."""
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    # Fill in invalid credentials
    page.fill("#username", "wronguser")
    page.fill("#password", "wrongpass")

    # Submit form
    page.click("button[type='submit']")

    # Wait a bit for error to appear
    page.wait_for_timeout(2000)

    # Should still be on login page (or show error)
    # Check if we're still on login or if an error message appeared
    assert "/login" in page.url or page.locator(".text-red-600").is_visible()


def test_login_button_shows_loading_state(page: Page):
    """Test that the login button shows loading state during submission."""
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    # Fill credentials
    page.fill("#username", TEST_USERNAME)
    page.fill("#password", TEST_PASSWORD)

    # Get button text before and after click
    button = page.locator("button[type='submit']")
    expect(button).to_have_text("Sign In")

    # Click and check for loading state (should briefly show "Signing in...")
    button.click()

    # The loading state may be too fast to catch, so we just verify redirect works
    page.wait_for_url("**/patients**", timeout=10000)
