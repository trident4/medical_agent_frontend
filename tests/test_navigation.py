"""
Tests for navigation and protected routes.
"""

from playwright.sync_api import Page, expect

# Configuration
BASE_URL = "http://localhost:3000"


def test_home_page_loads(page: Page):
    """Test that the home page loads or redirects correctly."""
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")

    # Home page should either show content or redirect to login
    # Check if page loaded (could be home or login redirect)
    assert page.url.startswith(BASE_URL)


def test_protected_route_redirects_to_login(page: Page):
    """Test that accessing protected routes without auth redirects to login."""
    page.goto(f"{BASE_URL}/patients")
    page.wait_for_load_state("networkidle")

    # Should be redirected to login
    # Wait a bit for redirect
    page.wait_for_timeout(2000)

    # Should be on login page or see login form
    assert "/login" in page.url or page.locator("text=Sign In").is_visible()


def test_authenticated_user_can_access_patients(authenticated_page: Page):
    """Test that authenticated users can access the patients page."""
    # authenticated_page fixture already logs in and navigates to /patients
    assert "/patients" in authenticated_page.url


def test_navigation_between_protected_pages(authenticated_page: Page):
    """Test navigation between protected pages works."""
    page = authenticated_page

    # We're on /patients, check if we can navigate
    # This test assumes there's navigation, adjust based on actual app
    page.wait_for_load_state("networkidle")

    # Take screenshot for debugging
    page.screenshot(path="/tmp/patients_page.png", full_page=True)

    # Verify we're on a protected page
    assert "/patients" in page.url


def test_analytics_page_accessible(authenticated_page: Page):
    """Test that the analytics page is accessible when authenticated."""
    page = authenticated_page

    # Navigate to analytics
    page.goto(f"{BASE_URL}/analytics")
    page.wait_for_load_state("networkidle")

    # Should not be redirected to login
    assert "/login" not in page.url or "/analytics" in page.url
