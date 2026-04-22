# Mobile Shell Fill Fix And Polish Plan

## Summary
Keep the new shared mobile shell, but stop treating the new bands as visible containers. The fix is to make those bands act as layout slots only, and make the existing page content stretch to define the visible shape itself. The main regression targets are Step 2 and Step 3, where nested container styling created false borders, excess padding, and clipped content.

## Implementation Changes
- Preserve the current shared mobile onboarding shell and bottom-action alignment.
  - Do not remove the shell.
  - Do not redesign the visual system.
  - Change the shell contract so slot wrappers define placement only, not visible card chrome when the child content already has its own surface.

- Rework Step 2 so the content becomes the surface instead of sitting inside a padded band.
  - Treat `.font-preview-area` and `.font-selection-area` as structural fill slots on mobile.
  - Remove mobile-only padding, border, background, and radius from the Step 2 slot layer.
  - Make `.preview-card` stretch edge-to-edge inside the upper slot so it becomes the actual visible container.
  - Make the lower font-list surface fill its slot height instead of floating inside it with extra inset.
  - Keep the current content order and styling, but eliminate the “container around content” look.

- Rework Step 3 with the same carrier-vs-surface rule.
  - Treat `.layout-step-preview` and `.layout-step-sidebar` as structural slots only on mobile.
  - Remove mobile-only slot padding/background that makes the new shell visible as a separate border.
  - Make `.preview-mockup` fill the upper slot directly.
  - Make the section-list area fill the lower slot directly.
  - If the current sidebar markup cannot own the surface cleanly, add one explicit inner surface wrapper for the sidebar content instead of keeping the slot wrapper visible.

- Fix Step 3 preview sizing so it truly adapts to the slot instead of being clipped by it.
  - Remove mobile min-heights, max-heights, and fixed preview heights that were tuned for the older layout.
  - Rebuild the preview column with `minmax(0, 1fr)` behavior from the slot down through `.preview-mockup`, `.mockup-inner`, and `.mockup-canvas`.
  - Convert internal paddings, gaps, and template block sizing to mobile clamps that shrink with the slot.
  - Keep this CSS-driven; do not reintroduce generic per-step JS scaling for the preview.

- Apply a short polish pass after the structural fix.
  - Normalize title-to-content spacing now that Step 2 and Step 3 are truly filling their slots.
  - Confirm the visible surfaces align with the shared shell edges without showing a second nested frame.
  - Keep current typography, color, and interaction styling unless a size tweak is needed to prevent clipping.

## Public Interfaces / Internal Contract Changes
- No public API or onboarding data changes.
- Internal mobile layout contract changes:
  - Shared shell remains.
  - Slot wrappers are placement guides only.
  - Visible card/surface ownership moves to the content layer on Step 2 and Step 3.
- Primary implementation paths:
  - [wireframe-mobile.css](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/wireframe-mobile.css)
  - [style-step12.css](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/style-step12.css)
  - [index.html](/c:/Users/tyler/Desktop/Seashell%20Studio/Seashell_studio_website/index.html)

## Test Plan
- Step 2
  - The preview fills the upper slot directly with no visible outer carrier border.
  - The font list fills the lower slot directly with no excess inset that reads like a frame inside a frame.
  - The page still reaches the bottom action zone with no dead space regression.

- Step 3
  - The preview fills the upper slot directly.
  - No top or bottom of the preview is clipped.
  - The section list fills the lower slot directly and remains fully readable.
  - The slot itself is not visually present as a second container around the content.

- Shared mobile regression checks
  - Test `375x812`, `390x844`, and `430x932`.
  - Confirm no page-level horizontal or vertical scrolling.
  - Confirm consistent shell/title alignment across steps 1-5.
  - Confirm Steps 1, 4, and 5 do not visually regress while Step 2 and Step 3 are being corrected.

- Acceptance criteria
  - The new shared shell still solves cross-step consistency.
  - Step 2 and Step 3 content now takes the shape of the new layout slots instead of sitting inside them.
  - The visible “extra border container” effect is gone.
  - Step 3 preview is fully visible and resized to the slot rather than cropped by it.

## Assumptions
- The current shared mobile shell should stay; only the carrier/content ownership needs correction.
- This pass is a bug fix and polish pass, not a redesign.
- CSS should be the sizing solution; generic JS scaling should not return unless a narrowly scoped fallback is absolutely unavoidable.
