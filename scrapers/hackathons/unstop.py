from playwright.sync_api import sync_playwright
import pandas as pd

data = []

with sync_playwright() as p:

    browser = p.chromium.launch(headless=False)

    page = browser.new_page()

    # Open Unstop
    page.goto("https://unstop.com", timeout=60000)

    # Wait for page to load
    page.wait_for_timeout(10000)

    print("Title:", page.title())

    # Opportunity cards
    cards = page.locator("a.image_card")

    print("Total Cards:", cards.count())

    for i in range(cards.count()):

        card = cards.nth(i)

        # Title
        try:
            title = card.locator("h3.double-wrap").inner_text().strip()
        except:
            title = ""

        # Mode
        try:
            mode = card.locator("span").nth(0).inner_text().strip()
        except:
            mode = ""

        # Price
        try:
            price = card.locator("span").nth(1).inner_text().strip()
        except:
            price = ""

        # Link
        try:
            link = card.get_attribute("href")
            if link and link.startswith("/"):
                link = "https://unstop.com" + link
        except:
            link = ""

        print("--------------------------------")
        print("Title :", title)
        print("Mode  :", mode)
        print("Price :", price)
        print("Link  :", link)

        data.append({
            "Title": title,
            "Mode": mode,
            "Price": price,
            "Source": "Unstop",
            "Link": link
        })

# Save CSV
df = pd.DataFrame(data)

print("\n========== FIRST 10 OPPORTUNITIES ==========\n")
print(df.head(10))

df.to_csv("unstop.csv", index=False)

print("\n✅ unstop.csv saved successfully!")