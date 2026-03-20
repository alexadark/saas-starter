# Bug Report -- saas-starter

**Assessment Date:** 2026-03-07
**Total Bugs:** 1 (Critical: 0, High: 0, Medium: 1, Low: 0)

---

## Medium

### BUG-001: Flow "Authenticated Dashboard Access" step 4: Render dashboard shell: header with app name + sign out button, main with welcome message

- **Route:** GET /dashboard
- **Domain:** Authenticated Dashboard Access
- **Category:** functionality
- **Verdict:** PARTIAL
- **Evidence:**
  - `app/routes/dashboard/_index.tsx:31` -- <h1 className="text-lg font-semibold">Dashboard</h1>
  - `app/routes/dashboard/_index.tsx:33` -- <Button type="submit" variant="outline" size="sm">
    Sign out
    </Button>
- **Reasoning:** The header contains a sign-out button and a main section with a welcome message, but the header title is 'Dashboard' rather than the application name ('SaaS Starter' as seen in auth-layout.tsx), so the 'app name' aspect of the claim does not fully match.
