# Seashell Studio Mobile Onboarding Layout Fix Plan

## Summary

Fix the mobile onboarding layout by replacing the current fixed-slot/scaled composition with one true shared mobile shell for steps 1-5. Keep the current visual design, keep the strict no-scroll rule, and focus entirely on vertical sizing, height distribution, and structural consistency.

Chosen defaults:
- Scope: onboarding only
- Scroll policy: keep strict no-scroll
- Visual direction: preserve the current UI and card styling
- Core fix: remove top-heavy fixed positioning and rebuild mobile layout around one shared flex/grid shell

## Implementation Changes

- Replace the current mobile `step-mobile-fit-viewport` + `step-mobile-fit-content` approach with a shared mobile shell used by every onboarding step.
  - Structure: `mobile progress shell` -> `step frame` -> `title block` -> `flexible content region` -> `fixed bottom action zone`
  - The content region must be the only variable part between steps.
  - Remove mobile reliance on absolute vertical band placement as the primary sizing system.

- Rebuild mobile height behavior around available viewport space instead of a fixed `370 x 403` content box.
  - The active step container should compute its usable height from viewport height minus progress shell height minus bottom action area minus outer padding.
  - The shared step shell should fill that usable height with `display: flex` or `grid`, `min-height: 0`, and a single growing content region.
  - The title block should keep a consistent top position and spacing, but it must stay in normal layout flow instead of being pinned absolutely.

- Normalize steps 1-3 under one content template.
  - Use a shared shell with a fixed title block and a content region split into two stacked bands.
  - The two bands should use `grid-template-rows: minmax(0, <top-ratio>) minmax(0, <bottom-ratio>)` so they expand to fill available height instead of sitting at fixed coordinates.
  - Preserve current band order and styling:
    - Step 1: palette band, background mode band
    - Step 2: preview band, font list band
    - Step 3: preview band, section list band
  - Remove inline max-height and extra top padding on Step 3’s mobile shell so it participates in the shared height system.

- Treat steps 4 and 5 as content-template variations inside the same shell, not separate layout systems.
  - Step 4:
    - Use the same shared outer shell and content-region height as steps 1-3.
    - Keep the two-column content arrangement, but make the whole matrix fill the content region height with balanced row definitions.
    - Left column: a single vertical stack of feature cards with evenly distributed heights.
    - Right column: two equal-height utility panels that stretch to the same overall column height as the left stack.
    - No extra internal top offset, no per-step vertical centering, no absolute matrix anchoring.
  - Step 5:
    - Use the same shared outer shell and content-region height.
    - Build the content area as a two-row grid: upper split region plus lower full-width notes region.
    - Upper split region height should be flexible but bounded so labels, fields, upload, and timeline remain readable without overlapping.
    - Lower notes band must always reserve its own row and cannot overlap the upper split region.
    - Keep current layout grouping and visual styling; only change height logic and row distribution.

- Simplify mobile CSS ownership so one source of truth controls layout mechanics.
  - `wireframe-mobile.css` should own mobile onboarding layout behavior.
  - Existing mobile rules in `style.css`, `style-step12.css`, and `style-step35.css` that currently reposition, resize, or re-scale onboarding shells must be removed or neutralized for mobile.
  - Keep shared visual tokens, typography, colors, borders, and component styling in the existing files; move only layout mechanics into the mobile shell layer.

- Reduce JS involvement to layout support, not layout definition.
  - Keep progress-shell and floating-action measurements.
  - Stop using per-step mobile composition scaling as the primary sizing mechanism.
  - Remove or bypass mobile use of `updateStepCompositionScale()` for steps 1-5 once the shared shell fills height correctly.
  - Keep JS only where it supports component internals that genuinely need runtime sizing, such as palette viewport affordance.

## Public Interfaces / Internal Contract Changes

- No public API, submission, or data-model changes.
- Internal layout contract changes:
  - Mobile onboarding uses one shared shell with one flexible content region.
  - Step-specific templates are limited to internal content arrangement, not outer height logic.
  - `wireframe-mobile.css` becomes the single mobile onboarding layout authority.
- Implementation paths that should carry the change:
  - [index.html](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/index.html)
  - [wireframe-mobile.css](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/wireframe-mobile.css)
  - [main.js](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/main.js)

## Test Plan

- Structural verification
  - Confirm every onboarding step uses the same mobile shell structure in DOM and CSS.
  - Confirm the title block sits in flow above the content region on all steps.
  - Confirm the content region, not absolute offsets, determines vertical fill.

- Viewport verification
  - Test at `375x812`, `390x844`, and `430x932`.
  - Confirm no page-level horizontal scrolling.
  - Confirm no page-level vertical scrolling.
  - Confirm the bottom action bar remains fully visible and anchored.
  - Confirm the content region reaches close to the action zone instead of leaving a large dead gap.

- Step-specific checks
  - Step 1: palette band and background band stretch to fill the content region cleanly.
  - Step 2: preview and font list share height deliberately, with no top-heavy collapse.
  - Step 3: preview and section list fill the available space without extra top padding or capped-height behavior.
  - Step 4: both columns fill the same parent content region height and feel balanced.
  - Step 5: upper split region and lower notes band remain separate under realistic content lengths.

- Stress tests
  - Long step titles/subtitles still preserve usable content height.
  - Longer input values on Step 5 do not overlap adjacent regions.
  - Validation/helper text scenarios on Step 5 still fit within the no-scroll contract.
  - Smaller-height devices still compress proportionally instead of leaving unused lower space.

- Acceptance criteria
  - The main critique is visibly resolved: content no longer sits high with a large abandoned gap below.
  - Steps 1-5 feel like one mobile layout system with different internals, not five separate layouts with matching styling.
  - Visual styling remains materially unchanged from the current draft.

## Assumptions

- “Fix the mobile layout” means the onboarding flow, not the landing page or thank-you page.
- The current visual design is acceptable; this pass should not redesign components or brand styling.
- The strict no-scroll rule from [Site-guidelines.md](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/Structure/Site-guidelines.md) remains in force.
- The wireframes remain a spacing/reference guide, but the implementation should use flexible height distribution rather than fixed absolute mobile band coordinates.
