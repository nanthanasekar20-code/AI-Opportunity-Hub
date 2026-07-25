from db.supabase_client import supabase

CATEGORY_MAP = {
    "Internship": "8d2b69ba-d5c9-4610-9ddd-e184b5b762e5",   # AI Internships
    "Job": "c5a150d8-062f-4370-b6d9-f7a6f0011a65",           # AI Jobs
    "Research": "dc085b6e-5a0d-4db4-91c2-58f8d56c0787",      # Research Opportunities
    "Hackathon": "4cceae5e-fc2f-4f64-87a0-375cd2b674ab",     # Hackathons
    "Competition": "139209a7-6b4b-44c5-bcc8-c81e8477d0c1",   # Competitions
    "Fellowship": "0587cdfd-d337-4532-be0c-84b4228c8285",    # Fellowships
    "Workshop": "c5074ca4-bfc4-418d-aa12-0f94a7e58425",      # Workshops
    "Conference": "b69191fe-8202-4739-bdb9-332861fcb76c",    # Conferences
    "Scholarship": "d3aedcca-b99b-400c-8221-db1a8e661cad",   # Scholarships
}


def insert_opportunities(raw_items: list[dict]) -> dict:
    """
    Takes raw scraper output (varied field names) and inserts into the
    opportunities table, skipping anything whose apply_url already exists.
    Returns a summary of what happened.
    """
    inserted, skipped, failed = 0, 0, 0

    for item in raw_items:
        apply_url = item.get("official_url") or item.get("apply_url") or ""
        title = item.get("title", "").strip()

        if not title or not apply_url:
            failed += 1
            continue

        # Skip if this exact URL is already in the table
        existing = (
            supabase.table("opportunities")
            .select("id")
            .eq("apply_url", apply_url)
            .execute()
        )
        if existing.data:
            skipped += 1
            continue

        row = {
            "title": title,
            "company": item.get("organization") or item.get("company") or "Unknown",
            "location": item.get("location") or None,
            "type": item.get("type") or "Other",
            "apply_url": apply_url,
            "deadline":  None,
            "is_active": True,
            "category_id": CATEGORY_MAP.get(item.get("type"), None),
        }

        try:
            supabase.table("opportunities").insert(row).execute()
            inserted += 1
        except Exception as exc:
            print(f"[insert_opportunities] failed to insert '{title}': {exc}")
            failed += 1

    return {"inserted": inserted, "skipped": skipped, "failed": failed}