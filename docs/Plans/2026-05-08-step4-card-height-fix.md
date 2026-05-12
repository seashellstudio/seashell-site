# Step 4 Feature Card Height Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the excessive empty space inside the 5 top-row feature toggle cards on Step 4 (Optional Features) by allowing them to shrink to their natural content height instead of stretching to fill half the viewport.

**Architecture:** A single CSS block at `@media (min-width: 1060px)` sets `flex: 1 1 0%` on both `.features-row-primary` and `.features-row-secondary`, which splits the full step viewport height equally between them. The 5 compact toggle cards (title + label + one sentence each) don't have enough content to fill that height, leaving ~60% of each card as a dark void. The fix changes `.features-row-primary` to `flex: 0 0 auto` so it collapses to its natural height, while `.features-row-secondary` (the Social + Language cards — richer with platform grids and language tags) stays at `flex: 1 1 0%` and fills the remaining space. Two `min-height` guards in narrower breakpoints are also removed since they would fight the auto-sizing.

**Tech Stack:** Vanilla CSS. Playwright + Node for visual verification. Site served locally with `python -m http.server 8000` from `Seashell_studio_website/`.

---

### Task 1: Capture baseline screenshots

**Files:**
- No changes — read-only capture step.
- Output: `dev-tools/screens-baseline/`

- [ ] **Step 1: Start the local dev server (if not already running)**

From `Seashell_studio_website/`:
```
python -m http.server 8000
```
Leave it running in the background.

- [ ] **Step 2: Copy current screenshots to baseline**

From `Seashell_studio_website/dev-tools/`:
```
cmd /c node capture_screens.js
```
Then back up to baseline:
```powershell
Copy-Item screens\* screens-baseline\ -Force
```

- [ ] **Step 3: Verify baseline exists**

```powershell
(Get-ChildItem screens-baseline\).Count
```
Expected: 11 or more files.

---

### Task 2: Fix `.features-row-primary` flex growth

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:1915–1921`

This is the only change that fixes the core issue. The combined selector at line 1915 gives both rows `flex: 1 1 0%`. We split it into two separate rules so primary collapses to content height.

- [ ] **Step 1: Make the change**

Find this block (around line 1915):
```css
  #step-4 .features-row-primary,
  #step-4 .features-row-secondary {
    flex: 1 1 0%;
    min-height: 0;
    width: 100%;
    margin-inline: 0;
  }
```

Replace it with:
```css
  #step-4 .features-row-primary {
    flex: 0 0 auto;
    min-height: 0;
    width: 100%;
    margin-inline: 0;
  }

  #step-4 .features-row-secondary {
    flex: 1 1 0%;
    min-height: 0;
    width: 100%;
    margin-inline: 0;
  }
```

- [ ] **Step 2: Quick visual check in browser**

Reload `http://127.0.0.1:8000/` and navigate to Step 4. The 5 top-row cards should now be compact (roughly the height of their title + label + description). The Social Media and Language cards below should fill the remaining space down to the SKIP button.

---

### Task 3: Remove stale `min-height` guards on smaller desktop breakpoints

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:806–849`

These `min-height` values were set to ensure cards were "tall enough" under the old stretch layout. With the primary row now auto-sizing, they would fight the fix at viewport widths 1060–1439px.

- [ ] **Step 1: Remove the 11rem guard (1060–1439px breakpoint)**

Find this block (around line 806):
```css
@media (min-width: 1060px) and (max-width: 1439px) {
  #step-4 .step-mobile-fit-content {
    max-width: 1000px;
  }

  .features-row-primary {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.85rem 0.9rem;
  }

  .features-row-secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-toggle-card {
    min-height: 11rem;
  }
}
```

Remove only the last rule inside the block. The result should be:
```css
@media (min-width: 1060px) and (max-width: 1439px) {
  #step-4 .step-mobile-fit-content {
    max-width: 1000px;
  }

  .features-row-primary {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.85rem 0.9rem;
  }

  .features-row-secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 2: Remove the 10.75rem guard (1060–1185px breakpoint)**

Find this block (around line 825):
```css
@media (min-width: 1060px) and (max-width: 1185px) {
  #step-4 {
    padding-top: 2rem;
  }

  #step-4 .container-inner {
    gap: 1.15rem;
  }

  .features-layout {
    gap: 0.95rem;
  }

  .features-row-primary {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .features-row-secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-toggle-card {
    min-height: 10.75rem;
  }
}
```

Remove only the last rule. The result should be:
```css
@media (min-width: 1060px) and (max-width: 1185px) {
  #step-4 {
    padding-top: 2rem;
  }

  #step-4 .container-inner {
    gap: 1.15rem;
  }

  .features-layout {
    gap: 0.95rem;
  }

  .features-row-primary {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .features-row-secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

---

### Task 4: Visual verification

**Files:**
- Output: `dev-tools/screens-after/`

- [ ] **Step 1: Capture after-screenshots**

From `Seashell_studio_website/dev-tools/`:
```
cmd /c node capture_screens.js
```
Then copy to after folder:
```powershell
Copy-Item screens\* screens-after\ -Force
```

- [ ] **Step 2: Check Step 4 desktop — primary cards are compact**

Open `screens-after/desktop-step-4.png` and `screens-baseline/desktop-step-4.png` side by side.

After: the 5 top-row cards (Contact, Payment, Booking, Blog, Newsletter) should be noticeably shorter — roughly the height of their own content (heading + label + description). The lower 60% dark void should be gone.

- [ ] **Step 3: Check Step 4 desktop — secondary cards fill the space**

In `screens-after/desktop-step-4.png`: the Social Media and Language cards should fill the remaining vertical space down toward the SKIP button, and should look the same height or taller than before.

- [ ] **Step 4: Verify no other step was affected**

Compare `screens-baseline/` vs `screens-after/` for all other steps:
- `desktop-step-1.png` — no change expected
- `desktop-step-2.png` — no change expected
- `desktop-step-3.png` — no change expected
- `desktop-step-5.png` — no change expected
- All mobile screenshots — no change expected (this fix only targets `@media (min-width: 1060px)` blocks)

- [ ] **Step 5: Check nothing overflows**

On Step 4 in the browser at 1440px wide: scroll should never appear. Content must fit within the viewport. Check at 1060px wide too (drag the browser narrower or use DevTools device emulation at 1060px width).

---

### Task 5: Commit

**Files:** `styles/main.css` only.

- [ ] **Step 1: Stage and commit**

From `Seashell_studio_website/` (the git root):
```bash
git add styles/main.css
git commit -m "fix: step 4 feature cards no longer stretch to fill viewport

Primary row (5 toggle cards) changed from flex: 1 1 0% to flex: 0 0 auto
so cards collapse to their content height instead of filling half the
viewport. Secondary row (Social + Language) keeps flex: 1 1 0% and fills
remaining space. Removes stale min-height guards at 1060-1439px and
1060-1185px breakpoints."
```

- [ ] **Step 2: Verify commit**

```bash
git log --oneline -3
```
Expected: new commit at the top.
