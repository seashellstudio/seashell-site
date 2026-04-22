# Onboarding Layout Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate visual "jumps" between onboarding steps by centralizing `.step-container` / `.step-header` / `.step-title` rules in `styles/main.css` and removing conflicting step-specific overrides.

**Architecture:** Three-file cleanup (`styles/main.css`, `styles/onboarding-steps-1-2.css`, `styles/onboarding-steps-3-5.css`) plus one JS change to `main.js::updateView()` for explicit `display: none` on inactive steps. Visual regressions caught by Playwright bounding-rect audit plus side-by-side screenshots.

**Tech Stack:** Vanilla HTML/CSS/JS. Playwright in `dev-tools/` for automated verification. `cmd /c npm` / `cmd /c npx` required on this Windows machine (PS execution disabled).

---

## File-Path Mapping

The original plan used shorthand filenames. The actual paths are:

| Plan name | Actual path |
|---|---|
| `style.css` | `Seashell_studio_website/styles/main.css` |
| `style-step12.css` | `Seashell_studio_website/styles/onboarding-steps-1-2.css` |
| `style-step35.css` | `Seashell_studio_website/styles/onboarding-steps-3-5.css` |
| `main.js` | `Seashell_studio_website/main.js` |

Mobile-specific rules also live in `Seashell_studio_website/styles/mobile.css`; that file is in scope.

---

## Pre-flight

- [ ] **Step 0.1: Confirm working tree is clean**

Run from `Seashell_studio_website/`:
```bash
git status --short
```
Expected: empty output. If not, stash or commit before starting.

- [ ] **Step 0.2: Start local dev server**

Run from `Seashell_studio_website/`:
```bash
python -m http.server 8000
```
Expected: `Serving HTTP on :: port 8000 ...`. Leave running in a separate terminal.

- [ ] **Step 0.3: Capture baseline screenshots**

Run from `Seashell_studio_website/dev-tools/`:
```bash
cmd /c npm install
node capture_screens.js
```
Expected: screenshots saved. Rename the output folder to `screens-baseline/` so we can diff against it later:
```bash
mv screens screens-baseline
```

- [ ] **Step 0.4: Commit baseline snapshot location**

```bash
git add -A
git commit -m "chore: capture baseline screenshots before onboarding layout standardization"
```

---

## Task 1: Write the verification audit script

**Files:**
- Create: `Seashell_studio_website/dev-tools/step-header-alignment-audit.cjs`

- [ ] **Step 1.1: Write the audit script**

Create `Seashell_studio_website/dev-tools/step-header-alignment-audit.cjs`:

```javascript
// Measures getBoundingClientRect().top of .step-title on each onboarding step
// and asserts they match within a 1px tolerance. Runs at desktop (1440px)
// and mobile (390px) viewports.

const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:8000/';
const STEPS = [1, 2, 3, 4, 5];
const TOLERANCE_PX = 1;
const VIEWPORTS = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile',  width: 390,  height: 844 }
];

async function measureStep(page, stepIndex) {
  await page.evaluate((i) => window.navigateToStep(i), stepIndex);
  await page.waitForTimeout(600); // wait for opacity transition + rAF chain
  return page.evaluate((i) => {
    const el = document.querySelector(`#step-${i} .step-title`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      top: rect.top,
      fontSize: cs.fontSize,
      visible: rect.width > 0 && rect.height > 0
    };
  }, stepIndex);
}

