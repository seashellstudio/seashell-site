// Measures .step-title and .step-subtitle bounding rects on every onboarding
// step and asserts:
//   - .step-title top matches across all steps within TOLERANCE_PX
//   - .step-title left matches across all steps within TOLERANCE_PX
//   - (.step-subtitle.top - .step-title.bottom) == TARGET_GAP_PX within 1px
// Runs at desktop (1440x900), wide-desktop (1920x1080), and mobile (390x844).

const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:8000/';
const STEPS = [1, 2, 3, 4, 5];
const TOLERANCE_PX = 1;
const TARGET_GAP_PX = 30;
const VIEWPORTS = [
  { label: 'desktop',      width: 1440, height: 900,  checkGap: true  },
  { label: 'wide-desktop', width: 1920, height: 1080, checkGap: true  },
  { label: 'mobile',       width: 390,  height: 844,  checkGap: false }
];

async function measureStep(page, stepIndex) {
  await page.evaluate((i) => window.navigateToStep(i), stepIndex);
  await page.waitForTimeout(600);
  return page.evaluate((i) => {
    const title = document.querySelector(`#step-${i} .step-title`);
    const subtitle = document.querySelector(`#step-${i} .step-subtitle`);
    if (!title) return null;
    const tr = title.getBoundingClientRect();
    const sr = subtitle ? subtitle.getBoundingClientRect() : null;
    const cs = getComputedStyle(title);
    return {
      titleTop: tr.top,
      titleLeft: tr.left,
      titleBottom: tr.bottom,
      subtitleTop: sr ? sr.top : null,
      gap: sr ? sr.top - tr.bottom : null,
      fontSize: cs.fontSize,
      visible: tr.width > 0 && tr.height > 0
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

    const tops = results.map(r => r.titleTop);
    const lefts = results.map(r => r.titleLeft);
    const topSpread = Math.max(...tops) - Math.min(...tops);
    const leftSpread = Math.max(...lefts) - Math.min(...lefts);

    console.log(`\n=== ${vp.label} (${vp.width}x${vp.height}) ===`);
    for (const r of results) {
      const gapStr = r.gap == null ? 'n/a' : `${r.gap.toFixed(2)}px`;
      console.log(`  step-${r.step}: top=${r.titleTop.toFixed(2)} left=${r.titleLeft.toFixed(2)} fontSize=${r.fontSize} gap=${gapStr}`);
    }
    console.log(`  top spread:  ${topSpread.toFixed(2)}px (tolerance: ${TOLERANCE_PX}px)`);
    console.log(`  left spread: ${leftSpread.toFixed(2)}px (tolerance: ${TOLERANCE_PX}px)`);

    if (topSpread > TOLERANCE_PX) {
      console.error(`  FAIL: .step-title top varies by more than ${TOLERANCE_PX}px`);
      hadFailure = true;
    }
    if (leftSpread > TOLERANCE_PX) {
      console.error(`  FAIL: .step-title left varies by more than ${TOLERANCE_PX}px`);
      hadFailure = true;
    }
    if (vp.checkGap) {
      for (const r of results) {
        if (r.gap == null) continue;
        if (Math.abs(r.gap - TARGET_GAP_PX) > 1) {
          console.error(`  FAIL: step-${r.step} subtitle gap ${r.gap.toFixed(2)}px != ${TARGET_GAP_PX}px`);
          hadFailure = true;
        }
      }
    }
    if (topSpread <= TOLERANCE_PX && leftSpread <= TOLERANCE_PX) {
      console.log('  PASS (alignment)');
    }

    await ctx.close();
  }

  await browser.close();
  process.exit(hadFailure ? 1 : 0);
})();
