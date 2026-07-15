"""Internshala internship scraper.

Scrapes internship listings from https://internshala.com/internships.
Selectors were carried over as-is from the original prototype script and
have not been re-verified against the live site from this environment —
if Internshala has changed its markup, scrape_internshala() returns an
empty list instead of crashing the whole /api/opportunities/internshala
endpoint.
"""

from playwright.sync_api import sync_playwright


def scrape_internshala(max_results: int = 20) -> list[dict]:
    internships: list[dict] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto("https://internshala.com/internships", timeout=60000)
            page.wait_for_timeout(8000)

            cards = page.locator("div.individual_internship")
            count = min(cards.count(), max_results)

            for i in range(count):
                card = cards.nth(i)

                try:
                    title = card.locator("a.job-title-href").inner_text().strip()
                except Exception:
                    title = ""

                try:
                    company = card.locator("p.company-name").inner_text().strip()
                except Exception:
                    company = ""

                try:
                    location = card.locator("div.locations a").inner_text().strip()
                except Exception:
                    location = ""

                try:
                    stipend = card.locator("span.stipend").inner_text().strip()
                except Exception:
                    stipend = ""

                try:
                    duration = (
                        card.locator("div.row-1-item").nth(2).locator("span").inner_text().strip()
                    )
                except Exception:
                    duration = ""

                try:
                    link = card.locator("a.job-title-href").get_attribute("href") or ""
                    if link:
                        link = "https://internshala.com" + link
                except Exception:
                    link = ""

                if not title:
                    continue

                internships.append({
                    "title": title,
                    "type": "Internship",
                    "source": "Internshala",
                    "company": company,
                    "location": location,
                    "stipend": stipend,
                    "duration": duration,
                    "official_url": link,
                })

            browser.close()

    except Exception as exc:
        print(f"[internshala_scraper] scrape failed, returning empty list: {exc}")
        return []

    return internships


if __name__ == "__main__":
    results = scrape_internshala()
    print(f"Fetched {len(results)} internships from Internshala")
    for r in results[:5]:
        print(r)