# Seashell Studio Onboarding Wireframe Alignment Plan

## Summary
- Use your wireframes as the **mobile source of truth** for onboarding steps 1-5, while preserving the current premium visual language on desktop with lighter adaptation.
- The implementation should focus first on a **shared placement system** so headings, subheadings, content bands, and bottom actions sit in the same relative positions across steps, then apply step-specific restructuring for the denser Step 4 and Step 5 layouts.
- Visual thesis: refined dark editorial UI, but with stricter spatial discipline and cleaner rhythm between steps.
- Content plan: persistent mobile progress shell, fixed header band, fixed body bands, fixed action band.
- Interaction thesis: keep existing restrained glow/selection states, add only subtle transitions tied to selection and step changes.

## Key Changes
- Build a shared **mobile onboarding frame** used by all five steps:
  - top reserved zone for progress bar
  - fixed header zone for title + subtitle
  - middle content zone with step-specific layouts
  - bottom reserved zone for back/next container
- Normalize the first three steps to the same mobile structure from `Wireframe 1.png`:
  - Step 1: header band, palette content band, mode-selection content band
  - Step 2: header band, font-list content band, preview/content band
  - Step 3: header band, section-selector content band, preview/content band
- Rework Step 4 to follow `Wireframe 2.png` on mobile:
  - keep title/subtitle in the same header coordinates as steps 1-3
  - use a two-column mobile content matrix
  - left column = stacked compact feature cards
  - right column = taller utility cards for Social Media and Language
  - preserve current feature set and interactions; only reorganize the layout and card proportions
- Rework Step 5 to follow `Wireframe 3.png` on mobile:
  - keep title/subtitle in the shared header zone
  - use a two-column upper content area with compact fields on the left and larger utility blocks on the right
  - place the long final-notes field as the full-width lower band
  - keep upload, timeline, and references grouped on the right as shown in the wireframe
- Desktop adaptation:
  - do not force the portrait wireframes literally
  - align desktop to the same content order and header placement logic
  - preserve the current richer desktop composition where it improves legibility and polish
- CSS strategy:
  - consolidate shared spacing/placement tokens in the onboarding shell
  - reduce step-specific one-off mobile overrides where possible
  - keep step-specific CSS only for content density, card ratios, and internal grids
- Public/interface impact:
  - no JS API changes expected
  - no onboarding data model changes expected
  - HTML structure for steps 2-5 will likely need moderate re-grouping to support shared layout bands

## Implementation Notes
- Start by auditing `index.html`, `style.css`, `style-step12.css`, and `style-step35.css` for repeated mobile-fit logic and step header variations.
- Introduce a reusable step pattern such as:
  - `step-shell`
  - `step-header-zone`
  - `step-content-zone`
  - `step-content-band`
  - `step-action-safe-zone`
- Apply the shared shell to steps 1-3 first, because they establish the baseline system for all later pages.
- After the shared shell is stable, adapt Step 4 and Step 5 to their custom mobile matrices without breaking the fixed-viewport rule.
- Keep existing copy unless content truncation or wrapping creates layout failure; in those cases, trim only where necessary.

## Test Plan
- Verify each onboarding step at mobile widths used in the repo audit flow:
  - `375x812`
  - `390x844`
  - `430x932`
- Confirm for steps 1-5:
  - progress bar stays in the reserved top zone
  - title and subtitle occupy the same relative position across steps
  - content never enters the side/top/bottom exclusion zones implied by the wireframes
  - bottom buttons remain visible and do not overlap content
  - no page-level vertical or horizontal scrolling appears
- Confirm Step 4 specifically:
  - left/right column grouping matches the wireframe hierarchy
  - Social Media and Language cards remain usable at smallest mobile size
- Confirm Step 5 specifically:
  - upper two-column grouping remains legible
  - final notes spans the lower full-width band
  - upload/timeline/reference blocks keep clear separation and alignment
- Check desktop after mobile work:
  - no regression to sidebar/progress behavior
  - header placement feels more consistent without making desktop cramped

## Assumptions
- Chosen preference: treat the wireframes as **mobile-first only**, not as strict desktop blueprints.
- Existing brand styling, dark theme, glow accents, and control styling should be preserved unless they interfere with wireframe consistency.
- Existing onboarding content and interactions stay the same; this is primarily a layout/system redesign, not a product-flow rewrite.
