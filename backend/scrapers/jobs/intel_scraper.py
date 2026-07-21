from playwright.sync_api import sync_playwright
import re


def scrape_intel_jobs():
    opportunities = []

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
            page.goto(
                "https://intel.wd1.myworkdayjobs.com/en-US/External",
                wait_until="domcontentloaded",
                timeout=120000
            )

            page.wait_for_timeout(15000)

            print("Title:", page.title())

            job_links = page.locator(
                "a[href*='/External/job/']"
            )

            print("Job Links Found:", job_links.count())

            seen_urls = set()

            for i in range(job_links.count()):
                link_element = job_links.nth(i)

                try:
                    href = link_element.get_attribute("href")

                    if not href:
                        continue

                    if "/External/job/" not in href:
                        continue

                    if href.startswith("/"):
                        href = (
                            "https://intel.wd1.myworkdayjobs.com"
                            + href
                        )

                    if href in seen_urls:
                        continue

                    seen_urls.add(href)

                    title = link_element.inner_text(
                        timeout=3000
                    ).strip()

                    if not title:
                        continue

                    title = " ".join(title.split())

                    location = None
                    posted_on = None
                    job_id = None

                    # Find surrounding Workday job card
                    card = link_element.locator(
                        "xpath=ancestor::li[1]"
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

                            # Extract location
                            for index, line in enumerate(lines):

                                if (
                                    line.lower() == "locations"
                                    and index + 1 < len(lines)
                                ):
                                    location = lines[index + 1]
                                    break

                            # Extract posting information
                            for line in lines:

                                if line.lower().startswith(
                                    "posted "
                                ):
                                    posted_on = line

                            # Intel sometimes combines:
                            # "Spotlight JobJR0285437"
                            # rather than placing JR ID alone.
                            for line in lines:

                                match = re.search(
                                    r"(JR\d+)",
                                    line,
                                    re.IGNORECASE
                                )

                                if match:
                                    job_id = match.group(1)
                                    break

                        except Exception:
                            pass

                    # Fallback: extract job ID from URL
                    if not job_id:

                        match = re.search(
                            r"(JR\d+)",
                            href,
                            re.IGNORECASE
                        )

                        if match:
                            job_id = match.group(1)

                    opportunities.append({
                        "title": title,
                        "type": "job",
                        "company": "Intel",
                        "location": location,
                        "source": "Intel Careers",
                        "official_url": href,
                        "deadline": None,
                        "posted_on": posted_on,
                        "job_id": job_id
                    })

                except Exception as e:

                    print(
                        f"Skipping job {i + 1}:",
                        str(e)[:100]
                    )

                    continue

        except Exception as e:

            print(
                "Intel scraping failed:",
                e
            )

        finally:
            browser.close()

    return opportunities


if __name__ == "__main__":

    jobs = scrape_intel_jobs()

    print("\n==============================")
    print("Total Opportunities:", len(jobs))
    print("==============================\n")

    for job in jobs[:10]:
        print(job)