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
  await page.waitForTimeout(600);
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
