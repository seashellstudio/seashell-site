# Seashell Studio – Site Guidelines

## 1. Purpose

This document defines the full UI system for the Seashell Studio website.

It ensures:
- Design consistency across all pages
- Clear structure for development and iteration
- Reliable behavior across desktop and mobile layouts

This file should only be updated when structural or design system changes occur.

---

## 2. Global Design System

## 2.05 Viewport Constraint System

The Seashell Studio interface is designed as a **non-scrolling, fixed-viewport application**.

### Core Rule

- **No page should ever scroll vertically or horizontally**
- All content must fit entirely within the visible viewport at all times

---

### Layout Behavior

- The viewport acts as a fixed container
- All UI elements must scale to fit within it
- Content must never overflow or be hidden off-screen

---

### Scaling Strategy

- As screen height decreases:
  - Text scales down proportionally
  - Spacing compresses
  - Components shrink uniformly

- As screen width decreases:
  - Layout shifts (desktop → mobile)
  - Content stacks vertically
  - Elements resize to maintain fit

---

### Forbidden Behavior

- No vertical scrolling
- No horizontal scrolling
- No hidden content below the viewport
- No elements clipped by screen edges
- No reliance on scroll for usability

---

### Exception Handling

If content risks overflowing:
- Reduce spacing
- Reduce font size
- Collapse layout
- Prioritize visibility over aesthetic spacing

### 2.1 Brand Identity

- Tone: Clean, modern, slightly premium
- Style: Minimal, high contrast, soft glow accents
- Feel: Professional but approachable

---

### 2.2 Color System

- Primary Accent: Soft orange (used for CTAs, highlights, active states)
- Background: Dark (near black gradient)
- Text:
  - Primary: White
  - Secondary: Light gray
- Cards / Surfaces:
  - Dark gray with subtle gradient
- States:
  - Hover: Slight brightness increase
  - Active: Orange highlight or border

---

### 2.3 Typography

- Font: Sans-serif (modern, clean)
- Hierarchy:
  - H1: Large, bold (hero + page titles)
  - H2: Section headers
  - Body: Medium weight, readable
  - Labels: Smaller, muted

---

### 2.4 Spacing & Layout

- Consistent padding across all containers
- Large spacing between sections
- Rounded corners on all cards and buttons
- No sharp edges

#### Step shell tokens (onboarding)

All onboarding steps (1–5) share the same outer shell. Spacing is controlled by CSS custom properties in `styles/main.css :root`:

- `--step-container-padding-desktop` — padding on every `.step-container` at ≥ 1060px (currently `4.5rem 6rem`)
- `--step-header-margin-bottom` — gap between `.step-header` and step content (currently `1.875rem` = 30px)
- `--step-title-subtitle-gap` — gap between `.step-title` and `.step-subtitle` (currently `0.9375rem` = 15px)
- `--step-title-size-desktop` — locked `.step-title` font-size at ≥ 1060px (currently `3rem`)

**2:1 Ratio Rule:** `--step-header-margin-bottom` must always equal exactly 2× `--step-title-subtitle-gap`. Never override either token independently on a per-step basis. If a step requires different spacing, change the global tokens or use a dedicated inner wrapper inside the content region.

Per-step overrides of `.step-container` padding, `.step-header` margin, or `.step-title` font-size are forbidden. If a step needs different spacing, change the token or use a dedicated inner wrapper — do not override the shell.

#### Universal heading template (desktop)

On desktop (≥ 1060px), every onboarding step uses the identical DOM chain: `.step-container > .step-mobile-fit-viewport > .step-mobile-fit-content > .container-inner > .step-shell > .step-header + <content region>`. `.step-header` is always the first flow child of `.step-shell`, followed by `.step-subtitle` (30px gap) and then the step's content region. No step may introduce an extra `.container-inner` wrapper, sidebar-embedded heading, or wrapper at a different depth. Because desktop renders fit-wrappers as transparent flex passthroughs (`transform: none`), the header sits at the universal `--step-container-padding-desktop` offset on every step.

#### Mobile-fit wrappers (`.step-mobile-fit-*`)

The `.step-mobile-fit-viewport` and `.step-mobile-fit-content` wrappers exist only for mobile fit-to-viewport scaling, where JS (`updateStepCompositionScale`) sets a per-step CSS variable and the wrapper applies it via `transform: scale()`. On desktop (≥ 1060px) these wrappers must render as transparent flex passthroughs: `display: flex; flex: 1 1 auto; transform: none`. No desktop-only `transform: scale()` may be applied to onboarding content — desktop layout flows natively inside `.container-inner > .step-shell`.

On mobile, `.step-header` lives inside the scaled wrapper and scales with content. This is the accepted tradeoff for desktop DOM uniformity — title scaling at small viewports is visually negligible and preferred over maintaining a divergent step-4 structure.

#### Step visibility contract

