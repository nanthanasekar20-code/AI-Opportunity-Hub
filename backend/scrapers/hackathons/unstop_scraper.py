"""Unstop opportunity scraper.

Scrapes the opportunity cards listed on https://unstop.com. Selectors were
carried over as-is from the original prototype script and have not been
re-verified against the live site from this environment — if Unstop has
changed its markup, scrape_unstop() returns an empty list instead of
crashing the whole /api/opportunities/unstop endpoint.
"""

from playwright.sync_api import sync_playwright


<<<<<<< HEAD
def scrape_unstop(max_results: int = 20) -> list[dict]:
    opportunities: list[dict] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto("https://unstop.com", timeout=60000)
            page.wait_for_timeout(10000)

            cards = page.locator("a.image_card")
            count = min(cards.count(), max_results)

            for i in range(count):
                card = cards.nth(i)

                try:
                    title = card.locator("h3.double-wrap").inner_text().strip()
                except Exception:
                    title = ""

                try:
                    mode = card.locator("span").nth(0).inner_text().strip()
                except Exception:
                    mode = ""

                try:
                    price = card.locator("span").nth(1).inner_text().strip()
                except Exception:
                    price = ""

                try:
                    link = card.get_attribute("href") or ""
                    if link.startswith("/"):
                        link = "https://unstop.com" + link
                except Exception:
                    link = ""

                if not title:
                    continue

                opportunities.append({
                    "title": title,
                    "type": "Competition",
                    "source": "Unstop",
                    "mode": mode,
                    "price": price,
                    "official_url": link,
                })

            browser.close()

    except Exception as exc:
        print(f"[unstop_scraper] scrape failed, returning empty list: {exc}")
        return []

    return opportunities


if __name__ == "__main__":
    results = scrape_unstop()
    print(f"Fetched {len(results)} opportunities from Unstop")
    for r in results[:5]:
        print(r)
=======
def scrape_unstop_hackathons():
    opportunities = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        try:
            page = browser.new_page()

            page.goto(
                "https://unstop.com",
                wait_until="domcontentloaded",
                timeout=60000
            )

            page.wait_for_timeout(8000)

            print("Title:", page.title())

            cards = page.locator("a.image_card")

            total = cards.count()
            print(f"Total Cards: {total}")

            for i in range(total):

                print(f"Processing Card {i+1}/{total}")

                card = cards.nth(i)

                title = None
                mode = None
                price = None
                link = None

                # ---------- Title ----------
                try:
                    title_locator = card.locator("h3.double-wrap")
                    if title_locator.count() > 0:
                        title = title_locator.first.text_content()
                        if title:
                            title = title.strip()
                except Exception as e:
                    print("Title Error:", e)

                # ---------- Mode ----------
                try:
                    spans = card.locator("span")
                    if spans.count() > 0:
                        mode = spans.nth(0).text_content()
                        if mode:
                            mode = mode.strip()
                except Exception as e:
                    print("Mode Error:", e)

                # ---------- Price ----------
                try:
                    spans = card.locator("span")
                    if spans.count() > 1:
                        price = spans.nth(1).text_content()
                        if price:
                            price = price.strip()
                except Exception as e:
                    print("Price Error:", e)

                # ---------- Link ----------
                try:
                    link = card.get_attribute("href")
                    if link and link.startswith("/"):
                        link = "https://unstop.com" + link
                except Exception as e:
                    print("Link Error:", e)

                opportunities.append(
                    {
                        "title": title,
                        "type": "hackathon",
                        "company": "Unstop",
                        "location": mode,
                        "source": "Unstop",
                        "official_url": link,
                        "deadline": None,
                    }
                )

            return opportunities

        except Exception as e:
            print("Scraping Error:", e)
            return opportunities

        finally:
            browser.close()


if __name__ == "__main__":
    results = scrape_unstop_hackathons()

    print("\n==============================")
    print("Total Opportunities:", len(results))
    print("==============================\n")

    for item in results[:10]:
        print(item)
>>>>>>> b6d6a74d94452d0598d6f1e52019d22b31702729
