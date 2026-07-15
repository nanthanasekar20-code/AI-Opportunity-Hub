from playwright.sync_api import sync_playwright


def scrape_amazon_jobs():
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        try:
            page = browser.new_page()

            page.goto(
                "https://www.amazon.jobs/en/search",
                wait_until="domcontentloaded",
                timeout=120000
            )

            page.wait_for_timeout(8000)

            cards = page.locator("div.job-tile")

            print(f"Total Jobs: {cards.count()}")

            for i in range(cards.count()):

                card = cards.nth(i)

                # ---------------- Title ----------------
                try:
                    title = card.locator("h3").inner_text().strip()
                except:
                    title = None

                # ---------------- Location ----------------
                try:
                    location = card.locator(".location-and-id").inner_text().strip()
                except:
                    location = None

                # ---------------- Official URL ----------------
                official_url = None

                try:
                    official_url = card.get_attribute("href")

                    if not official_url:
                        official_url = card.locator("a").get_attribute("href")

                    if official_url and official_url.startswith("/"):
                        official_url = "https://www.amazon.jobs" + official_url

                except:
                    official_url = None

                opportunities.append({
                    "title": title,
                    "type": "job",
                    "company": "Amazon",
                    "location": location,
                    "source": "Amazon Careers",
                    "official_url": official_url,
                    "deadline": None
                })

        finally:
            browser.close()

    return opportunities


if __name__ == "__main__":

    jobs = scrape_amazon_jobs()

    print("\n==============================")
    print(f"Total Opportunities: {len(jobs)}")
    print("==============================\n")

    for job in jobs[:10]:
        print(job)