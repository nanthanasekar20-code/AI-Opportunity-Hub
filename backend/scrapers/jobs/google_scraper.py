from playwright.sync_api import sync_playwright

with sync_playwright() as p:

    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto(
        "https://www.google.com/about/careers/applications/jobs/results/?hl=en",
        timeout=120000
    )

    page.wait_for_timeout(10000)

    print(page.content())

    input("Press Enter...")