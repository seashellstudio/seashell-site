# Step 4 Scale Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all Step 4 feature cards look visually proportional — content that genuinely fills each card at a consistent, large-feeling scale — by dramatically increasing font sizes, icon sizes, and spacing across all 7 cards uniformly.

**Architecture:** Three coordinated CSS changes in `main.css`, all in the two `@media (min-width: 1060px)` blocks. (1) Double all typography + icon sizes so top toggle cards visibly grow taller. (2) Scale social option interior elements (icon, checkbox, platform name) to match the now-taller button cells. (3) Override language chip `border-radius` so stretched chips become rectangular tiles instead of circles, and scale chip text to match.

**Tech Stack:** Vanilla CSS — `Seashell_studio_website/styles/main.css` only.

---

## Root cause summary

| Problem | Cause | Fix |
|---|---|---|
| Top cards didn't grow | `1.02→1.25rem` (22%) font increase is invisible | Increase to `1.9rem` (86% jump) |
| Social buttons look paddy | Icon `1.1rem` + name `1rem` is ~18px inside a ~105px-tall button | Scale icon to `2.2rem`, name to `1.5rem`, checkbox to `2rem` |
| Language chips are circles | `align-self: stretch` + `border-radius: 999px` = height ≈ width → circle | Override `border-radius: 0.875rem` for step-4 desktop context |

---

## File Map

| File | Sections touched |
|---|---|
| `Seashell_studio_website/styles/main.css` | First `@media (min-width: 1060px)` block (~lines 1806–1880) |
| `Seashell_studio_website/styles/main.css` | Second `@media (min-width: 1060px)` block (~lines 1883–2046) |

---

### Task 1: Double card typography + spacing (all 7 cards)

**Files:**
- Modify: `Seashell_studio_website/styles/main.css`

These changes apply to ALL seven cards (5 toggle + 2 large). Because `.features-row-primary` is `flex: 0 0 auto`, the top row's height is purely content-driven — bigger fonts and padding means it grows taller with no other changes needed.

Both `@media (min-width: 1060px)` blocks contain duplicate rules for the same selectors (the second block wins the cascade). Update BOTH blocks to keep them consistent.

---

#### First `@media (min-width: 1060px)` block (~lines 1836–1864)

- [ ] **Step 1: Update toggle card padding and gap in first block**

Find:
```css
  #step-4 .feature-toggle-card {
    height: 100%;
    padding: 0.92rem 0.98rem 0.9rem;
    gap: 0.62rem;
  }
```
Replace with:
```css
  #step-4 .feature-toggle-card {
    height: 100%;
    padding: 1.4rem 1.2rem 1.3rem;
    gap: 0.75rem;
  }
```

- [ ] **Step 2: Update feature-card-header icon column in first block**

Find:
```css
  #step-4 .feature-card-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 2.75rem;
    align-items: start;
    column-gap: 0.72rem;
    min-height: 0;
  }
```
Replace with:
```css
  #step-4 .feature-card-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3.5rem;
    align-items: start;
    column-gap: 0.72rem;
    min-height: 0;
  }
```

- [ ] **Step 3: Update icon-box size in first block**

Find:
```css
  #step-4 .feature-card-header .icon-box {
    width: 2.75rem;
    height: 2.75rem;
    flex: none;
    align-self: start;
  }
```
Replace with:
```css
  #step-4 .feature-card-header .icon-box {
    width: 3.5rem;
    height: 3.5rem;
    flex: none;
    align-self: start;
  }
```

---

#### Second `@media (min-width: 1060px)` block (~lines 1929–2006)

- [ ] **Step 4: Update toggle card padding and gap in second block**

Find:
```css
  #step-4 .feature-toggle-card {
    height: 100%;
    padding: 0.7rem 0.98rem 0.65rem;
    gap: 0.4rem;
  }
```
Replace with:
```css
  #step-4 .feature-toggle-card {
    height: 100%;
    padding: 1.4rem 1.2rem 1.3rem;
    gap: 0.75rem;
  }
```

- [ ] **Step 5: Update bottom card padding and gap in second block**

Find:
```css
  #step-4 .social-card,
  #step-4 .language-card {
    height: 100%;
    min-height: 0;
    padding: 0.9rem 1.2rem;
    gap: 0.6rem;
  }
```
Replace with:
```css
  #step-4 .social-card,
  #step-4 .language-card {
    height: 100%;
    min-height: 0;
    padding: 1.3rem 1.4rem;
    gap: 0.8rem;
  }
```

- [ ] **Step 6: Update feature-card-header icon column in second block**

Find:
```css
  #step-4 .feature-card-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 2.75rem;
    align-items: start;
    column-gap: 0.72rem;
    row-gap: 0;
    min-height: 0;
  }
```
Replace with:
```css
  #step-4 .feature-card-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3.5rem;
    align-items: start;
    column-gap: 0.72rem;
    row-gap: 0;
    min-height: 0;
  }
```

- [ ] **Step 7: Update icon-box size in second block**

Find:
```css
  #step-4 .feature-card-header .icon-box {
    width: 2.75rem;
    height: 2.75rem;
    align-self: start;
  }
```
Replace with:
```css
  #step-4 .feature-card-header .icon-box {
    width: 3.5rem;
    height: 3.5rem;
    align-self: start;
  }
```

- [ ] **Step 8: Update card title font size**

