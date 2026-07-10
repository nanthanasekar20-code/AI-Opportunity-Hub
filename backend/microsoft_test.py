import requests
import time
import random
from datetime import datetime, timezone


SEARCH_URL = "https://apply.careers.microsoft.com/api/pcsx/search"
BASE_URL = "https://apply.careers.microsoft.com"


# For now, test only 2 keywords.
# We will add all AI/ML keywords after confirming rate limiting is handled.
SEARCH_KEYWORDS = [
    "artificial intelligence",
    "machine learning",
]


# Strong AI/ML terms used to filter irrelevant results
AI_TERMS = [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "generative ai",
    "genai",
    "data science",
    "data scientist",
    "computer vision",
    "natural language processing",
    "nlp",
    "llm",
    "applied scientist",
    "applied sciences",
    "ai researcher",
    "ml architect",
    "coreai",
]


all_jobs = {}


for keyword in SEARCH_KEYWORDS:

    print("\n================================")
    print(f"Searching: {keyword}")
    print("================================")

    start = 0

    while True:

        # Wait before every request
        wait_time = random.uniform(2.5, 4.5)

        print(f"\nWaiting {wait_time:.1f} seconds...")
        time.sleep(wait_time)


        params = {
            "domain": "microsoft.com",
            "query": keyword,
            "location": "",
            "start": start,
            "sort_by": "timestamp",
        }


        response = requests.get(
            SEARCH_URL,
            params=params,
            timeout=30
        )


        # Handle Microsoft's rate limit
        if response.status_code == 429:

            print("Rate limited by Microsoft.")
            print("Waiting 60 seconds before retrying...")

            time.sleep(60)

            response = requests.get(
                SEARCH_URL,
                params=params,
                timeout=30
            )


        # Stop if the retry still fails
        if response.status_code == 429:

            print("Still rate limited.")
            print("Stopping this keyword for now.")

            break


        response.raise_for_status()


        data = response.json()

        positions = data["data"]["positions"]


        print(
            f"Page start={start}: "
            f"{len(positions)} jobs received"
        )


        # No more jobs
        if not positions:
            print("No more results.")
            break


        for job in positions:

            job_id = job.get("displayJobId")


            # Skip jobs without an ID
            if not job_id:
                continue


            # Skip duplicate jobs
            if job_id in all_jobs:
                continue


            title = job.get("name", "")

            category = job.get(
                "department",
                ""
            )


            searchable_text = (
                f"{title} {category}"
            ).lower()


            # Check AI/ML relevance
            is_ai_relevant = any(
                term in searchable_text
                for term in AI_TERMS
            )


            # Skip irrelevant jobs
            if not is_ai_relevant:
                continue


            # Convert timestamp to readable date
            posted_timestamp = job.get(
                "postedTs"
            )


            posted_date = None


            if posted_timestamp:

                posted_date = datetime.fromtimestamp(
                    posted_timestamp,
                    tz=timezone.utc
                ).strftime("%Y-%m-%d")


            # Build official Microsoft job URL
            position_url = job.get(
                "positionUrl",
                ""
            )


            official_url = (
                BASE_URL + position_url
            )


            # Detect internship
            title_lower = title.lower()


            if "intern" in title_lower:

                opportunity_type = "Internship"

            else:

                opportunity_type = "Job"


            opportunity = {

                "title": title,

                "type": opportunity_type,

                "source": "Microsoft",

                "official_url": official_url,

                "job_id": job_id,

                "location": job.get(
                    "locations",
                    []
                ),

                "posted_date": posted_date,

                "category": category,

                "work_mode": job.get(
                    "workLocationOption"
                ),
            }


            # Store using Job ID
            # This automatically removes duplicates
            all_jobs[job_id] = opportunity


        # Microsoft currently returns 10 per page.
        # Fewer than 10 means we reached the last page.
        if len(positions) < 10:

            print("Reached final page.")

            break


        # Go to next page
        start += 10


# Convert dictionary to list
opportunities = list(
    all_jobs.values()
)


# Separate jobs and internships
jobs = [

    opportunity

    for opportunity in opportunities

    if opportunity["type"] == "Job"
]


internships = [

    opportunity

    for opportunity in opportunities

    if opportunity["type"] == "Internship"
]


# Final summary
print("\n\n================================")
print("FINAL RESULTS")
print("================================")

print(
    "TOTAL AI/ML OPPORTUNITIES:",
    len(opportunities)
)

print(
    "JOBS:",
    len(jobs)
)

print(
    "INTERNSHIPS:",
    len(internships)
)


# Print collected opportunities
for opportunity in opportunities:

    print("\n--------------------------------")

    print(
        "Title:",
        opportunity["title"]
    )

    print(
        "Type:",
        opportunity["type"]
    )

    print(
        "Job ID:",
        opportunity["job_id"]
    )

    print(
        "Category:",
        opportunity["category"]
    )

    print(
        "Location:",
        opportunity["location"]
    )

    print(
        "Posted:",
        opportunity["posted_date"]
    )

    print(
        "Official URL:",
        opportunity["official_url"]
    )