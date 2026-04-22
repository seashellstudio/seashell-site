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

## What is not yet built

The onboarding form is functional on the frontend but does not submit data anywhere. No backend, no Supabase wiring, no Stripe, no email automation. Do not assume these exist.