Find:
```css
  #step-4 .feature-toggle-card .card-title,
  #step-4 .social-card .card-title,
  #step-4 .language-card .card-title {
    font-size: 1.25rem;
    line-height: 1.08;
    margin-bottom: 0;
  }
```
Replace with:
```css
  #step-4 .feature-toggle-card .card-title,
  #step-4 .social-card .card-title,
  #step-4 .language-card .card-title {
    font-size: 1.9rem;
    line-height: 1.08;
    margin-bottom: 0;
  }
```

- [ ] **Step 9: Update feature-meta font size**

Find:
```css
  #step-4 .feature-meta {
    font-size: 0.68rem;
  }
```
Replace with:
```css
  #step-4 .feature-meta {
    font-size: 0.85rem;
  }
```

- [ ] **Step 10: Update card description font size**

Find:
```css
  #step-4 .feature-toggle-card .card-desc,
  #step-4 .social-card .card-desc,
  #step-4 .language-card .card-desc,
  #step-4 .language-helper {
    font-size: 0.95rem;
    line-height: 1.4;
  }
```
Replace with:
```css
  #step-4 .feature-toggle-card .card-desc,
  #step-4 .social-card .card-desc,
  #step-4 .language-card .card-desc,
  #step-4 .language-helper {
    font-size: 1.2rem;
    line-height: 1.4;
  }
```

- [ ] **Step 11: Screenshot and verify top cards are visibly taller**

Run from `Seashell_studio_website/dev-tools/`:
```
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(4)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/task1-scale.png' }); await browser.close(); })();"
```

Read `screens/task1-scale.png`. Expected: The five top cards are visibly taller than before — titles are large and clearly readable at ~1.9rem, icons are bigger. Bottom cards still have content that looks small relative to card height (that's fixed in Tasks 2 and 3).

---

### Task 2: Scale social option interior elements

**Files:**
- Modify: `Seashell_studio_website/styles/main.css` — second `@media (min-width: 1060px)` block

The social buttons fill the grid cell height via `height: 100%` + `grid-auto-rows: 1fr`. The interior elements (icon, checkbox, platform name) need to grow proportionally so the content visually occupies the button rather than floating as a thin strip in the middle.

- [ ] **Step 1: Scale social option interior elements**

Find:
```css
  #step-4 .social-option {
    height: 100%;
    padding: 0.9rem 1rem;
  }
```
Replace with:
```css
  #step-4 .social-option {
    height: 100%;
    padding: 1rem 1.2rem;
    gap: 1rem;
  }
```

Find:
```css
  #step-4 .social-option-check {
    width: 1.25rem;
    height: 1.25rem;
  }
```
Replace with:
```css
  #step-4 .social-option-check {
    width: 2rem;
    height: 2rem;
  }
```

Find:
```css
  #step-4 .social-option-name {
    font-size: 1rem;
  }
```
Replace with:
```css
  #step-4 .social-option-name {
    font-size: 1.5rem;
  }
```

- [ ] **Step 2: Add social option icon size override**

After the `#step-4 .social-option-name` rule, add a new rule:
```css
  #step-4 .social-option-icon {
    width: 2.2rem;
    height: 2.2rem;
  }
```

- [ ] **Step 3: Update social grid gap**

Find:
```css
  #step-4 .social-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }
```
Replace with:
```css
  #step-4 .social-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }
```

- [ ] **Step 4: Screenshot and verify social buttons look proportional**

```
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(4)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/task2-social.png' }); await browser.close(); })();"
```

Expected: Social option buttons have a large platform icon, large checkbox, and large platform name that visually fills the button cell rather than floating as a tiny strip.

---

### Task 3: Fix language chip appearance + scale

**Files:**
- Modify: `Seashell_studio_website/styles/main.css` — second `@media (min-width: 1060px)` block

`align-self: stretch` makes chip height grow to fill the flex line. With `border-radius: 999px`, height ≈ chip width → circle. Overriding to `0.875rem` makes chips rectangular tiles that can stretch vertically without becoming round.

- [ ] **Step 1: Fix chip border-radius and scale font + padding**

Find:
```css
  #step-4 .language-chip {
    align-self: stretch;
    padding: 0.5rem 0.9rem;
    font-size: 0.72rem;
    width: auto;
  }
```
Replace with:
```css
  #step-4 .language-chip {
    align-self: stretch;
    padding: 0.65rem 1rem;
    font-size: 1rem;
    width: auto;
    border-radius: 0.875rem;
  }
```

- [ ] **Step 2: Update language suggestions gap**

Find:
```css
  #step-4 .language-suggestions {
    gap: 0.45rem;
  }
```
Replace with:
```css
  #step-4 .language-suggestions {
    gap: 0.6rem;
  }
```

- [ ] **Step 3: Scale language label and input**

Find:
```css
  #step-4 .language-label {
    font-size: 0.72rem;
  }
```
Replace with:
```css
  #step-4 .language-label {
    font-size: 0.85rem;
  }
```

Find:
```css
  #step-4 .language-input {
    padding: 0.6rem 2.2rem 0.6rem 0.8rem;
    font-size: 0.82rem;
  }
```
Replace with:
```css
  #step-4 .language-input {
    padding: 0.75rem 2.4rem 0.75rem 1rem;
    font-size: 1rem;
  }
```

- [ ] **Step 4: Screenshot and verify final state**

```
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(4)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/task3-lang.png' }); await browser.close(); })();"
```

Expected: Language chips are rectangular tiles (not circles), text is larger, chips fill the card height proportionally. All 7 cards read at a consistent visual scale.

---

### Task 4: Commit

- [ ] **Step 1: Commit**

From `Seashell_studio_website/`:
```
git add styles/main.css
git commit -m "fix: overhaul step 4 card scale — large fonts, proportional elements"
```
