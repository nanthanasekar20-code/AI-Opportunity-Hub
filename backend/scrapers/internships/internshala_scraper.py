from playwright.sync_api import sync_playwright
import pandas as pd

data = []

with sync_playwright() as p:

    browser = p.chromium.launch(headless=False)

    page = browser.new_page()

    page.goto("https://internshala.com/internships")

    # Wait for the page to load
    page.wait_for_timeout(8000)

    # Get all internship cards
    cards = page.locator("div.individual_internship")

    print("Total Cards:", cards.count())

    for i in range(cards.count()):

        card = cards.nth(i)

        # Internship Title
        try:
            title = card.locator("a.job-title-href").inner_text().strip()
        except:
            title = ""

        # Company Name
        try:
            company = card.locator("p.company-name").inner_text().strip()
        except:
            company = ""

        # Location
        try:
            location = card.locator("div.locations a").inner_text().strip()
        except:
            location = ""

        # Stipend
        try:
            stipend = card.locator("span.stipend").inner_text().strip()
        except:
            stipend = ""

        # Duration
        try:
            duration = card.locator("div.row-1-item").nth(2).locator("span").inner_text().strip()
        except:
            duration = ""

        # Apply Link
        try:
            link = card.locator("a.job-title-href").get_attribute("href")
            if link:
                link = "https://internshala.com" + link
            else:
                link = ""
        except:
            link = ""

        # Save data
        data.append({
            "Title": title,
            "Company": company,
            "Location": location,
            "Stipend": stipend,
            "Duration": duration,
            "Source": "Internshala",
            "Link": link
        })

# Convert to DataFrame
df = pd.DataFrame(data)

# Save CSV
df.to_csv("internships.csv", index=False)

print("\n========== FIRST 10 INTERNSHIPS ==========\n")
print(df.head(10))

print("\n✅ internships.csv saved successfully!")