(async () => {
  const browser = await chromium.launch();
  let hadFailure = false;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.evaluate(() => window.navigateToStep(1));
    await page.waitForTimeout(400);

    const results = [];
    for (const i of STEPS) {
      results.push({ step: i, ...(await measureStep(page, i)) });
    }

    const tops = results.map(r => r.top);
    const maxTop = Math.max(...tops);
    const minTop = Math.min(...tops);
    const spread = maxTop - minTop;

    console.log(`\n=== ${vp.label} (${vp.width}x${vp.height}) ===`);
    for (const r of results) {
      console.log(`  step-${r.step}: top=${r.top.toFixed(2)}px fontSize=${r.fontSize} visible=${r.visible}`);
    }
    console.log(`  spread: ${spread.toFixed(2)}px (tolerance: ${TOLERANCE_PX}px)`);

    if (spread > TOLERANCE_PX) {
      console.error(`  FAIL: .step-title top varies by more than ${TOLERANCE_PX}px`);
      hadFailure = true;
    } else {
      console.log('  PASS');
    }

    await ctx.close();
  }

  await browser.close();
  process.exit(hadFailure ? 1 : 0);
})();
```

- [ ] **Step 1.2: Run the audit against the CURRENT (unmodified) code to capture the pre-refactor state**

Run from `Seashell_studio_website/dev-tools/`:
```bash
node step-header-alignment-audit.cjs 2>&1 | tee audit-before.txt
```
Expected: Script runs; likely FAILs the spread check on one or both viewports (this is the problem we're fixing). Save the output — we'll compare after the refactor.

- [ ] **Step 1.3: Commit the audit script**

```bash
git add dev-tools/step-header-alignment-audit.cjs dev-tools/audit-before.txt
git commit -m "test: add .step-title alignment audit across steps 1-5"
```

---

## Task 2: Remove `#step-4 .step-title` desktop override in `main.css`

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:704-707`

**Context:** `main.css` lines 704-707 currently have a `#step-4`-only override on `.step-title` that duplicates the base `.step-title` font-size and adds a different `margin-bottom`. This is a no-op for font-size but makes the margin inconsistent with other steps.

Current code:
```css
#step-4 .step-title {
  font-size: var(--step-title-size);
  margin-bottom: 0.35rem;
}
```

- [ ] **Step 2.1: Delete the block**

Open `Seashell_studio_website/styles/main.css`. At line 704-707, delete the four-line block entirely (including the blank line after it if present). The base `.step-title` rule at line 621 (which sets `margin-bottom: 1rem`) will take effect for step-4 after removal.

- [ ] **Step 2.2: Reload the page, visually confirm Step 4 header**

In the browser at `http://127.0.0.1:8000`, click through to Step 4. Confirm the title "Features" now has the same bottom spacing as Step 1's title. No text clipping.

- [ ] **Step 2.3: Commit**

```bash
git add styles/main.css
git commit -m "refactor(css): remove redundant #step-4 .step-title desktop override"
```

---

## Task 3: Centralize `.step-container` padding token in `main.css`

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:26-27` (add CSS custom property)
- Modify: `Seashell_studio_website/styles/main.css:584-596` (reference the token)

**Context:** `.step-container` currently hard-codes `padding: 0 3rem`. Adding a named token makes the contract explicit and lets step-specific overrides be replaced with references (or removed).

- [ ] **Step 3.1: Add the token to `:root`**

In `Seashell_studio_website/styles/main.css`, find the `:root { ... }` block (starts around line 10). After the existing `--step-title-size: clamp(...)` declaration at line 26, add:

```css
  --step-container-padding-desktop: 0 3rem;
  --step-header-margin-bottom: 2rem;
```

- [ ] **Step 3.2: Reference the tokens in `.step-container` and `.step-header`**

In the same file, replace lines 584-605:

Current:
```css
.step-container {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 0 3rem;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.step-container.active { opacity: 1; pointer-events: auto; }

.container-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;
}

.step-header { margin-bottom: 2rem; }
```

Replace with:
```css
.step-container {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: var(--step-container-padding-desktop);
  overflow-y: auto;
  overscroll-behavior-y: contain;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.step-container.active { opacity: 1; pointer-events: auto; }

.container-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;
}

.step-header { margin-bottom: var(--step-header-margin-bottom); }
```

- [ ] **Step 3.3: Reload and visually sweep all 5 steps**

Navigate through steps 1 → 5 in the browser at 1440px width. Confirm no layout regression. Spacing should be identical to before (values are preserved).

- [ ] **Step 3.4: Commit**

```bash
git add styles/main.css
git commit -m "refactor(css): extract .step-container and .step-header spacing tokens"
```

---

## Task 4: Remove `#step-5 .mb-8` desktop override in `onboarding-steps-3-5.css`

**Files:**
- Modify: `Seashell_studio_website/styles/onboarding-steps-3-5.css:606-608`

**Context:** `.mb-8` is a utility class that should produce consistent spacing everywhere it's used. `#step-5 .mb-8 { margin-bottom: 2.35rem; }` overrides it for no stated structural reason.

