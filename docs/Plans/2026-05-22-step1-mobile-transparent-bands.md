# Step 1 Mobile Transparent Bands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the visible dark card wrapper backgrounds from the "Brand Colour Palettes" and "Background Colour" sections on Step 1 mobile so they blend into the page background like they do on desktop.

**Architecture:** Single CSS rule change in `mobile.css`. The two Step 1 bands (`#step-1 .step-band--primary` and `#step-1 .step-band--secondary`) currently receive `background`, `border`, `border-radius`, `box-shadow`, and `padding` from `--mobile-step-surface-*` variables that render them as visible dark cards. Steps 2 and 3 already zero these same properties out — Step 1 just needs the same treatment. Layout properties (`display: flex`, `flex-direction: column`, `gap`) are kept intact so internal spacing isn't affected.

**Tech Stack:** Vanilla CSS — `Seashell_studio_website/styles/mobile.css` only.

---

## File Map

| File | Change |
|---|---|
| `Seashell_studio_website/styles/mobile.css` | Lines 157–172: strip visual card properties from `#step-1 .step-band--primary, #step-1 .step-band--secondary` |

---

### Task 1: Take a before-screenshot to confirm the problem

**Files:**
- Read: `Seashell_studio_website/dev-tools/` (scripts already installed)

- [ ] **Step 1: Start the local server (if not already running)**

Run from `Seashell_studio_website/`:
```
python -m http.server 8000
```
Leave running in background.

- [ ] **Step 2: Capture mobile step 1 screenshot**

Run from `Seashell_studio_website/dev-tools/`:
```
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(1)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/before-step1-mobile.png' }); await browser.close(); })();"
```

Read `screens/before-step1-mobile.png`. Expected: two visible dark rounded-corner card panels — one for "Brand Colour Palettes", one for "Background Colour".

---

### Task 2: Remove the card wrapper visuals from Step 1 mobile bands

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` lines 157–172

- [ ] **Step 1: Read the current rule to confirm line numbers match**

Current state of lines 157–172 in `mobile.css`:
```css
  #step-1 .step-band--primary,
  #step-1 .step-band--secondary {
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: var(--mobile-step-surface-padding) !important;
    background: var(--mobile-step-surface-fill);
    border: var(--mobile-step-surface-border);
    border-radius: var(--mobile-step-surface-radius);
    box-shadow: var(--mobile-step-surface-shadow);
    display: flex !important;
    flex-direction: column;
    gap: clamp(0.6rem, 0.54rem + 0.25vw, 0.72rem);
  }
```

- [ ] **Step 2: Replace the rule with the transparent version**

Replace the block above with:
```css
  #step-1 .step-band--primary,
  #step-1 .step-band--secondary {
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    display: flex !important;
    flex-direction: column;
    gap: clamp(0.6rem, 0.54rem + 0.25vw, 0.72rem);
  }
```

What changed and why:
- `padding: 0 !important` — card inner padding removed; no card frame means no need for it
- `background: transparent !important` — removes the `linear-gradient(180deg, rgba(39,39,42,0.74), rgba(24,24,27,0.58))` dark fill
- `border: 0 !important` — removes the `1px solid rgba(255,255,255,0.06)` border line
- `border-radius: 0 !important` — removes rounded corners (cosmetic with no background, but matches pattern)
- `box-shadow: none !important` — removes the `inset 0 1px 0 rgba(255,255,255,0.03)` glow
- `display: flex`, `flex-direction: column`, `gap` — **kept** so the section heading and content within each band stay spaced correctly

---

### Task 3: Verify the fix visually

**Files:**
- Read: screenshot output

- [ ] **Step 1: Capture mobile step 1 screenshot after the change**

Run from `Seashell_studio_website/dev-tools/`:
```
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(1)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/after-step1-mobile.png' }); await browser.close(); })();"
```

Read `screens/after-step1-mobile.png`.

Expected:
- No dark card panels visible — sections blend into the page background
- "Brand Colour Palettes" label and palette grid still have proper spacing between them
- "Background Colour" label and the three mode buttons still have proper spacing between them
- Spacing between the two sections unchanged (controlled by `--mobile-wireframe-band-gap` on the grid container, not the card)

- [ ] **Step 2: Confirm desktop is unaffected**

Run from `Seashell_studio_website/dev-tools/`:
```
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('http://127.0.0.1:8000'); await page.waitForTimeout(500); await page.evaluate(() => window.navigateToStep(1)); await page.waitForTimeout(600); await page.screenshot({ path: 'screens/after-step1-desktop.png' }); await browser.close(); })();"
```

Read `screens/after-step1-desktop.png`. Expected: identical to how desktop looked before — no visible cards, same layout as always.

---

### Task 4: Commit and push

**Files:**
- Commit: `Seashell_studio_website/styles/mobile.css`

- [ ] **Step 1: Stage and commit**

Run from `Seashell_studio_website/`:
```
git add styles/mobile.css
git commit -m "fix: remove dark card wrappers from step 1 bands on mobile"
```

- [ ] **Step 2: Push**

```
git push origin main
```
