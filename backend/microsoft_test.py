"""Unstop opportunity scraper.

Unstop is an Angular single-page app: opportunity cards have no real href
attribute in the DOM (navigation happens entirely via JS, not a normal
link), so the URL can't be read off the card directly. Instead, each card
is clicked, the resulting URL is captured, then we navigate back to the
listing page before moving to the next card. This is slower than reading
an href would be, but it's the only reliable way to get the real link here.
"""

from playwright.sync_api import sync_playwright


def scrape_unstop(max_results: int = 15) -> list[dict]:
    opportunities: list[dict] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            listing_url = "https://unstop.com"
            page.goto(listing_url, timeout=60000)
            page.wait_for_timeout(10000)

            cards = page.locator("a.image_card")
            count = min(cards.count(), max_results)

            for i in range(count):
                card = cards.nth(i)

                try:
                    title = card.locator("h3.double-wrap").inner_text().strip()
                except Exception:
                    title = ""

                try:
                    mode = card.locator("span").nth(0).inner_text().strip()
                except Exception:
                    mode = ""

                try:
                    price = card.locator("span").nth(1).inner_text().strip()
                except Exception:
                    price = ""

                if not title:
                    continue

                # Click the card, capture where it navigates to, then return
                # to the listing so the next card can be found the same way.
                link = ""
                try:
                    card.click(timeout=10000)
                    page.wait_for_timeout(3000)
                    link = page.url
                    page.go_back(timeout=15000)
                    page.wait_for_timeout(3000)
                    # cards is a live locator, re-fetch it after navigating back
                    cards = page.locator("a.image_card")
                except Exception:
                    # If the click/navigation failed, make sure we're back on
                    # the listing page before continuing to the next card.
                    try:
                        if page.url != listing_url:
                            page.goto(listing_url, timeout=60000)
                            page.wait_for_timeout(5000)
                            cards = page.locator("a.image_card")
                    except Exception:
                        pass

                opportunities.append({
                    "title": title,
                    "type": "Competition",
                    "source": "Unstop",
                    "mode": mode,
                    "price": price,
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