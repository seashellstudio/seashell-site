# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Seashell Studio is a static marketing/landing website (HTML + CSS + vanilla JS). There is no build step, no package manager, and no test framework. External dependencies (Supabase JS, Google Fonts) are loaded via CDN.

### Running the dev server
Serve the site with any static HTTP server:
```
python3 -m http.server 8080 --directory /workspace
```
The site is then available at `http://localhost:8080`.

### Key files
- `index.html` — main page with 5-step onboarding wizard
- `thank-you.html` — post-submission confirmation page
- `main.js` — all application logic
- `style.css`, `style-step12.css`, `style-step35.css` — stylesheets
- `assets/` — images (logo, background)

### Notes
- No lint, test, or build commands exist. There is no `package.json`.
- Form submission writes to a hosted Supabase instance (URL and anon key are hardcoded in `main.js`). No local database setup is needed.
- Internet access is required for CDN-hosted libraries (Supabase JS client, Google Fonts, Material Icons).
