# Step 5 Mobile — Compact Natural-Height Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fill-screen CSS grid on Step 5 mobile so all inputs size to their content instead of stretching to fill the viewport.

**Architecture:** Seven targeted edits to `styles/mobile.css` inside the existing `@media (max-width: 1059px)` block. The root cause is a cascade of `height: 100%` and `minmax(0, 1fr)` grid rows that flows from the form container all the way into each `<input>` element. We break that cascade at every level, then set explicit `min-height` on the optional textareas and the upload box so they remain usable. The form will sit naturally in the upper portion of the viewport with the fixed FAB at the bottom — no scrolling, no forced fill. The font-size fix (13px) from the prior plan is already applied and stays untouched.

**Tech Stack:** CSS only — `styles/mobile.css`

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `styles/mobile.css` | Modify | 7 targeted rule edits inside `@media (max-width: 1059px)` — no new rules added |

No HTML, no JS, no desktop rules, no other CSS files touched.

---

## Context: why each change is needed

The current mobile layout chains `height: 100%` through four layers and uses fractional grid rows to distribute the full viewport height down into each input:

```
.finish-form-layout  { height: 100%; grid-template-rows: 1fr 0.7fr }
  .finish-form-main  { height: 100%; grid-template-rows: repeat(4, 1fr) }
    .input-group     { grid-template-rows: auto 1fr }   ← input gets 1fr
      input          ← ends up ~55px tall for 13px text
```

Also, `.finish-form-layout` inherits `flex: 1 1 auto` from a shared rule higher in `mobile.css` — this causes it to grow to fill the step-shell even after we change `height` to `auto`. That needs an explicit override.

---

### Task 1 — Outer form grid: stop fill-height, fix row template

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` (the `#step-5 .finish-form-layout` block, around line 485)

- [ ] **Step 1: Find the block**

Open `styles/mobile.css`. Find this exact block (it will be inside the `@media (max-width: 1059px)` rule):

```css
  #step-5 .finish-form-layout {
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.04fr);
    grid-template-rows: minmax(0, 1fr) minmax(6.5rem, 0.7fr);
    gap: var(--mobile-step-content-gap);
    z-index: auto !important;
  }
```

- [ ] **Step 2: Replace it with**

```css
  #step-5 .finish-form-layout {
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    flex: 0 0 auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.04fr);
    grid-template-rows: auto auto;
    gap: var(--mobile-step-content-gap);
    z-index: auto !important;
  }
```

Three changes: `height: 100%` → `height: auto`, added `flex: 0 0 auto !important` (overrides the `flex: 1 1 auto` inherited from a shared rule above), `grid-template-rows` → `auto auto`.

---

### Task 2 — Column heights and row templates: remove fractional stretching

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` (~lines 500–517)

- [ ] **Step 1: Fix the shared height rule on both columns**

Find:
```css
  #step-5 .finish-form-main,
  #step-5 .finish-form-side {
    min-width: 0;
    min-height: 0;
    height: 100%;
    display: grid !important;
    overflow: hidden;
  }
```

Replace with:
```css
  #step-5 .finish-form-main,
  #step-5 .finish-form-side {
    min-width: 0;
    min-height: 0;
    height: auto;
    display: grid !important;
    overflow: hidden;
  }
```

- [ ] **Step 2: Fix the main column row template**

Find:
```css
  #step-5 .finish-form-main {
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: clamp(0.5rem, 0.45rem + 0.19vw, 0.6rem);
  }
```

Replace with:
```css
  #step-5 .finish-form-main {
    grid-template-rows: repeat(4, auto);
    gap: clamp(0.5rem, 0.45rem + 0.19vw, 0.6rem);
  }
```

- [ ] **Step 3: Fix the side column row template**

Find:
```css
  #step-5 .finish-form-side {
    grid-template-rows: minmax(0, 1.28fr) minmax(0, 0.9fr) minmax(0, 1fr);
    gap: clamp(0.5rem, 0.45rem + 0.19vw, 0.6rem);
  }
