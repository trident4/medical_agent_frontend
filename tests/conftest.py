"""
Shared pytest fixtures for Playwright browser testing.
"""

import os
import pytest
from playwright.sync_api import sync_playwright, Page, Browser

# Configuration
BASE_URL = "http://localhost:3000"
TEST_USERNAME = "admin"
TEST_PASSWORD = "Test@123"

# Set HEADED=1 to see the browser: HEADED=1 pytest tests/ -v
HEADLESS = os.environ.get("HEADED", "0") != "1"


@pytest.fixture(scope="session")
def browser():
    """Create a browser instance for the entire test session."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=HEADLESS)
        yield browser
        browser.close()


@pytest.fixture
def page(browser: Browser):
    """Create a new page for each test."""
    page = browser.new_page()
    yield page
    page.close()


@pytest.fixture
def authenticated_page(browser: Browser):
    """Create a page that is already logged in."""
    page = browser.new_page()

    # Navigate to login
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    # Fill login form
    page.fill("#username", TEST_USERNAME)
    page.fill("#password", TEST_PASSWORD)

    # Submit and wait for navigation
    page.click("button[type='submit']")
    page.wait_for_url("**/patients**", timeout=10000)

    yield page
    page.close()


def take_screenshot(page: Page, name: str):
    """Helper to take a screenshot for debugging."""
    page.screenshot(path=f"/tmp/{name}.png", full_page=True)