Only one onboarding step is visible at a time. `updateView()` in `main.js` adds `.active` to the current step (`display: flex`) and, after the 0.4s fade transition completes, sets `display: none` on every other step. Inactive steps do not participate in layout or measurement, which keeps `getBoundingClientRect()` / `offsetHeight` stable per step.

---

### 2.5 Buttons

Primary Button:
- Rounded
- Orange background
- Positioned bottom-right (desktop)
- Fixed or anchored (mobile)

Secondary Button:
- Dark background
- Subtle border
- Used for “Back”

States:
- Hover: brighter
- Active: slight press effect

---

### 2.6 Interaction & Animation

- Smooth transitions (no abrupt changes)
- Hover states on all interactive elements
- Selection states clearly highlighted
- No excessive motion

---

## 3. Core UI Components

### 3.1 Sidebar (Desktop Only)

- Fixed on left side
- Contains:
  - Logo
  - Step navigation (1–5)
- Highlights current step
- Minimal interaction (display + navigation)

---

### 3.2 Top Progress Bar (Mobile Only)

- Replaces sidebar
- Shows:
  - Step progress (1 of 5)
  - Current section title

---

### 3.3 Page Header

Each page contains:
- Title (large, bold)
- Subtitle (short explanation)

Position:
- Top-left (desktop content area)
- Top (mobile)

---

### 3.4 Option Cards

Used for:
- Color palettes
- Fonts
- Features
- Layout selections

Structure:
- Container with rounded edges
- Icon or label
- Optional description

States:
- Default
- Hover
- Selected (highlighted with accent color)

---

### 3.5 Preview Panel

Used on:
- Style page
- Layout page

Purpose:
- Live visual feedback based on selections

Position:
- Right side (desktop)
- Top section (mobile)

---

### 3.6 Navigation Controls

Includes:
- Back button (bottom-left)
- Next / Submit button (bottom-right)

Behavior:
- Always visible
- Consistent across all steps

---

### 3.7 Form Inputs

Used on final step:
- Text inputs
- File upload
- Toggle selections

Rules:
- Full width (mobile)
- Structured grid (desktop)
- Clear labels and placeholders

---

## 4. Page Functionality (Global Logic)

### 4.1 Onboarding Flow

The site follows a 5-step onboarding process:

1. Colour Palette
2. Style (Typography)
3. Layout
4. Features
5. Final Details

Each step:
- Collects a specific category of input
- Updates the internal project data
- May influence preview output

---

### 4.2 Navigation Logic

- Users can move forward or backward at any time
- “Next” progresses to next step
- “Back” returns to previous step
- “Skip” is available on optional sections

---

### 4.3 Data Handling

- Inputs are stored progressively
- Final submission sends complete dataset

---

## 5. Desktop Layout Rules (≥ 1060px)

### 5.1 Global Structure

- Left: Sidebar (fixed)
- Right: Main content area
- Bottom-right: Primary action button
- Bottom-left: Back button

---

### 5.2 Landing Page

- Full-screen background image
- Centered content:
  - Headline
  - Subheadline
  - CTA button

---

### 5.3 Colour Palette Page

- Grid of palette options
- Background mode selection below
- Clear selection highlight

---

### 5.4 Style Page

- Left: Font selection list
- Right: Live preview panel

---

### 5.5 Layout Page

- Left: Section toggles (Hero, Gallery, etc.)
- Right: Wireframe preview

---

### 5.6 Features Page

- Grid layout of feature cards
- Grouped sections:
  - Core features
  - Social media
  - Language

---

### 5.7 Final Details Page

- Two-column layout:
  - Left: Inputs (name, email, etc.)
  - Right: Upload + timeline selection

---

## 6. Mobile Layout Rules (< 1060px)

### 6.1 Global Structure

- Sidebar removed
- Top progress bar added
- Content stacked vertically
- Buttons anchored at bottom

---

### 6.2 General Behavior

- All grids become single-column
- All elements scale proportionally
- No horizontal overflow
- If a component needs overflow, it may use its own internal vertical scrollbar (for example, font options). The page itself must never vertically scroll.

---

### 6.3 Page-Specific Adjustments

#### Style Page
- Preview moves above font selection

#### Layout Page
- Preview moves above section controls

#### Features Page
- Cards stack vertically

#### Final Details
- All inputs full width
- Upload and timeline stacked

---

## 7. Responsive Behavior Rules

- Breakpoint: 1060px
- Layout switches instantly between desktop and mobile modes
- Text scales down proportionally
- Containers shrink with screen size
- No element should be hidden behind buttons
- All interactive elements remain accessible

---

## 8. Constraints & Rules

- UI must remain consistent across all steps
- No page should introduce new design patterns
- All components must follow global styles
- Layout changes must not break usability
- Mobile experience must prioritize accessibility

---

## 9. Design Philosophy

The UI prioritizes:

- Simplicity over complexity
- Clarity over customization
- Speed over perfection

The goal is to guide users through a smooth, intuitive onboarding process with minimal friction.