```

Replace with:
```css
  #step-5 .finish-form-side {
    grid-template-rows: auto auto auto;
    gap: clamp(0.5rem, 0.45rem + 0.19vw, 0.6rem);
  }
```

---

### Task 3 — Input-group inner rows: stop stretching the input itself

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` (~lines 537–547)

Each `.input-group` is itself a 2-row grid — label (`auto`) and field (`1fr`). The `1fr` makes the `<input>` stretch to fill its group cell. Changing to `auto auto` lets both rows size to their content.

- [ ] **Step 1: Find the block**

```css
  #step-5 .finish-form-main .input-group,
  #step-5 .finish-form-side .input-group,
  #step-5 .finish-grid-full .input-group {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0.3rem;
    min-height: 0;
    margin: 0;
    padding: 0 !important;
    overflow: hidden;
  }
```

- [ ] **Step 2: Replace with**

```css
  #step-5 .finish-form-main .input-group,
  #step-5 .finish-form-side .input-group,
  #step-5 .finish-grid-full .input-group {
    display: grid;
    grid-template-rows: auto auto;
    gap: 0.3rem;
    min-height: 0;
    margin: 0;
    padding: 0 !important;
    overflow: hidden;
  }
```

One change: `auto minmax(0, 1fr)` → `auto auto`.

---

### Task 4 — Final Notes container: break the height chain

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` (~lines 519–535)

Three chained rules all say `height: 100%` — container, input-group, textarea. All three need to change.

- [ ] **Step 1: Fix the finish-grid-full container**

Find:
```css
  #step-5 .finish-grid-full {
    grid-column: 1 / -1;
    min-height: 0;
    height: 100%;
    margin-top: 0;
    padding-top: 0 !important;
    overflow: hidden;
  }
```

Replace with:
```css
  #step-5 .finish-grid-full {
    grid-column: 1 / -1;
    min-height: 0;
    height: auto;
    margin-top: 0;
    padding-top: 0 !important;
    overflow: hidden;
  }
```

- [ ] **Step 2: Fix the input-group inside finish-grid-full**

Find:
```css
  #step-5 .finish-grid-full .input-group {
    height: 100%;
  }
```

Replace with:
```css
  #step-5 .finish-grid-full .input-group {
    height: auto;
  }
```

- [ ] **Step 3: Fix the Final Notes textarea**

Find:
```css
  #step-5 .finish-grid-full .input-group textarea {
    height: 100%;
    min-height: 0;
  }
```

Replace with:
```css
  #step-5 .finish-grid-full .input-group textarea {
    height: auto;
    min-height: 68px;
  }
```

---

### Task 5 — Side column components: natural heights for upload, timeline, and references

**Files:**
- Modify: `Seashell_studio_website/styles/mobile.css` (~lines 549–567)

- [ ] **Step 1: Fix the timeline bar**

Find:
```css
  #step-5 .timeline-bar {
    height: 100%;
  }
```

Replace with:
```css
  #step-5 .timeline-bar {
    height: auto;
  }
```

- [ ] **Step 2: Fix the timeline buttons**

Find:
```css
  #step-5 .timeline-btn {
    min-height: 0;
    height: 100%;
  }
```

Replace with:
```css
  #step-5 .timeline-btn {
    min-height: 0;
    height: auto;
  }
```

- [ ] **Step 3: Fix the upload box**

Find:
```css
  #step-5 .upload-box {
    height: 100%;
    min-height: 0;
  }
```

Replace with:
```css
  #step-5 .upload-box {
    height: auto;
    min-height: 72px;
  }
```

`min-height: 72px` ensures the cloud icon + two text lines are always visible.

- [ ] **Step 4: Fix the references and final-notes textareas**

Find:
```css
  #step-5 #input-reference,
  #step-5 #input-final-notes {
    height: 100%;
    min-height: 0;
  }
```

Replace with:
```css
  #step-5 #input-reference,
  #step-5 #input-final-notes {
    height: auto;
    min-height: 68px;
  }
