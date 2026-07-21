from playwright.sync_api import sync_playwright
import re


BASE_URL = "https://careers.cisco.com"
CAREERS_URL = "https://careers.cisco.com/global/en"


def extract_visible_jobs(page):
    jobs = []

    job_links = page.locator(
        "a[href*='/global/en/job/']"
    )

    for i in range(job_links.count()):
        link = job_links.nth(i)

        try:
            href = link.get_attribute("href")

            if not href:
                continue

            match = re.search(
                r"/global/en/job/(\d+)/",
                href
            )

            if not match:
                continue

            job_id = match.group(1)

            if href.startswith("/"):
                href = BASE_URL + href

            title = link.inner_text(
                timeout=3000
            ).strip()

            title = " ".join(title.split())

            if not title:
                continue

            location = None
            category = None
            apply_url = None

            # Find nearest container containing this job
            card = link.locator(
                "xpath=ancestor::*[.//a[contains(@href,'hvhapply')]][1]"
            )

            if card.count() > 0:
                try:
                    raw_text = card.inner_text(
                        timeout=3000
                    )

                    lines = [
                        " ".join(line.split())
                        for line in raw_text.splitlines()
                        if line.strip()
                    ]

                    for index, line in enumerate(lines):

                        lower = line.lower()

                        # Standard location format
                        if lower == "location:":
                            if index + 1 < len(lines):
                                location = lines[index + 1]

                        elif lower.startswith("location:"):
                            value = line.split(
                                ":",
                                1
                            )[1].strip()

                            if value:
                                location = value

                        # Cisco recommendation cards sometimes use:
                        # "Available in 4 locations"
                        elif (
                            location is None
                            and lower.startswith("available in ")
                            and "location" in lower
                        ):
                            location = line

                        # Standard category format
                        if lower == "category:":
                            if index + 1 < len(lines):
                                category = lines[index + 1]

                        elif lower.startswith("category:"):
                            value = line.split(
                                ":",
                                1
                            )[1].strip()

                            if value:
                                category = value

                        # Recommendation cards sometimes use:
                        # "Associated with 2 categories"
                        elif (
                            category is None
                            and lower.startswith(
                                "associated with "
                            )
                            and "categor" in lower
                        ):
                            category = line

                    apply_link = card.locator(
                        f"a[href*='hvhapply'][href*='{job_id}']"
                    )

                    if apply_link.count() > 0:
                        apply_url = (
                            apply_link.first.get_attribute(
                                "href"
                            )
                        )

                except Exception:
                    pass

            # Fallback for Apply Now URL
            if not apply_url:
                apply_link = page.locator(
                    f"a[href*='hvhapply'][href*='{job_id}']"
                )

                if apply_link.count() > 0:
                    apply_url = (
                        apply_link.first.get_attribute(
                            "href"
                        )
                    )

            if apply_url and apply_url.startswith("/"):
                apply_url = BASE_URL + apply_url

            jobs.append({
                "title": title,
                "type": "job",
                "company": "Cisco",
                "location": location,
                "source": "Cisco Careers",
                "official_url": href,
                "apply_url": apply_url,
                "deadline": None,
                "category": category,
                "job_id": job_id
            })

        except Exception:
            continue

    return jobs


def scrape_cisco_jobs():
    opportunities = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True
        )

        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            )
        )

        try:
            page.goto(
                CAREERS_URL,
                wait_until="domcontentloaded",
                timeout=120000
            )

            page.wait_for_timeout(15000)

            print("Title:", page.title())

            # ---------------------------------
            # FIRST SET OF VISIBLE JOBS
            # ---------------------------------

            first_jobs = extract_visible_jobs(page)

            print(
                "Initial Jobs Found:",
                len(first_jobs)
            )

            for job in first_jobs:
                opportunities[
                    job["job_id"]
                ] = job

            # ---------------------------------
            # TRY VIEW MORE ONCE
            # ---------------------------------

            try:
                view_more = page.get_by_text(
                    "View More",
                    exact=True
                )

                if view_more.count() > 0:

                    print(
                        "Loading additional Cisco jobs..."
                    )

                    view_more.first.click(
                        timeout=10000
                    )

                    page.wait_for_timeout(10000)

                    additional_jobs = (
                        extract_visible_jobs(page)
                    )

                    print(
                        "Jobs Visible After View More:",
                        len(additional_jobs)
                    )

                    for job in additional_jobs:
                        opportunities[
                            job["job_id"]
                        ] = job

            except Exception as e:
                print(
                    "Could not load additional jobs:",
                    str(e)[:100]
                )

        except Exception as e:
            print(
                "Cisco scraping failed:",
                e
            )

        finally:
            browser.close()

    return list(opportunities.values())


if __name__ == "__main__":

    jobs = scrape_cisco_jobs()

    print("\n==============================")
    print(
        "Total Unique Opportunities:",
        len(jobs)
    )
    print("==============================\n")

    for job in jobs:
        print(job)