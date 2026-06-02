# Step 5 Mobile — Compact Natural-Height Layout Design

**Date:** 2026-06-02  
**Status:** Approved  
**Scope:** `styles/mobile.css` only — no HTML, no JS, no desktop rules touched

---

## Problem

The Step 5 mobile layout uses a "fill the screen" CSS grid that divides the entire available viewport height equally across all form rows. At 390×844px this inflates each input group to ~80px even though the natural height (label + padding + 13px text) is ~57px. The Final Notes textarea consumes ~202px because it receives whatever the outer grid's second row fraction allocates. The whole form looks oversized and clunky.

**Measured at 390×844:**
- Business Name input: 166px × 55px (input is 37px naturally — 18px wasted per field)
- Final Notes textarea: 352px × 202px
- Shell: 621px total — form fills all of it

---

## Root Cause

Three CSS rules in `mobile.css` chain together to produce the stretching:

1. `#step-5 .finish-form-layout { height: 100% }` — form fills shell
2. `#step-5 .finish-form-main { grid-template-rows: repeat(4, minmax(0, 1fr)) }` — 4 equal rows fill the column height
3. `.input-group { grid-template-rows: auto minmax(0, 1fr) }` — input stretches to fill its row

The result: the viewport height cascades all the way down into the individual `<input>` element.

---

## Solution — Natural-Height Form

Switch from a "fill" approach to a "natural height" approach. Each field is exactly as tall as its content needs. Optional textareas (References, Final Notes) get a compact minimum height. The form sits in the upper portion of the step with the FAB fixed at the bottom — no scrolling, no forced fill.

### Outer form grid

```
Before: grid-template-rows: minmax(0, 1fr) minmax(6.5rem, 0.7fr)
After:  grid-template-rows: auto auto
height: auto  (was: height: 100%)
```

The form is no longer forced to fill the shell height. Both rows size to their content.

### Main column (4 required text inputs)

```
Before: grid-template-rows: repeat(4, minmax(0, 1fr))   height: 100%
After:  grid-template-rows: repeat(4, auto)              height: auto
```

Four rows that size to their content. No stretching.

### Side column (Upload, Timeline, References)

```
Before: grid-template-rows: minmax(0, 1.28fr) minmax(0, 0.9fr) minmax(0, 1fr)   height: 100%
After:  grid-template-rows: auto auto auto                                          height: auto
```

All three items size to their content.

### Input groups (label + field)

```
Before: grid-template-rows: auto minmax(0, 1fr)   (field stretches)
After:  grid-template-rows: auto auto              (field is natural height)
```

Applied to `.finish-form-main .input-group` and `.finish-form-side .input-group`.  
`.finish-grid-full .input-group` (Final Notes) handled separately below.

### Upload box

`height: auto`, `min-height: 72px` — enough to show the cloud icon + two text lines without being a giant block.

### Timeline bar and buttons

`height: auto` on both — buttons size to their text content.

### References textarea

`height: auto`, `min-height: 68px` — compact but usable optional field.

### Final Notes textarea

`height: auto`, `min-height: 68px` — same compact treatment. The `.finish-grid-full` wrapper also gets `height: auto` (no longer fills the grid row).

---

## What Stays the Same

- Two-column layout structure (`.finish-form-layout` column template unchanged)
- Field order in HTML
- Input font size (13px), horizontal padding (0.7rem), border-radius
- Label typography and color
- Focus ring (inset box-shadow)
- Location icon positioning
- All desktop rules (untouched)
- Playwright test expectations (structural elements still present)

---

## Expected Result

At 390×844px after the fix:
- Each required input: ~37px tall (was ~55px) — proportional padding, no dead space
- Upload box: ~72px (was ~102px)
- Timeline: ~36px (was ~92px)
- References: ~68px min (was ~76px — similar, now explicit)
- Final Notes: ~68px min (was ~202px)
- Form total height: ~370px in a 554px content area — clean, compact, not scrollable
- Remaining ~184px below the form is empty dark background, FAB anchored at bottom

---

## Files Changed

| File | Change |
|------|--------|
| `styles/mobile.css` | Remove `height: 100%` from form containers; change `grid-template-rows` from fractional to `auto`; set explicit `min-height` on textareas and upload box |

No other files are modified.
