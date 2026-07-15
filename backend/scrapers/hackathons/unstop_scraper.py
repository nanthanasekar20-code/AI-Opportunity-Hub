"""Unstop opportunity scraper.

Scrapes the opportunity cards listed on https://unstop.com. Selectors were
carried over as-is from the original prototype script and have not been
re-verified against the live site from this environment — if Unstop has
changed its markup, scrape_unstop() returns an empty list instead of
crashing the whole /api/opportunities/unstop endpoint.
"""

from playwright.sync_api import sync_playwright


def scrape_unstop(max_results: int = 20) -> list[dict]:
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

                try:
                    link = card.get_attribute("href") or ""
                    if link.startswith("/"):
                        link = "https://unstop.com" + link
                except Exception:
                    link = ""

                if not title:
                    continue

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