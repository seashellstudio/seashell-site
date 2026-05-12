# Header Spacing Halve Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Halve the desktop header spacing tokens so the title→subtitle gap drops from 30px → 15px and the subtitle→content gap drops from 60px → 30px, while keeping the existing 2:1 ratio as a permanent documented rule.

**Architecture:** Two CSS custom property values in `:root` inside `styles/main.css` control all desktop onboarding header spacing universally. No per-step overrides exist for these tokens on desktop. Updating the token values cascades to all 5 steps automatically. Mobile spacing is hardcoded separately and is unaffected.

**Tech Stack:** Vanilla CSS (no build step). Playwright + Node for visual verification. Site served locally with `python -m http.server 8000` from `Seashell_studio_website/`.

---

### Task 1: Capture baseline screenshots

**Files:**
- Read: `Seashell_studio_website/dev-tools/capture_screens.js` (no changes)
- Output: `Seashell_studio_website/dev-tools/screens-baseline/` (before state)

- [ ] **Step 1: Start the local dev server**

From `Seashell_studio_website/`:
```
python -m http.server 8000
```
Leave it running in the background.

- [ ] **Step 2: Copy current screenshots to baseline**

From `Seashell_studio_website/dev-tools/`:
```
cmd /c npx node capture_screens.js
```
This writes desktop + mobile screenshots for all 5 steps to `screens/`. Then copy them to `screens-baseline/`:
```powershell
Copy-Item screens\* screens-baseline\ -Force
```

- [ ] **Step 3: Verify baseline exists**

Check that `screens-baseline/` contains at least 10 files (2 per step × 5 steps):
```powershell
(Get-ChildItem screens-baseline\).Count
```
Expected: ≥ 10

---

### Task 2: Update the two spacing tokens

**Files:**
- Modify: `Seashell_studio_website/styles/main.css:29-30`

- [ ] **Step 1: Edit the tokens**

In `styles/main.css`, find the `:root` block and change:

```css
/* BEFORE */
--step-header-margin-bottom: 3.75rem;
--step-title-subtitle-gap: 1.875rem; /* 30px */
```

```css
/* AFTER */
--step-header-margin-bottom: 1.875rem; /* 30px — subtitle-to-content gap */
--step-title-subtitle-gap: 0.9375rem; /* 15px — title-to-subtitle gap; always half of --step-header-margin-bottom */
```

That is the **entire code change** for this task.

---

### Task 3: Visual verification with screenshots

**Files:**
- Output: `Seashell_studio_website/dev-tools/screens-after/` (post-change state)

- [ ] **Step 1: Capture after-screenshots**

With the dev server still running, from `Seashell_studio_website/dev-tools/`:
```
cmd /c npx node capture_screens.js
```
Then copy to `screens-after/`:
```powershell
Copy-Item screens\* screens-after\ -Force
```

- [ ] **Step 2: Visually compare each step (desktop)**

Open each pair side-by-side. For each step (1–5) check:
- The gap between the step title text and the subtitle text is visibly smaller than before (roughly half)
- The gap between the subtitle text and the first content element is visibly smaller (roughly half)
- The 2:1 ratio is visible — the subtitle→content gap looks exactly twice the title→subtitle gap
- No content is clipped, cut off, or overflowing out of the viewport

If any step's content is now clipped on desktop (content pushes past the bottom of the viewport), that step needs an inner content fix — but this should not happen since we are reducing space, not adding it.

- [ ] **Step 3: Verify mobile is unchanged**

Compare mobile screenshots (steps 1–5) between `screens-baseline/` and `screens-after/`. They must be pixel-identical. Mobile spacing is hardcoded (`0.45rem !important` and `1.2rem`) and does not use these tokens, so no change is expected.

---

### Task 4: Update Site-guidelines.md

**Files:**
- Modify: `Seashell_studio_website/docs/Site-guidelines.md`

- [ ] **Step 1: Update the token values in the design token reference**

Find the section in `docs/Site-guidelines.md` that documents the step spacing tokens and update the values to match the new ones. Also add the 2:1 ratio rule if it is not already present. The text to add or update:

```
- Step title→subtitle gap: `--step-title-subtitle-gap: 0.9375rem` (15px)
- Step subtitle→content gap: `--step-header-margin-bottom: 1.875rem` (30px)
- Rule: `--step-header-margin-bottom` must always equal exactly 2× `--step-title-subtitle-gap`. Never override either token independently on a per-step basis.
```

---

### Task 5: Commit

**Files:** All modified files staged together.

- [ ] **Step 1: Stage and commit**

From `Seashell_studio_website/` (the git root):
```bash
git add styles/main.css docs/Site-guidelines.md
git commit -m "design: halve desktop header spacing tokens, document 2:1 gap ratio rule

--step-header-margin-bottom: 3.75rem → 1.875rem (60px → 30px)
--step-title-subtitle-gap: 1.875rem → 0.9375rem (30px → 15px)
Ratio preserved at 2:1. Mobile spacing unaffected (hardcoded values)."
```

- [ ] **Step 2: Verify commit**

```bash
git log --oneline -3
```
Expected: new commit appears at the top.
