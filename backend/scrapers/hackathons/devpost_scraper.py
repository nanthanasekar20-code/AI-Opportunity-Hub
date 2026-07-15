"""Devpost hackathon scraper.

Scrapes the currently listed hackathons from https://devpost.com/hackathons.
Selectors were carried over as-is from the original prototype script — they
have not been re-verified against the live site from this environment, so
if Devpost has changed its markup since this was written, scrape_devpost()
will simply return an empty list rather than crashing (see the try/except
around the whole run).
"""

from playwright.sync_api import sync_playwright


def scrape_devpost(max_results: int = 20) -> list[dict]:
    hackathons: list[dict] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
                )
            )
            page = context.new_page()
            page.goto(
                "https://devpost.com/hackathons",
                wait_until="domcontentloaded",
                timeout=120000,
            )
            page.wait_for_timeout(8000)

            cards = page.locator("div.hackathon-tile")
            count = min(cards.count(), max_results)

            for i in range(count):
                card = cards.nth(i)

                def safe_text(selector: str) -> str:
                    try:
                        return card.locator(selector).inner_text().strip()
                    except Exception:
                        return ""

                title = safe_text("h3")
                organization = safe_text(".host-label")
                deadline = safe_text(".submission-period")
                status = safe_text(".status-label")
                location = safe_text(".info span")

                try:
                    link = card.locator("a.tile-anchor").get_attribute("href") or ""
                except Exception:
                    link = ""

                if not title:
                    continue

                hackathons.append({
                    "title": title,
                    "type": "Hackathon",
                    "source": "Devpost",
                    "organization": organization,
                    "deadline": deadline,
                    "status": status,
                    "location": location,
                    "official_url": link,
                })

            browser.close()

    except Exception as exc:
        print(f"[devpost_scraper] scrape failed, returning empty list: {exc}")
        return []

    return hackathons


if __name__ == "__main__":
    results = scrape_devpost()
    print(f"Fetched {len(results)} hackathons from Devpost")
    for r in results[:5]:
        print(r)