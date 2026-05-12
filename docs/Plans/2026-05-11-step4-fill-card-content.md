# Step 4 Fill Card Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all whitespace in Step 4 feature cards by making card content fill the full card height, with proportionally scaled fonts and padding across all seven cards (top 5 toggle + bottom 2 expanded).

**Architecture:** The bottom two cards (`social-card`, `language-card`) already stretch to fill remaining viewport height via `flex: 1 1 0%` on `features-row-secondary`. The content inside those cards currently packs to the top. Fix is two-part: (1) make the content containers grow to fill their card using CSS grid/flex stretch mechanics, then (2) scale up fonts, padding, and icons in ALL cards proportionally so visual density matches the new card heights. Top toggle cards naturally grow taller as their content scales up.

**Tech Stack:** Vanilla CSS — one file, `main.css`, second `@media (min-width: 1060px)` block (~lines 1883–2046).

---

## File Map

| File | Change |
|------|--------|
| `Seashell_studio_website/styles/main.css` | All changes — desktop step 4 media query block |

---

### Task 1: Make Social Media card rows fill the card height

The `.social-grid` is a CSS grid with 5 items in 2 columns (3 rows). It already has `flex: 1 1 0%` so it fills the card, but rows use `auto` height (packing to top). Adding `grid-auto-rows: 1fr` distributes the available height equally across all 3 rows.

**Files:**
- Modify: `Seashell_studio_website/styles/main.css` — `#step-4 .social-card .social-grid` rule (~line 1943)

- [ ] **Step 1: Change social-grid to fill height with equal rows**

Find the existing rule (currently ~line 1943):
```css
#step-4 .social-card .social-grid {
  flex: 1 1 0%;
  min-height: 0;
  align-content: start;
}
```

Replace with:
```css
#step-4 .social-card .social-grid {
  flex: 1 1 0%;
  min-height: 0;
  grid-auto-rows: 1fr;
}
```

- [ ] **Step 2: Remove the min-height constraint from social options**

Find the existing rule (~line 2013):
```css
#step-4 .social-option {
  min-height: 2.4rem;
  padding: 0.5rem 0.7rem;
}
```

Replace with:
```css
#step-4 .social-option {
  height: 100%;
}
```

- [ ] **Step 3: Screenshot and verify social rows fill card**

Run in `dev-tools/`:
```
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForTimeout(500);
  await page.evaluate(() => window.navigateToStep(4));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screens/task1.png' });
  await browser.close();
})();
"
```

Expected: The three rows of social option buttons now fill the Social Media card vertically with no empty gap at the bottom. Each row is approximately equal height.

---

### Task 2: Make Language card chips fill the card height

`.language-suggestions` is a `flex-wrap` container already set to `flex: 1 1 0%`. With `align-content: stretch`, the two flex lines (rows of chips) spread to fill available height. Chips need `align-self: stretch` so each chip fills its line height.

**Files:**
- Modify: `Seashell_studio_website/styles/main.css` — `#step-4 .language-card .language-suggestions` and `#step-4 .language-chip` rules (~lines 1949, 2031)

- [ ] **Step 1: Change language-suggestions to stretch flex lines**

Find the existing rule (~line 1949):
```css
#step-4 .language-card .language-suggestions {
  flex: 1 1 0%;
  min-height: 0;
  align-content: start;
}
```

Replace with:
```css
#step-4 .language-card .language-suggestions {
  flex: 1 1 0%;
  min-height: 0;
  align-content: stretch;
}
```

- [ ] **Step 2: Make language chips stretch to fill their flex-line height**

Find the existing rule (~line 2031):
```css
#step-4 .language-chip {
  min-height: 1.7rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.58rem;
  width: auto;
}
```

Replace with:
```css
#step-4 .language-chip {
  align-self: stretch;
  padding: 0.35rem 0.65rem;
  font-size: 0.58rem;
  width: auto;
}
```

- [ ] **Step 3: Screenshot and verify language card fills**

```
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForTimeout(500);
  await page.evaluate(() => window.navigateToStep(4));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screens/task2.png' });
  await browser.close();
})();
"
```

Expected: Language chips in the two flex lines now fill the card height. No empty gap between chips and the "Other (type)" input at the bottom.

---

### Task 3: Scale up all card content proportionally