Current code at line 606-608:
```css
#step-5 .mb-8 {
  margin-bottom: 2.35rem;
}
```

- [ ] **Step 4.1: Delete the desktop override**

Remove the three-line block at lines 606-608 in `styles/onboarding-steps-3-5.css`.

- [ ] **Step 4.2: Reload and inspect Step 5 at 1440px**

Navigate to Step 5 in the browser. Check that the header-to-form gap looks visually consistent with Step 4's header-to-content gap. Screenshot mentally or with `capture_screens.js` if uncertain.

- [ ] **Step 4.3: Commit**

```bash
git add styles/onboarding-steps-3-5.css
git commit -m "refactor(css): remove #step-5 .mb-8 desktop margin override"
```

---

## Task 5: Remove `#step-5 .mb-8` mobile override in `onboarding-steps-3-5.css`

**Files:**
- Modify: `Seashell_studio_website/styles/onboarding-steps-3-5.css:786-788`

**Context:** Same utility-class override, mobile variant.

Current code at line 786-788 (inside a mobile `@media` block):
```css
  #step-5 .mb-8 {
    margin-bottom: clamp(1.7rem, 1.58rem + 0.5vw, 1.9rem);
  }
```

- [ ] **Step 5.1: Delete the mobile override**

Remove the three-line block at 786-788. Do NOT remove the `@media` wrapper or other rules inside it.

- [ ] **Step 5.2: Reload and inspect Step 5 on mobile**

In the browser, resize to 390px width. Navigate to Step 5. Confirm title-to-form spacing looks consistent with Step 4 at the same viewport.

- [ ] **Step 5.3: Commit**

```bash
git add styles/onboarding-steps-3-5.css
git commit -m "refactor(css): remove #step-5 .mb-8 mobile margin override"
```

---

## Task 6: Remove `#step-1 .step-header` mobile margin reset in `onboarding-steps-1-2.css`

**Files:**
- Modify: `Seashell_studio_website/styles/onboarding-steps-1-2.css:519-522`

**Context:** `#step-1` resets `.step-header` margin to 0 on mobile. Mobile global rule at `styles/main.css:1765-1767` already sets `.step-header { margin-bottom: 1.2rem; }`. Step-1's override creates the inconsistency the global refactor is supposed to eliminate.

Current code:
```css
  #step-1 .step-header {
    margin-bottom: 0;
    flex-shrink: 0;
  }
```

- [ ] **Step 6.1: Delete the header margin reset, preserve the `flex-shrink`**

The `flex-shrink: 0` is load-bearing for the palette layout. Keep it but drop the margin override. Replace the four-line block at 519-522 with:

```css
  #step-1 .step-header {
    flex-shrink: 0;
  }
```

- [ ] **Step 6.2: Reload and inspect Step 1 on mobile**

Resize browser to 390px width. Navigate to Step 1. Check that:
- Title "Choose your palette" no longer sits flush against the palette grid
- Palette grid still fits within viewport (no scroll)

- [ ] **Step 6.3: Commit**

```bash
git add styles/onboarding-steps-1-2.css
git commit -m "refactor(css): remove #step-1 .step-header mobile margin reset"
```

---

## Task 7: Reconcile mobile `.step-title` `!important` blocks in `main.css`

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:1742-1748` (unify rule — already applies to all 5, but `!important` is a smell)

**Context:** Lines 1742-1748 already unify all five steps to the same mobile font-size with `!important`:

```css
  #step-1 .step-title,
  #step-2 .step-title,
  #step-3 .step-title,
  #step-4 .step-title,
  #step-5 .step-title {
    font-size: clamp(2rem, 1.53rem + 1.88vw, 2.75rem) !important;
  }
