import subprocess
import csv
import io
from datetime import datetime

# Fetch competitions from Kaggle API
result = subprocess.run(
    ["kaggle", "competitions", "list", "--csv"],
    capture_output=True,
    text=True
)

# Check for errors
if result.returncode != 0:
    print("ERROR:")
    print(result.stderr)
    exit()

# Read CSV data returned by Kaggle
reader = csv.DictReader(io.StringIO(result.stdout))

active_competitions = []

current_time = datetime.now()

for competition in reader:

    deadline = datetime.strptime(
        competition["deadline"],
        "%Y-%m-%d %H:%M:%S"
    )

    # Keep only competitions whose deadline has not passed
    if deadline > current_time:

        active_competitions.append({
            "title": competition["ref"].split("/")[-1]
                .replace("-", " ")
                .title(),

            "type": "Competition",

            "source": "Kaggle",

            "official_url": competition["ref"],

            "deadline": competition["deadline"],

            "category": competition["category"],

            "reward": competition["reward"],

            "team_count": competition["teamCount"]
        })


print("\n======================================")
print("   ACTIVE KAGGLE COMPETITIONS")
print("======================================\n")

print(f"Total active competitions found: {len(active_competitions)}\n")

for competition in active_competitions:

    print("TITLE:", competition["title"])
    print("DEADLINE:", competition["deadline"])
    print("CATEGORY:", competition["category"])
    print("REWARD:", competition["reward"])
    print("URL:", competition["official_url"])

    print("--------------------------------------")