With content now filling cards, the fonts and icons are too small for the available space. Scale up ALL seven cards uniformly (same rule covers toggle + bottom cards) so visual density is consistent. Top toggle cards will grow taller naturally as content gets larger.

**Files:**
- Modify: `Seashell_studio_website/styles/main.css` — second `@media (min-width: 1060px)` block, lines ~1988–2046

- [ ] **Step 1: Scale card title, meta, and desc for all cards**

Find the existing rule (~line 1988):
```css
#step-4 .feature-toggle-card .card-title,
#step-4 .social-card .card-title,
#step-4 .language-card .card-title {
  font-size: 1.02rem;
  line-height: 1.08;
  margin-bottom: 0;
}
```

Replace with:
```css
#step-4 .feature-toggle-card .card-title,
#step-4 .social-card .card-title,
#step-4 .language-card .card-title {
  font-size: 1.25rem;
  line-height: 1.08;
  margin-bottom: 0;
}
```

Find (~line 1996):
```css
#step-4 .feature-meta {
  font-size: 0.58rem;
}
```

Replace with:
```css
#step-4 .feature-meta {
  font-size: 0.68rem;
}
```

Find (~line 2000):
```css
#step-4 .feature-toggle-card .card-desc,
#step-4 .social-card .card-desc,
#step-4 .language-card .card-desc,
#step-4 .language-helper {
  font-size: 0.8rem;
  line-height: 1.36;
}
```

Replace with:
```css
#step-4 .feature-toggle-card .card-desc,
#step-4 .social-card .card-desc,
#step-4 .language-card .card-desc,
#step-4 .language-helper {
  font-size: 0.95rem;
  line-height: 1.4;
}
```

- [ ] **Step 2: Scale up icon boxes for all cards**

Find (~line 1969):
```css
#step-4 .feature-card-header .icon-box {
  width: 2.25rem;
  height: 2.25rem;
  align-self: start;
}
```

Replace with:
```css
#step-4 .feature-card-header .icon-box {
  width: 2.75rem;
  height: 2.75rem;
  align-self: start;
}
```

Also update the grid column to accommodate the larger icon. Find (~line 1960):
```css
#step-4 .feature-card-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.25rem;
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
  grid-template-columns: minmax(0, 1fr) 2.75rem;
  align-items: start;
  column-gap: 0.72rem;
  row-gap: 0;
  min-height: 0;
}
```

- [ ] **Step 3: Scale up social option name font and padding**

Find (~line 2013 — now shifted after Task 1 changes):
```css
#step-4 .social-option {
  height: 100%;
}
```

Replace with:
```css
#step-4 .social-option {
  height: 100%;
  padding: 0.9rem 1rem;
}
```

Find (~line 2023):
```css
#step-4 .social-option-name {
  font-size: 0.82rem;
}
```

Replace with:
```css
#step-4 .social-option-name {
  font-size: 1rem;
}
```

Find (~line 2018):
```css
#step-4 .social-option-check {
  width: 1rem;
  height: 1rem;
}
```

Replace with:
```css
#step-4 .social-option-check {
  width: 1.25rem;
  height: 1.25rem;
}
```

- [ ] **Step 4: Scale up language chip font and padding**

The chip rule was changed in Task 2. Find (~line 2031):
```css
#step-4 .language-chip {
  align-self: stretch;
  padding: 0.35rem 0.65rem;
  font-size: 0.58rem;
  width: auto;
}
```

Replace with:
```css
#step-4 .language-chip {
  align-self: stretch;
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  width: auto;
}
```

Find (~line 2038):
```css
#step-4 .language-label {
  font-size: 0.58rem;
}
```

Replace with:
```css
#step-4 .language-label {
  font-size: 0.72rem;
}
```

- [ ] **Step 5: Screenshot and verify all cards look proportionally scaled**

```
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForTimeout(500);
  await page.evaluate(() => window.navigateToStep(4));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screens/task3.png' });
  await browser.close();
})();
"
```

Expected: No whitespace visible in any card. Top 5 toggle cards taller than before (content grew). All seven cards have visually consistent font sizes and density. If fonts feel too large or too small, adjust the rem values incrementally (0.1rem steps) and re-screenshot.

---

### Task 4: Commit

- [ ] **Step 1: Commit the change**

From `Seashell_studio_website/`:
```
git add styles/main.css
git commit -m "fix: fill step 4 card content to eliminate whitespace"
```
