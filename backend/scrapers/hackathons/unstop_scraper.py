"""Unstop opportunity scraper.

Unstop is an Angular app that handles navigation in JavaScript rather than
plain <a href> links, so there's no URL to read directly from the HTML.
Instead, this clicks each card, captures the URL it navigates to, then
goes back to the listing page before clicking the next one. Slower than
reading an href directly, but it's the only reliable way to get a real
link given how the page is built.
"""

from playwright.sync_api import sync_playwright


def scrape_unstop(max_results: int = 15) -> list[dict]:
    opportunities: list[dict] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto("https://unstop.com", timeout=60000)
            page.wait_for_timeout(10000)

            cards = page.locator("a.image_card")
            count = min(cards.count(), max_results)

            for i in range(count):
                card = page.locator("a.image_card").nth(i)

                try:
                    title = card.locator("h3.double-wrap").inner_text().strip()
                except Exception:
                    title = ""

                try:
                    tag = card.locator("span").first.inner_text().strip()
                except Exception:
                    tag = ""

                if not title:
                    continue

                link = ""
                try:
                    card.click(timeout=5000)
                    page.wait_for_timeout(2000)
                    link = page.url
                    page.go_back(timeout=10000)
                    page.wait_for_timeout(2000)
                except Exception:
                    pass

                opportunities.append({
                    "title": title,
                    "type": "Competition",
                    "source": "Unstop",
                    "tag": tag,
                    "official_url": link,
                })

            browser.close()

    except Exception as exc:
        print(f"[unstop_scraper] scrape failed, returning empty list: {exc}")
        return []

    return opportunities


if __name__ == "__main__":
    results = scrape_unstop()
    print(f"Fetched {len(results)} opportunities from Unstop")
    for r in results[:5]:
        print(r)