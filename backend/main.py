import subprocess
import csv
import io
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from microsoft_scraper import fetch_microsoft_opportunities
from scrapers.hackathons.devpost_scraper import scrape_devpost
from scrapers.hackathons.unstop_scraper import scrape_unstop
from scrapers.internships.internshala_scraper import scrape_internshala
from scrapers.jobs.google_scraper import scrape_google_jobs

load_dotenv()

app = FastAPI(
    title="AI Opportunity Hub API",
    description="Backend API for AI Opportunity Hub",
    version="1.0.0"
)


# Allow the React frontend to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AI Opportunity Hub backend is running"
    }


@app.get("/api/opportunities/kaggle")
def get_kaggle_competitions():

    result = subprocess.run(
        ["kaggle", "competitions", "list", "--csv"],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return {
            "error": "Could not fetch Kaggle competitions",
            "details": result.stderr
        }

    reader = csv.DictReader(io.StringIO(result.stdout))

    active_competitions = []

    current_time = datetime.now()

    for competition in reader:

        deadline = datetime.strptime(
            competition["deadline"],
            "%Y-%m-%d %H:%M:%S"
        )

        if deadline > current_time:

            active_competitions.append({
                "title": competition["ref"]
                    .split("/")[-1]
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

    return {
        "source": "Kaggle",
        "count": len(active_competitions),
        "opportunities": active_competitions
    }


@app.get("/api/opportunities/microsoft")
def get_microsoft_opportunities():

    opportunities = fetch_microsoft_opportunities()

    return {
        "source": "Microsoft",
        "count": len(opportunities),
        "opportunities": opportunities
    }


@app.get("/api/opportunities/devpost")
def get_devpost_hackathons():

    opportunities = scrape_devpost()

    return {
        "source": "Devpost",
        "count": len(opportunities),
        "opportunities": opportunities
    }


@app.get("/api/opportunities/unstop")
def get_unstop_opportunities():

    opportunities = scrape_unstop()

    return {
        "source": "Unstop",
        "count": len(opportunities),
        "opportunities": opportunities
    }


@app.get("/api/opportunities/internshala")
def get_internshala_internships():

    opportunities = scrape_internshala()

    return {
        "source": "Internshala",
        "count": len(opportunities),
        "opportunities": opportunities
    }


@app.get("/api/opportunities/google")
def get_google_jobs():

    opportunities = scrape_google_jobs()

    return {
        "source": "Google",
        "count": len(opportunities),
        "opportunities": opportunities
    }