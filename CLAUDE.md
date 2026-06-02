# Seashell Studio — Instructions for Claude

## Required reading before any edit

**Before modifying any HTML, CSS, or JS in this project, read [docs/Site-guidelines.md](docs/Site-guidelines.md) in full.**

That document is the source of truth for the site's design system — colors, typography, layout rules, viewport constraints, component patterns, and behavior across desktop and mobile. Every edit must respect it.

If a requested change would violate a guideline, surface that conflict with the user before implementing — don't silently override the guideline.

## Keeping the guidelines current

Site-guidelines.md must stay in sync with the actual site. When any of the following happen during a session, update the relevant section of the document in the same commit as the code change:

- A new color, font, spacing token, or design variable is introduced
- A component is added, renamed, removed, or restructured
- A layout rule changes (breakpoints, viewport behavior, grid structure)
- A new page or major view is added
- An accessibility or responsive-behavior decision is made

Do not let the guidelines drift. If you notice the document is already stale relative to the code, flag it to the user.

## Project structure

```
Seashell_studio_website/
├── index.html              Main page (landing + 5-step onboarding form)
├── thank-you.html          Confirmation page after form submission
├── main.js                 All client-side logic (navigation, state, validation)
├── styles/
│   ├── main.css            Base styles, variables, landing page, global
│   ├── onboarding-steps-1-2.css
│   ├── onboarding-steps-3-5.css
│   └── mobile.css          Mobile-specific overrides (<1060px)
├── assets/                 Images used on the live site
├── docs/                   Planning docs, wireframes, Site-guidelines.md
├── supabase/
│   └── functions/send-onboarding-email/index.ts   Deno Edge Function — sends confirmation emails via Resend
├── dev-tools/              Playwright test scripts (not deployed)
└── .vercel/                Deployment config — do not modify
```

## About the user

The owner of this project does not code and relies entirely on AI assistants to build and maintain the site. When explaining changes:

- Use plain English, not jargon
- Describe *what* changed on the page, not just *which file* changed
- Call out any risk before taking destructive actions (deletes, renames, major refactors)
- Never make infrastructure or dependency changes without explicit approval

## Stack

Vanilla HTML/CSS/JS — no framework, no build step. Hosted on Vercel. Playwright is available in `dev-tools/` for screenshot/layout audits.

**Windows note:** PowerShell script execution is disabled. Use `cmd /c npm` and `cmd /c npx` instead of `npm`/`npx` directly.

Deploy by pushing to git — Vercel auto-deploys on push to main. Git root is this directory (`Seashell_studio_website/`) — run all `git` commands here.

## Hard constraints — non-negotiable

- **No page scrolls — ever.** Fixed-viewport application. If content overflows, shrink it (smaller fonts, tighter gaps). Never add `overflow: scroll/auto` to fix overflow — fix the layout.
- **Mobile breakpoint is 1060px.** Desktop = sidebar on the left. Mobile = top progress bar, no sidebar.
- **`transform: scale()` is mobile-only.** Never apply on desktop to onboarding content. Never apply to elements using `width: 100%`, `clamp()`, or fluid grids.
- **`main.css` has two `@media (min-width: 1060px)` blocks.** For Step 4 desktop rules, both blocks must be updated — the second wins the cascade. Always grep for any selector in both blocks before editing.
- **Required step DOM chain** (never skip or reorder layers):
  ```
  .step-container > .step-mobile-fit-viewport > .step-mobile-fit-content > .container-inner > .step-shell > .step-header + <content>
  ```
  No per-step padding overrides on `.step-shell` or `.step-container`. One `.container-inner` level only.

## Running locally

```bash
# From this directory:
cmd /c npx serve . -p 8000

# From dev-tools/:
cmd /c npm install
node capture_screens.js              # desktop + mobile screenshots for all 5 steps
node mobile-onboarding-audit.cjs     # mobile layout audit with DOMRect measurements
node step-header-alignment-audit.cjs # step header spacing ratio verification
node verify-glow.js                  # glow effect verification
cmd /c npx playwright test                  # full test suite (7 tests)
cmd /c npx playwright test -g "step 1"     # single test by name

# Targeted step screenshot (change navigateToStep number):
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(4)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/check.png' }); await browser.close(); })();"
```

## Step 5 Backend

Step 5 submits to Supabase (`onboarding_submissions` table) via the JS client loaded from CDN. On success, a summary is written to `sessionStorage` and the user is redirected to `thank-you.html`, which reads that summary to display a confirmation card. `thank-you.html` is standalone — its CSS is self-contained `<style>` tags, no shared stylesheets. The upload box on Step 5 uploads files to Supabase Storage (`brand-assets` bucket); public URLs are stored in the `brand_assets text[]` column on `onboarding_submissions`.

**Email automation (partially set up):** `supabase/functions/send-onboarding-email/index.ts` is a Deno Edge Function that sends a client confirmation and a Tyler notification via Resend. Full wiring (RESEND_API_KEY secret + pg_net trigger) is tracked in `docs/superpowers/plans/2026-05-22-resend-onboarding-email.md`. Check that plan's checkbox state before assuming emails are live. **No Stripe integration.**
