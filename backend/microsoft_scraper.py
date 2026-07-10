import time
import requests
from datetime import datetime, timezone


SEARCH_URL = "https://apply.careers.microsoft.com/api/pcsx/search"
BASE_URL = "https://apply.careers.microsoft.com"


SEARCH_KEYWORDS = [
    "artificial intelligence",
    "machine learning",
]


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


def fetch_microsoft_opportunities():

    all_jobs = {}

    for keyword in SEARCH_KEYWORDS:

        start = 0

        while True:

            # Be respectful to Microsoft's public endpoint
            time.sleep(3)

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

            # Handle rate limiting
            if response.status_code == 429:

                time.sleep(60)

                response = requests.get(
                    SEARCH_URL,
                    params=params,
                    timeout=30
                )

            # Stop this keyword if still rate limited
            if response.status_code == 429:
                break

            response.raise_for_status()

            data = response.json()

            positions = data["data"]["positions"]

            if not positions:
                break

            for job in positions:

                job_id = job.get("displayJobId")

                if not job_id:
                    continue

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

                is_ai_relevant = any(
                    term in searchable_text
                    for term in AI_TERMS
                )

                if not is_ai_relevant:
                    continue

                posted_timestamp = job.get(
                    "postedTs"
                )

                posted_date = None

                if posted_timestamp:

                    posted_date = datetime.fromtimestamp(
                        posted_timestamp,
                        tz=timezone.utc
                    ).strftime("%Y-%m-%d")

                position_url = job.get(
                    "positionUrl",
                    ""
                )

                title_lower = title.lower()

                if "intern" in title_lower:
                    opportunity_type = "Internship"
                else:
                    opportunity_type = "Job"

                opportunity = {
                    "title": title,
                    "type": opportunity_type,
                    "source": "Microsoft",
                    "official_url": BASE_URL + position_url,
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

                all_jobs[job_id] = opportunity

            if len(positions) < 10:
                break

            start += 10

    return list(all_jobs.values())