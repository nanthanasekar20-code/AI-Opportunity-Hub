"""Google Careers job scraper.

Selectors confirmed working against a real captured job card (July 2026):
card = li.lLd3Je, title = h3.QJPWVe, company/location = span.RP7SMd /
span.pwO9Dc, link = a.WpHeLc. The link's href attribute is relative, so we
read the resolved `.href` DOM property instead of the raw attribute — that
lets the browser do the URL resolution correctly rather than guessing at it.
"""

from playwright.sync_api import sync_playwright


def scrape_google_jobs(max_results: int = 20, keyword: str = "machine learning") -> list[dict]:
    jobs: list[dict] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            url = (
                "https://www.google.com/about/careers/applications/jobs/results/"
                f"?hl=en&q={keyword.replace(' ', '%20')}"
            )
            page.goto(url, timeout=120000, wait_until="domcontentloaded")
            page.wait_for_timeout(8000)

            cards = page.locator("li.lLd3Je")
            count = min(cards.count(), max_results)

            for i in range(count):
                card = cards.nth(i)

                try:
                    title = card.locator("h3.QJPWVe").inner_text().strip()
                except Exception:
                    title = ""

                try:
                    company = card.locator("span.RP7SMd span").first.inner_text().strip()
                except Exception:
                    company = ""

                try:
                    location = card.locator("span.pwO9Dc span.r0wTof").first.inner_text().strip()
                except Exception:
                    location = ""

                official_url = ""
                try:
                    link_el = card.locator("a.WpHeLc").first
                    official_url = link_el.evaluate("el => el.href")
                except Exception:
                    pass

                if not title:
                    continue

                jobs.append({
                    "title": title,
                    "type": "Job",
                    "source": "Google",
                    "company": company,
                    "location": location,
                    "official_url": official_url,
                })

            browser.close()

    except Exception as exc:
        print(f"[google_scraper] scrape failed, returning empty list: {exc}")
        return []

    return jobs


if __name__ == "__main__":
    results = scrape_google_jobs()
    print(f"Fetched {len(results)} jobs from Google Careers")
    for r in results[:5]:
        print(r)