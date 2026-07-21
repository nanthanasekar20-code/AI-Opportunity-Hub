from playwright.sync_api import sync_playwright
import re


def scrape_nvidia_jobs():
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
                "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite",
                wait_until="domcontentloaded",
                timeout=120000
            )

            page.wait_for_timeout(15000)

            print("Title:", page.title())

            job_links = page.locator("a[href*='/job/']")

            print("Job Links Found:", job_links.count())

            seen_urls = set()

            for i in range(job_links.count()):
                link_element = job_links.nth(i)

                try:
                    href = link_element.get_attribute("href")

                    if not href:
                        continue

                    # Only actual NVIDIA Workday job links
                    if "/NVIDIAExternalCareerSite/job/" not in href:
                        continue

                    if href.startswith("/"):
                        href = (
                            "https://nvidia.wd5.myworkdayjobs.com"
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

                    # Normalize unusual spaces such as \xa0
                    title = " ".join(title.split())

                    location = None
                    posted_on = None
                    job_id = None

                    # Workday job information is stored in the
                    # surrounding list item
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

                            # Find posting information
                            for line in lines:
                                if line.lower().startswith("posted "):
                                    posted_on = line

                                if re.fullmatch(
                                    r"JR\d+",
                                    line,
                                    re.IGNORECASE
                                ):
                                    job_id = line

                            # Workday structure normally places
                            # location after the "locations" label
                            for index, line in enumerate(lines):
                                if (
                                    line.lower() == "locations"
                                    and index + 1 < len(lines)
                                ):
                                    location = lines[index + 1]
                                    break

                        except Exception:
                            pass

                    # Fallback: extract job ID directly from URL
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
                        "company": "NVIDIA",
                        "location": location,
                        "source": "NVIDIA Careers",
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
            print("NVIDIA scraping failed:", e)

        finally:
            browser.close()

    return opportunities


if __name__ == "__main__":
    jobs = scrape_nvidia_jobs()

    print("\n==============================")
    print("Total Opportunities:", len(jobs))
    print("==============================\n")

    for job in jobs[:10]:
        print(job)