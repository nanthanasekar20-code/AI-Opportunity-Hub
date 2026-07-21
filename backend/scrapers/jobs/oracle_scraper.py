from playwright.sync_api import sync_playwright
import re


def scrape_oracle_jobs():
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
                "https://careers.oracle.com/en/sites/jobsearch/jobs",
                wait_until="domcontentloaded",
                timeout=120000
            )

            page.wait_for_timeout(15000)

            print("Title:", page.title())

            # Only direct Oracle job-detail links such as:
            # /en/sites/jobsearch/job/340196
            job_links = page.locator(
                "a[href*='/sites/jobsearch/job/']"
            )

            print("Direct Job Links:", job_links.count())

            seen_urls = set()

            for i in range(job_links.count()):

                link_element = job_links.nth(i)

                try:
                    href = link_element.get_attribute("href")

                    if not href:
                        continue

                    # Make sure this is an actual numbered job URL
                    if not re.search(r"/job/\d+", href):
                        continue

                    if href.startswith("/"):
                        href = "https://careers.oracle.com" + href

                    if href in seen_urls:
                        continue

                    seen_urls.add(href)

                    # Oracle's <a> itself has no visible text.
                    # Get text from the nearest surrounding job container.
                    container = link_element.locator(
                        "xpath=ancestor::li[1]"
                    )

                    if container.count() == 0:
                        container = link_element.locator(
                            "xpath=ancestor::*[contains(@class,'job')][1]"
                        )

                    if container.count() == 0:
                        continue

                    try:
                        raw_text = container.inner_text(
                            timeout=3000
                        ).strip()
                    except Exception:
                        continue

                    lines = [
                        line.strip()
                        for line in raw_text.splitlines()
                        if line.strip()
                    ]

                    if not lines:
                        continue

                    # Remove common labels that are not title/location
                    ignored = {
                        "BE THE FIRST TO APPLY",
                        "HOT JOB",
                        "TRENDING"
                    }

                    clean_lines = [
                        line
                        for line in lines
                        if line.upper() not in ignored
                    ]

                    if not clean_lines:
                        continue

                    # Usually first useful line = title
                    title = clean_lines[0]

                    # Usually second useful line = location
                    location = (
                        clean_lines[1]
                        if len(clean_lines) > 1
                        else None
                    )

                    # Skip obvious non-job cards
                    if title.lower() in {
                        "jobs",
                        "events",
                        "oracle talent network",
                        "join our network",
                        "join now"
                    }:
                        continue

                    opportunities.append({
                        "title": title,
                        "type": "job",
                        "company": "Oracle",
                        "location": location,
                        "source": "Oracle Careers",
                        "official_url": href,
                        "deadline": None
                    })

                except Exception as e:
                    print(
                        f"Skipping job link {i + 1}:",
                        str(e)[:100]
                    )
                    continue

        except Exception as e:
            print("Oracle scraping failed:", e)

        finally:
            browser.close()

    return opportunities


if __name__ == "__main__":

    jobs = scrape_oracle_jobs()

    print("\n==============================")
    print("Total Opportunities:", len(jobs))
    print("==============================\n")

    for job in jobs[:10]:
        print(job)