```

---

### Task 6 — Visual verification: screenshots at 3 phone widths

**Files:** None — screenshots only

- [ ] **Step 1: Take screenshots at 360, 390, and 430px**

From `Seashell_studio_website/dev-tools/`:

```bash
node -e "
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const wait = ms => new Promise(r => setTimeout(r, ms));
const s = spawn('cmd', ['/c', 'npx', 'serve', '..', '-p', '8000'], { stdio: 'ignore' });
(async () => {
  await wait(2000);
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [w, h] of [[360, 780], [390, 844], [430, 932]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.goto('http://127.0.0.1:8000');
    await wait(800);
    await p.evaluate(() => window.navigateToStep(5));
    await wait(600);
    await p.screenshot({ path: 'screens/compact-' + w + '.png' });
    console.log('shot: ' + w);
  }
  await b.close(); s.kill();
  console.log('done');
})();
"
```

Review each screenshot. All of the following must be true:
- Inputs look compact and proportional — the height of each field should visually match the size of the text inside it
- The two-column layout is intact
- Upload box shows the cloud icon + "Upload Media" + "Logo or Assets" (at least ~72px tall)
- Timeline shows 3 side-by-side buttons at their natural text height
- References and Final Notes are small but visible textareas (~68px each)
- Nothing is cut off or overflows the viewport
- No scrollbar appears

- [ ] **Step 2: Measure computed dimensions to confirm the fix**

```bash
node -e "
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const wait = ms => new Promise(r => setTimeout(r, ms));
const s = spawn('cmd', ['/c', 'npx', 'serve', '..', '-p', '8000'], { stdio: 'ignore' });
(async () => {
  await wait(2000);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://127.0.0.1:8000');
  await wait(800);
  await p.evaluate(() => window.navigateToStep(5));
  await wait(600);
  const m = await p.evaluate(() => {
    const r = el => ({ w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) });
    return {
      businessInput: r(document.getElementById('input-business-name')),
      finalNotes:    r(document.getElementById('input-final-notes')),
      uploadBox:     r(document.querySelector('.upload-box')),
      timelineBar:   r(document.querySelector('.timeline-bar')),
      references:    r(document.getElementById('input-reference')),
    };
  });
  console.log(JSON.stringify(m, null, 2));
  await b.close(); s.kill();
})();
"
```

Expected at 390px:

| Element | Before | Expected after |
|---------|--------|----------------|
| `businessInput.h` | ~55px | 34–42px |
| `finalNotes.h` | ~202px | 68–85px |
| `uploadBox.h` | ~102px | 72–95px |
| `timelineBar.h` | ~92px | 32–48px |
| `references.h` | ~76px | 68–85px |

If `businessInput.h` is still ≥ 50px, the grid-template-rows change in Task 2 or 3 did not apply. Grep `mobile.css` for `minmax(0, 1fr)` — if it still appears inside the Step 5 section, one of the replacements was missed.

- [ ] **Step 3: Desktop regression screenshot**

```bash
node -e "
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const wait = ms => new Promise(r => setTimeout(r, ms));
const s = spawn('cmd', ['/c', 'npx', 'serve', '..', '-p', '8000'], { stdio: 'ignore' });
(async () => {
  await wait(2000);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto('http://127.0.0.1:8000');
  await wait(800);
  await p.evaluate(() => window.navigateToStep(5));
  await wait(600);
  await p.screenshot({ path: 'screens/compact-desktop.png' });
  await b.close(); s.kill();
  console.log('done');
})();
"
```

The desktop screenshot must look identical to before — all changes in this plan are inside `@media (max-width: 1059px)` and cannot affect desktop.

---

### Task 7 — Run Playwright tests and commit

**Files:**
- `styles/mobile.css`

- [ ] **Step 1: Run the full test suite**

From `Seashell_studio_website/dev-tools/`, with the server running:

```bash
cmd /c npx playwright test
```

Expected: all 7 tests pass. No HTML was changed so all structural selectors remain intact.

If a test fails, read the output. The most likely cause is a timing issue — increase `waitForTimeout` in the failing test rather than changing production code.

- [ ] **Step 2: Commit**

From `Seashell_studio_website/`:

```bash
git add styles/mobile.css
git commit -m "fix: Step 5 mobile — compact natural-height form layout"
```
