# Wireframe Measurements

## Canonical Canvas
- Base wireframe family is effectively a shared portrait canvas around `370 x 568`.
- Inner safe frame used across all three wireframes:
  - Left inset: `18px`
  - Safe width: `335px`
  - Right inset: about `17px-20px`

## Shared Ratios
- Inner frame width ratio: `335 / 370 = 0.9054`
- Left gutter ratio: `18 / 370 = 0.0486`
- Top progress zone height: `82px`
- Bottom action zone height: about `83px`
- Middle onboarding content height: `568 - 82 - 83 = 403px`

## Shared Header Geometry
- Header origin inside middle content area:
  - `x = 18px`
  - `y = 15px`
- Heading block:
  - Width: `181px`
  - Height: `42px`
- Subtitle block:
  - `y = 63px` from middle content top
  - Width: `228px`
  - Height: `20px`

## Template A: Steps 1-3
- Band 1:
  - `x = 18px`
  - `y = 94px`
  - Width: `335px`
  - Height: `118px`
- Band 2:
  - `x = 18px`
  - `y = 222px`
  - Width: `335px`
  - Height: `180px-181px`
- Gap between Band 1 and Band 2: `10px`

## Template B: Step 4
- Feature matrix:
  - `x = 18px`
  - `y = 96px`
  - Width: `335px`
  - Height: `307px-308px`
- Left column occupies roughly the orange-highlighted half.
- Right column occupies the denser utility half.
- Outer frame remains shared with Template A.

## Template C: Step 5
- Form matrix:
  - `x = 18px`
  - `y = 101px`
  - Width: `335px`
  - Height: `301px`
- Top region is split into left and right columns.
- Lower full-width notes band sits below the top split region inside the same frame.

## Button Geometry
- Back button:
  - `x = 28px`
  - Width: `80px`
  - Height: `48px`
- Primary action button:
  - `x = 252px`
  - Width: `93px-94px`
  - Height: `56px`

## Implementation Notes
- The production mobile onboarding should scale from these canonical measurements.
- The safest production mapping is:
  - keep a fixed canonical geometry in design pixels
  - scale it uniformly to fit the target mobile viewport
  - preserve the exact `18px / 335px / 17px-20px` horizontal relationship
  - preserve the exact vertical anchors for header, bands, and action zone
