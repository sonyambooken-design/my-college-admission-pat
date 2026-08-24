# My College Admission Path — Website Update

This is the GitHub-ready Next.js version of **MyCollegeAdmissionPath.com**.

## What changed

- Home location can be entered as a **ZIP code or city/state**.
- Optional **Use current location** button (browser permission required).
- Radius options: 50, 100, 150, 200, 300, or 500 miles.
- College Scorecard search uses the selected ZIP and radius.
- SAT, GPA, budget, broad area, radius, and home location feed the recommendation model.
- The Discover page now shows the **Top 20 recommended colleges in a table**.
- Table includes fit score, admission planning label, distance, average SAT, acceptance rate, average net price, graduation rate, enrollment, and Save control.
- Pre-Med/Healthcare, Business, Engineering, CS/AI and Nursing try a College Scorecard CIP/program filter. If it returns too few schools, the app broadens the pool and clearly tells the user.
- Small footer attribution: **Created by S. Ambooken**.

## Important methodology note

`Likely / Target / Reach / High Reach` and the 0–100 Fit Score are **planning heuristics**, not admission probabilities or guarantees. GPA is weighted lightly because high schools use different weighted/unweighted scales.

## Vercel environment variables

Add these under **Vercel → Project → Settings → Environment Variables**:

```text
COLLEGE_SCORECARD_API_KEY=...
OPENAI_API_KEY=...                  # optional for Advisor
OPENAI_MODEL=gpt-5.2               # optional
NEXT_PUBLIC_SUPABASE_URL=...        # for the next login/persistence step
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Do not put real API keys in GitHub.

## Upload to GitHub

Upload the CONTENTS of this folder to the repository root. The repository should show `app/`, `lib/`, `package.json`, etc. at the top level — not another nested `my-college-admission-path` directory.

Then connect the GitHub repository to your existing Vercel project and set `main` as the production branch.

## Local test

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Data sources

Institution metrics are requested from the U.S. Department of Education College Scorecard API. Location lookup uses OpenStreetMap Nominatim to resolve a user-entered U.S. location to a ZIP/coordinate center. For a high-volume commercial launch, replace Nominatim with a production geocoding provider or an appropriately provisioned service.

## Student Discovery / Major & Career Recommender
The **Discover My Major** tab now collects 25+ signals across interests/work style, AP/IB/Honors courses, clubs, leadership roles, sports, community service, work/internships/projects, education tolerance, and career priorities. It returns Top 5 majors, Top 5 career paths, explainable fit reasons, backup-career strength, and suggested courses/activities to explore next.
