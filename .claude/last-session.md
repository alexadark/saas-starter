# Last Session TLDR
Date: 2026-05-14 08:56
Session ID: d5349143

## Request
The user decided to create a new "anti-clickwork" SaaS starter based on Convex, Better Auth, and TanStack Start, moving away from the previous Supabase/Postgres setup to simplify backend management and security for a non-technical profile.

## Investigated
*   Convex limitations (aggregations, geospatial, file size): Found official components (`@convex-dev/aggregate`, geospatial) and 16MB transaction limits that mitigate initial concerns.
*   Convex pricing: Confirmed it uses a hard cap (no surprise bills) and efficient query caching (100 users = 1 function call for shared data).
*   Auth providers: Compared Clerk (expensive/dashboard-heavy) vs. Better Auth (code-first/free).
*   SaaS Starters: Evaluated "NowStack" (Melvynx) and public repos like `dyeoman2/tanstack-start-template`.
*   Frameworks: Compared React Router 7 vs. TanStack Start on "agent comfort" (types, LLM support).

## Learned
*   Convex + Better Auth + TanStack Start is the optimal "code-first" stack for users who don't want to use dashboards.
*   Polar.sh is highly programmable via API and MCP, making it a better "Merchant of Record" choice than Stripe for this profile.
*   Trigger.dev v3 is more cost-effective than Inngest for AI-heavy workflows due to task-based pricing.
*   The RIFF framework's `/riff:start` pipeline was skipped and needs to be properly executed to ensure architectural safety (adversarial review).

## Completed
*   Created new directory: `~/DEV/frameworks/convex-starter/`.
*   Initialized `CLAUDE.md` with resolved technical decisions (TanStack Start, Polar, Resend, etc.).
*   Drafted a preliminary `ROADMAP.yaml` and `STATE.md`.
*   Symlinked RIFF framework skills and agents into the new project.

## Next steps
*   Move the draft `ROADMAP.yaml` to `.planning/seeds/seed-roadmap.yaml` to avoid conflicts with the official pipeline.
*   Run `/riff:start` to begin the formal discovery and architectural design phase.
*   Complete Stage 1 (Project Discovery) and Stage 2 (Data Model & Architecture) of the RIFF pipeline.
*   Undergo the "Codex Adversarial Review" to validate the architecture before coding.
*   Scaffold the Foundation phase (TanStack Start + Convex + Better Auth).
