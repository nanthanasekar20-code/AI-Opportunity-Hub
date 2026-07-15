"""Google Careers job scraper.

IMPORTANT: unlike the other three scrapers, the original prototype for this
one had no extraction logic at all (it only printed the raw page HTML and
waited for a keypress). The version below is a best-effort rewrite, written
without live access to google.com from this environment, so it has NOT been
verified against the real page. Google's careers site also uses
auto-generated, frequently-changing CSS class names, so this deliberately
avoids guessing at class names and instead looks for links that point at a
job detail page (a more stable signal than a specific class).

Before relying on this: run it locally (`python google_scraper.py`) and
check the printed results actually look like real job listings. If it
returns nothing, open the page in a real browser, right-click a job title,
"Inspect", and update the locator below to match what you see.
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

            # Job cards on Google's careers site link to a job detail page
            # under this path — matching on the href pattern is more
            # resilient to their class names changing than matching on
            # class names would be.
            links = page.locator("a[href*='/jobs/results/']")
            count = min(links.count(), max_results)

            for i in range(count):
                link = links.nth(i)

                try:
                    title = link.inner_text().strip()
                    href = link.get_attribute("href") or ""
                except Exception:
                    continue

                if not title or len(title) < 3:
                    continue

                full_url = href if href.startswith("http") else f"https://www.google.com{href}"

                jobs.append({
                    "title": title,
                    "type": "Job",
                    "source": "Google",
                    "official_url": full_url,
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