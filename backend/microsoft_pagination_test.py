import requests

SEARCH_URL = "https://apply.careers.microsoft.com/api/pcsx/search"

for start in [0, 10, 20]:

    params = {
        "domain": "microsoft.com",
        "query": "machine learning",
        "location": "",
        "start": start,
        "sort_by": "timestamp",
    }

    response = requests.get(
        SEARCH_URL,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()
    positions = data["data"]["positions"]

    print(f"\n========== START = {start} ==========")
    print("Jobs received:", len(positions))

    for job in positions:
        print(
            job.get("displayJobId"),
            "-",
            job.get("name")
        )