```

The `!important` exists to beat per-step overrides. Once those overrides are gone (Tasks 2, 8), this block collapses into the existing `.step-title` mobile rule at line 1635 and the `!important` can be dropped.

- [ ] **Step 7.1: Delete the redundant per-step block**

Remove lines 1742-1748 entirely. The base `.step-title` mobile rule at line 1635 already sets `font-size: clamp(2rem, 1.53rem + 1.88vw, 2.75rem);` — it will apply to all five steps once per-step overrides are gone.

- [ ] **Step 7.2: Reload and inspect all 5 step titles on mobile**

Resize to 390px. Navigate 1 → 5. Verify each title renders at the same font size. No title wraps unexpectedly, none is clipped.

- [ ] **Step 7.3: Commit**

```bash
git add styles/main.css
git commit -m "refactor(css): drop redundant per-step mobile .step-title font-size block"
```

---

## Task 8: Remove `#step-4 .step-title` DESKTOP `!important` override in `main.css`

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:2229-2233`

**Context:** Lines 2229-2233 live inside `@media (min-width: 1060px)` (opened at line 1770, closed at 2244). They shrink Step 4's title to `clamp(1.32rem, ..., 1.62rem)` on desktop with `!important` — roughly **half** the size of Steps 1-5's shared desktop title. This is almost certainly the "jump" the original plan flagged; the "mobile" framing in the original plan was incorrect (the override is desktop-only).

> [!WARNING]
> Removing this override will restore Step 4 title to the canonical `--step-title-size` (clamp 2.5rem..3.75rem). Step 4 has the most feature cards — the title enlargement may push content into overflow at narrow desktop widths. If layout breaks, the follow-up is shrinking feature cards, NOT re-adding the title override. Do not add `overflow-y: scroll` — that violates the no-scroll rule (see memory: feedback_no_scroll).

Current code at lines 2229-2233:
```css
  #step-4 .step-title {
    font-size: clamp(1.32rem, 1.15rem + 0.72vw, 1.62rem) !important;
    margin-bottom: clamp(0.16rem, 0.14rem + 0.08vw, 0.24rem);
    line-height: 1;
  }
```

- [ ] **Step 8.1: Delete the Step 4 desktop title override**

Remove lines 2229-2233. Keep the surrounding `#step-4 .step-header` (lines 2225-2227) and `#step-4 .step-subtitle` (lines 2235-2238) rules — they're orthogonal.

- [ ] **Step 8.2: Reload Step 4 at 1440px and 1060px widths**

At both widths, verify:
- Title "Features" renders at the same size as Step 1's title
- Feature cards still fit inside the viewport without scrolling
- FAB (next button) is still visible bottom-right

If cards overflow at 1060px, STOP and report back — the fix is adjusting `--features-desktop-gap` / `--features-top-card-height` (already declared at lines 1772-1773), not restoring the override.

- [ ] **Step 8.3: Commit**

```bash
git add styles/main.css
git commit -m "refactor(css): remove #step-4 .step-title desktop shrink override"
```

---

## Task 9: Update `updateView()` in `main.js` to set explicit `display: none` on inactive steps

**Files:**
- Modify: `Seashell_studio_website/main.js:360-366`

**Context:** Currently `updateView()` toggles the `.active` class; inactive steps rely on `opacity: 0` and `pointer-events: none` (set by `.step-container` in `main.css:592-593`). They still participate in layout measurement, which is what the original plan called "DOM piling." Adding explicit `display: none` on inactive steps removes them from the box tree while the active one animates in.

> [!NOTE]
> `.step-container` uses `transition: opacity 0.4s ease`. Setting `display: none` on the *outgoing* step mid-transition would cut the fade. Set `display: none` only on steps that are **already** inactive (i.e., apply it on the frame AFTER the transition would have completed — or only on steps that were inactive on the previous render). The simplest correct implementation: set `display` on non-active steps after the fade completes, and set `display: flex` on the active step immediately before adding `.active`.

Current code at `main.js:360-366`:
```javascript
        // Update Steps Visibility
        STEP_IDS.forEach(i => {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) {
                stepEl.classList.toggle('active', i === currentStep);
            }
        });
```

- [ ] **Step 9.1: Update the visibility loop**

Replace the block at lines 360-366 with:

```javascript
        // Update Steps Visibility
        // The active step gets display:flex immediately so its fade-in can run.
        // Inactive steps get display:flex during their fade-out, then display:none
        // once the transition is past so they no longer affect layout / measurement.
        STEP_IDS.forEach(i => {
            const stepEl = document.getElementById(`step-${i}`);
            if (!stepEl) return;
            const willBeActive = i === currentStep;
            if (willBeActive) {
                stepEl.style.display = 'flex';
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
                // Defer display:none until after the 0.4s opacity transition finishes.
                setTimeout(() => {
                    if (!stepEl.classList.contains('active')) {
                        stepEl.style.display = 'none';
                    }
                }, 450);
            }
        });
```

