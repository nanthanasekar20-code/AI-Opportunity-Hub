from playwright.sync_api import sync_playwright


def scrape_ibm_jobs():
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page()

        page.goto(
            "https://www.ibm.com/careers/search",
            wait_until="domcontentloaded",
            timeout=120000
        )

        page.wait_for_timeout(10000)

        cards = page.locator("a.bx--card-group__card")

        print("Total Jobs:", cards.count())

        for i in range(cards.count()):

            card = cards.nth(i)

            try:
                title = card.locator(".bx--card__heading").inner_text().strip()
            except:
                title = None

            try:
                department = card.locator(".bx--card__eyebrow").inner_text().strip()
            except:
                department = None

            try:
                details = card.locator(".ibm--card__copy__inner").inner_text().split("\n")

                experience = details[0] if len(details) > 0 else None
                location = details[1] if len(details) > 1 else None

            except:
                experience = None
                location = None

            try:
                link = card.get_attribute("href")
            except:
                link = None

            opportunities.append({
                "title": title,
                "type": "job",
                "company": "IBM",
                "location": location,
                "source": "IBM Careers",
                "official_url": link,
                "deadline": None,
                "department": department,
                "experience": experience
            })

        browser.close()

    return opportunities


if __name__ == "__main__":

    jobs = scrape_ibm_jobs()

    print("\n==============================")
    print("Total Opportunities:", len(jobs))
    print("==============================\n")

    for job in jobs[:10]:
        print(job)