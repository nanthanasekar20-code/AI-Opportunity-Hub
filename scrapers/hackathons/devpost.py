from playwright.sync_api import sync_playwright
import pandas as pd

data = []

with sync_playwright() as p:

    browser = p.chromium.launch(headless=False)

    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
    )

    page = context.new_page()

    page.goto(
        "https://devpost.com/hackathons",
        wait_until="domcontentloaded",
        timeout=120000
    )

    page.wait_for_timeout(8000)

    cards = page.locator("div.hackathon-tile")

    print("Total Hackathons:", cards.count())

    for i in range(cards.count()):

        card = cards.nth(i)

        try:
            title = card.locator("h3").inner_text().strip()
        except:
            title = ""

        try:
            organization = card.locator(".host-label").inner_text().strip()
        except:
            organization = ""

        try:
            deadline = card.locator(".submission-period").inner_text().strip()
        except:
            deadline = ""

        try:
            status = card.locator(".status-label").inner_text().strip()
        except:
            status = ""

        try:
            location = card.locator(".info span").first.inner_text().strip()
        except:
            location = ""

        try:
            link = card.locator("a.tile-anchor").get_attribute("href")
        except:
            link = ""

        print("--------------------------------")
        print("Title :", title)
        print("Organization :", organization)
        print("Deadline :", deadline)
        print("Status :", status)
        print("Location :", location)
        print("Link :", link)

        data.append({
            "Title": title,
            "Organization": organization,
            "Deadline": deadline,
            "Status": status,
            "Location": location,
            "Source": "Devpost",
            "Link": link
        })

df = pd.DataFrame(data)

print("\n========== FIRST 10 HACKATHONS ==========\n")
print(df.head(10))

df.to_csv("devpost.csv", index=False)

print("\n✅ devpost.csv saved successfully!")