- [ ] **Step 9.2: Reload and manually click through the flow**

In the browser, click landing → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Back → Back → etc. Verify:
- Each transition fades smoothly (no cut)
- No flash-of-previous-step on arrival
- Back navigation works identically

- [ ] **Step 9.3: Check DevTools for inactive-step `display: none`**

With DevTools open, navigate to Step 3. Inspect `#step-1`, `#step-2`, `#step-4`, `#step-5` — each should have inline `style="display: none;"`. `#step-3` should have `style="display: flex;"` and class `active`.

- [ ] **Step 9.4: Commit**

```bash
git add main.js
git commit -m "refactor(js): set display:none on inactive onboarding steps after transition"
```

---

## Task 10: Run full verification

- [ ] **Step 10.1: Re-run the alignment audit**

From `Seashell_studio_website/dev-tools/`:
```bash
node step-header-alignment-audit.cjs 2>&1 | tee audit-after.txt
```
Expected: both `desktop` and `mobile` sections report `PASS`. Spread across steps 1-5 should be ≤ 1px on both viewports.

If any step FAILs: stop. The failing step still has an un-removed override. Grep for its selector in the three CSS files:
```bash
```
Use the Grep tool: pattern `#step-N .step-(title|header|container)`, where N is the failing step.

- [ ] **Step 10.2: Re-capture screenshots**

From `Seashell_studio_website/dev-tools/`:
```bash
node capture_screens.js
```
Expected: 10 PNGs (5 steps × desktop+mobile) in `screens/`.

- [ ] **Step 10.3: Side-by-side compare vs. baseline**

Open each baseline/post pair and eyeball. Acceptable differences:
- Step 4 desktop title noticeably larger (intended — override removed)
- Step 5 mobile+desktop header-to-form gap slightly different
- Step 1 mobile title-to-palette gap slightly larger

Unacceptable differences:
- Any step's content clipped or scrolling
- FAB missing or overlapping content
- Title text wrapping to more lines than baseline on any viewport

If unacceptable differences exist: revert the offending task's commit, re-audit, continue.

- [ ] **Step 10.4: Manual click-through on both viewports**

- Resize browser to 1440px. Landing → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → submit. Confirm flow works end-to-end.
- Resize to 390px. Repeat.

- [ ] **Step 10.5: Update Site-guidelines.md**

The canonical design system doc lives at `Seashell_studio_website/docs/Site-guidelines.md`. Add/update the relevant section to describe:
- `--step-container-padding-desktop` and `--step-header-margin-bottom` are the single source of truth
- Step-specific `.step-title`, `.step-header`, `.step-container` overrides are forbidden; all steps share the same shell
- Inactive steps have `display: none` after transition (via `updateView()` in `main.js`)

See `Seashell_studio_website/CLAUDE.md` — keeping Site-guidelines in sync is a hard rule.

- [ ] **Step 10.6: Final commit**

```bash
git add dev-tools/audit-after.txt docs/Site-guidelines.md
git commit -m "docs: document step layout standardization in Site-guidelines"
```

---

## Rollback

Each task is a single commit. To revert a specific change:
```bash
git log --oneline
git revert <sha>
```

To revert the entire refactor:
```bash
git reset --hard <sha-of-baseline-commit-from-Step-0.4>
```
(Destructive — only if no other commits sit on top.)

---

## Out of scope / follow-ups

- `.step-container` has `overflow-y: auto` at `styles/main.css:590`. Per user rule, no page should ever scroll. Keeping as-is (internal component scroll may be acceptable; the outer viewport is what matters). Flag for a later audit.
- `#step-2 .container-inner { height: min(calc(100vh - 7rem), 760px); }` at `onboarding-steps-1-2.css:300-302` is a step-specific height constraint not addressed by this plan. If font-preview-area breaks after the refactor, investigate separately.
- `#step-5 .step-header-zone { text-align: left !important; }` at `onboarding-steps-3-5.css:790-792` still uses `!important`. Not a "jump" cause — leave for a future cleanup pass.
