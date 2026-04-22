# Wireframe-Exact Onboarding Rebuild Plan

## Summary
Replace the current “styled existing layout” approach with a two-phase rebuild driven by your wireframes’ actual geometry. The plan should treat the wireframes as the source of truth for measured side gutters, top/bottom exclusion zones, header position, inter-band spacing, and content zones, and should first prove that system in a clean prototype before porting it into the live onboarding.

Chosen defaults:
- Build path: **prototype then port**
- Strictness: **exact geometry**
- Interpretation: wireframes define the **layout system**, not just visual mood

## Key Changes
- Create a **measurement spec** from the three wireframes before any redesign work:
  - derive left/right safe gutters as percentages of canvas width
  - derive top progress zone, header zone, content band heights, and bottom action zone as percentages of canvas height
  - document exact vertical anchors for heading, subtitle, content band 1, content band 2, and action container
  - define one canonical portrait onboarding frame based on the common wireframe dimensions (`~370x568`)
- Build a **standalone onboarding prototype** that ignores the current production structure:
  - one static HTML/CSS prototype page per wireframe family
  - family A: steps 1-3 using `Heading -> Content 1 -> Content 2`
  - family B: step 4 using the two-column dense feature matrix
  - family C: step 5 using the split upper form bands plus full-width lower notes band
  - use simple placeholder blocks first so geometry can be judged without content noise
- After the prototype is approved, **port the geometry system** into `Seashell_studio_website`:
  - replace current per-step mobile layout rules with a shared wireframe frame
  - remove reliance on ad hoc per-step spacing that only approximates consistency
  - preserve existing interactions and content, but fit them into fixed measured zones instead of letting each step define its own rhythm
- Rebuild the onboarding around **three structural templates**:
  - Template A for steps 1-3
  - Template B for step 4
  - Template C for step 5
  - each template uses the same outer frame tokens, but different internal content placement rules
- Explicit interface/structure changes:
  - introduce one shared onboarding geometry token set in CSS
  - introduce shared layout wrappers for `progress zone`, `header zone`, `band 1`, `band 2`, and `action safe zone`
  - step-specific internals may differ, but outer placement must not
  - no data model or JS submission API changes should be planned unless a current interaction cannot fit the measured zones

## Implementation Changes
- Phase 1: geometry extraction
  - measure all three wireframes and convert pixel values to normalized ratios
  - produce a short “layout spec” table for each zone with width, top offset, height, and gap values
  - compare those ratios against the current mobile viewport target used by the repo audit (`390x844`) and define the scaling formula
- Phase 2: prototype
  - create a separate prototype surface outside the production onboarding flow
  - implement exact wireframe geometry with placeholder content blocks first
  - verify that the prototype visually matches your intended spacing and repetition before any live-site port
  - once approved, swap placeholders for real Seashell onboarding content and controls
- Phase 3: live port
  - update the real onboarding HTML/CSS to match the approved prototype geometry
  - map real controls into the correct wireframe zones:
    - Step 1: title/subtitle, palette area, background mode area
    - Step 2: title/subtitle, font list area, preview area
    - Step 3: title/subtitle, section list area, preview area
    - Step 4: title/subtitle, compact left feature stack, tall right utility cards
    - Step 5: title/subtitle, left compact inputs, right upload/timeline/reference stack, full-width notes
  - only after geometry matches should visual polish be tuned
- Phase 4: cleanup
  - remove conflicting mobile layout overrides that preserve the old structure
  - keep desktop behavior out of scope for the first strict pass unless it can adopt the same ratio system cleanly
  - if desktop is addressed later, derive it from the same frame logic rather than freehand adaptation

## Test Plan
- Prototype validation
  - compare prototype screenshots directly against each wireframe family
  - verify identical side gutters across all prototype steps
  - verify identical top reserved zone and bottom reserved zone across all prototype steps
  - verify title and subtitle baseline positions match across steps 1-5 unless the wireframe intentionally differs
- Mobile production validation
  - test at `375x812`, `390x844`, and `430x932`
  - confirm no page-level vertical or horizontal scrolling
  - confirm all content remains inside wireframe-derived safe zones
  - confirm bottom actions stay fully visible and do not force content overlap
  - confirm step headers land at the same measured vertical position across steps
- Template-specific checks
  - Template A: steps 1-3 all share the same outer geometry and same band spacing
  - Template B: step 4 preserves the same outer frame while fitting the denser matrix without drift
  - Template C: step 5 preserves the same outer frame while keeping the lower notes band aligned and full width
- Regression checks
  - confirm existing onboarding interactions still function after port
  - confirm no submission logic, step navigation, or selection logic is broken by the layout rebuild

## Assumptions
- The prior work is insufficient because it mostly wrapped the existing layouts instead of enforcing a measured wireframe system.
- The next implementation should start from a clean prototype rather than continuing to patch the existing onboarding layout directly.
- The first successful target is **mobile exactness**, using the wireframes as the literal layout model.
- Desktop should not be loosely “made nicer” during the same pass unless it can be derived from the same geometry system without weakening the mobile result.
