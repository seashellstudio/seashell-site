# Step 5 Mobile Input Size Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Step 5 input font-size and padding on mobile so text fields don't feel oversized in narrow columns.

**Architecture:** `onboarding-steps-3-5.css` contains a mobile media query block (~line 885) that overrides the base `12px` input font-size to `16px` — this was done to prevent iOS Safari from auto-zooming the viewport when an input is focused (a known Safari behavior triggered by any input below 16px). The fix adds two small rule blocks in `mobile.css` (which loads after `onboarding-steps-3-5.css`, so it wins the cascade at equal specificity) to pull the font-size back down to `13px` and reduce padding proportionally. The location input's pin icon is positioned via `.icon-pos { left: 0.75rem }` plus an inline `padding-left: 2.5rem` on the input — both need to shrink together on mobile. **Known tradeoff:** iOS Safari will briefly zoom the viewport when a Step 5 input is tapped. For a once-per-user intake form this is acceptable.

**Tech Stack:** CSS only — `styles/mobile.css`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `styles/mobile.css` | Modify | Add font-size + padding overrides for Step 5 inputs; reduce icon-pos left offset and input-location padding-left |

No HTML changes, no JS changes, no other CSS files touched.

---

### Task 1: Override input font-size and padding on mobile

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` — insert inside the existing `@media (max-width: 1059px)` block, just before the closing `}` at the end of the file (currently line 553)

- [ ] **Step 1: Read the end of mobile.css to confirm insertion point**

Open `Seashell_studio_website/styles/mobile.css`. Confirm the file ends with:

```css
  #step-5 .input-icon-wrapper {
    min-height: 0;
  }

  #view-onboarding .floating-action-btn {
    ...
  }
}
```

The closing `}` on the last line is the end of the `@media (max-width: 1059px)` block. All new rules go **before** that closing `}`.

- [ ] **Step 2: Add font-size, padding, and icon rules**

Insert the following block inside `mobile.css`, immediately before the final closing `}`:

```css
  /* Step 5 input sizing — smaller than the 16px set in onboarding-steps-3-5.css
     to avoid inputs looking oversized in narrow two-column mobile layout.
     Tradeoff: iOS Safari will zoom briefly on input focus (acceptable for a one-time form). */
  #step-5 .input-group input,
  #step-5 .input-group textarea {
    font-size: 13px;
    padding: 0.55rem 0.7rem;
  }

  #step-5 .input-group input::placeholder,
  #step-5 .input-group textarea::placeholder {
    font-size: 13px;
  }

  /* Location field: reduce icon inset and left padding to match smaller font */
  #step-5 .icon-pos {
    left: 0.5rem;
  }

  #step-5 #input-location {
    padding-left: 1.6rem !important;
  }
```

- [ ] **Step 3: Take verification screenshots at three phone widths**

From `Seashell_studio_website/dev-tools/`, with the dev server running at `http://127.0.0.1:8000`:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [w, h] of [[360, 780], [390, 844], [430, 932]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://127.0.0.1:8000');
    await page.waitForTimeout(800);
    await page.evaluate(() => window.navigateToStep(5));
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'screens/inputsize-' + w + '.png' });
  }
  await browser.close();
  console.log('done');
})();
"
```

Check each screenshot:
- Input boxes should look noticeably slimmer (shorter height, smaller text)
- Placeholder text ("e.g. Seashell Studio", "e.g. local families", "e.g. Waterloo, ON") should remain fully visible
- Location pin icon should not overlap the placeholder text

- [ ] **Step 4: Measure computed font-size to confirm the override applied**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForTimeout(800);
  await page.evaluate(() => window.navigateToStep(5));
  await page.waitForTimeout(700);
  const result = await page.evaluate(() => {
    const input = document.getElementById('input-business-name');
    const loc = document.getElementById('input-location');
    const cs = getComputedStyle(input);
    const csloc = getComputedStyle(loc);
    return {
      inputFontSize: cs.fontSize,
      inputHeight: input.getBoundingClientRect().height,
      locationPaddingLeft: csloc.paddingLeft,
    };
  });
  console.log(result);
  await browser.close();
})();
"
```

Expected:
- `inputFontSize`: `'13px'`
- `inputHeight`: approximately `37–42px` (down from 54px)
- `locationPaddingLeft`: approximately `25–27px` (down from 40px)

If `inputFontSize` is still `'16px'`, the rule didn't apply — check for a typo in the selector or confirm `mobile.css` is the last stylesheet in `index.html`.

- [ ] **Step 5: Desktop regression check**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForTimeout(800);
  await page.evaluate(() => window.navigateToStep(5));
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screens/inputsize-desktop.png' });
  const fs = await page.evaluate(() =>
    getComputedStyle(document.getElementById('input-business-name')).fontSize
  );
  console.log('desktop font-size:', fs);
  await browser.close();
})();
"
```

Expected: `desktop font-size: 12px` — unchanged. The `@media (max-width: 1059px)` wrapper in `mobile.css` ensures the new rules never fire on desktop.

- [ ] **Step 6: Commit**

From `Seashell_studio_website/`:

```bash
git add styles/mobile.css
git commit -m "fix: reduce Step 5 input font-size and padding on mobile"
```
