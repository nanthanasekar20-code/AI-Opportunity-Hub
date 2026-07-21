from playwright.sync_api import sync_playwright
import re


BASE_URL = "https://apply.deloitte.com"
SEARCH_URL = (
    "https://apply.deloitte.com/en_US/careers/SearchJobs/"
)

MAX_PAGES = 2
JOBS_PER_PAGE = 10


def scrape_deloitte_jobs():
    opportunities = []
    seen_job_ids = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            )
        )

        try:
            for page_number in range(MAX_PAGES):

                offset = page_number * JOBS_PER_PAGE

                if offset == 0:
                    url = SEARCH_URL
                else:
                    url = (
                        SEARCH_URL
                        + "?jobRecordsPerPage=10"
                        + f"&jobOffset={offset}"
                    )

                print(
                    f"Scraping Deloitte page "
                    f"{page_number + 1}..."
                )

                page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=120000
                )

                page.wait_for_timeout(7000)

                print("Title:", page.title())

                job_links = page.locator(
                    "a[href*='/careers/JobDetail/']"
                )

                print(
                    "Job Links Found:",
                    job_links.count()
                )

                for i in range(job_links.count()):

                    try:
                        link = job_links.nth(i)

                        href = link.get_attribute("href")

                        if not href:
                            continue

                        match = re.search(
                            r"/JobDetail/.+/(\d+)/?$",
                            href
                        )

                        if not match:
                            continue

                        job_id = match.group(1)

                        if job_id in seen_job_ids:
                            continue

                        title = link.inner_text(
                            timeout=3000
                        ).strip()

                        title = " ".join(
                            title.split()
                        )

                        if not title:
                            continue

                        if href.startswith("/"):
                            href = BASE_URL + href

                        location = None
                        employer = None

                        # Deloitte places the company/location
                        # information close to the job link.
                        try:
                            parent = link.locator(
                                "xpath=parent::*"
                            )

                            parent_text = (
                                parent.inner_text(
                                    timeout=3000
                                )
                            )

                            lines = [
                                " ".join(line.split())
                                for line
                                in parent_text.splitlines()
                                if line.strip()
                            ]

                            # Usually:
                            #
                            # Job Title
                            # Deloitte US |
                            # Deloitte Consulting LLP |
                            # Location
                            #
                            if len(lines) >= 2:

                                details = None

                                for line in lines:

                                    if (
                                        line != title
                                        and "Deloitte"
                                        in line
                                    ):
                                        details = line
                                        break

                                if details:

                                    parts = [
                                        part.strip()
                                        for part
                                        in details.split("|")
                                        if part.strip()
                                    ]

                                    if len(parts) >= 2:
                                        employer = parts[-2]

                                    if len(parts) >= 1:
                                        location = parts[-1]

                                    # Prevent employer being
                                    # incorrectly used as location.
                                    if (
                                        location
                                        and "Deloitte"
                                        in location
                                    ):
                                        location = None

                        except Exception:
                            pass

                        # If parent wasn't enough, inspect a
                        # slightly larger surrounding container.
                        if not location:

                            try:
                                container = link.locator(
                                    "xpath=ancestor::*"
                                    "[self::li or self::div]"
                                    "[1]"
                                )

                                text = container.inner_text(
                                    timeout=3000
                                )

                                lines = [
                                    " ".join(line.split())
                                    for line
                                    in text.splitlines()
                                    if line.strip()
                                ]

                                for line in lines:

                                    if "|" not in line:
                                        continue

                                    if "Deloitte" not in line:
                                        continue

                                    parts = [
                                        part.strip()
                                        for part
                                        in line.split("|")
                                        if part.strip()
                                    ]

                                    if len(parts) >= 3:

                                        employer = parts[-2]
                                        location = parts[-1]

                                        break

                            except Exception:
                                pass

                        opportunities.append({
                            "title": title,
                            "type": "job",
                            "company": "Deloitte",
                            "location": location,
                            "source": "Deloitte Careers",
                            "official_url": href,
                            "deadline": None,
                            "job_id": job_id,
                            "employer": employer
                        })

                        seen_job_ids.add(job_id)

                    except Exception as e:

                        print(
                            "Skipping job:",
                            str(e)[:100]
                        )

                        continue

        except Exception as e:

            print(
                "Deloitte scraping failed:",
                e
            )

        finally:
            browser.close()

    return opportunities


if __name__ == "__main__":

    jobs = scrape_deloitte_jobs()

    print("\n==============================")
    print(
        "Total Opportunities:",
        len(jobs)
    )
    print("==============================\n")

    for job in jobs:
        print(job)