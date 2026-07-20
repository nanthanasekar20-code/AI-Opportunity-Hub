from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://unstop.com", timeout=60000)
    page.wait_for_timeout(10000)

    card = page.locator("a.image_card").first
    print("URL before click:", page.url)

    try:
        card.click(timeout=5000)
        page.wait_for_timeout(3000)
        print("URL after click:", page.url)
    except Exception as e:
        print("CLICK FAILED WITH ERROR:")
        print(e)

    browser.close()