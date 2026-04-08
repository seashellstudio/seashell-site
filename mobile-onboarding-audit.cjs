/**
 * Mobile layout audit: landing, onboarding steps 1–5, thank-you.
 * Requires: npm install playwright (workspace root) and `serve` on port 8765.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8765';
const OUT = path.resolve(__dirname, 'mobile-audit-output');

function shot(page, name) {
  const fp = path.join(OUT, name);
  return page.screenshot({ path: fp, type: 'png' }).then(() => {
    if (!fs.existsSync(fp)) throw new Error(`Screenshot missing: ${fp}`);
    return fp;
  });
}

async function measureOnboardingStep(page, stepNum) {
  await page.evaluate((n) => {
    if (typeof navigateToStep === 'function') navigateToStep(n);
  }, stepNum);
  await page.waitForTimeout(450);
  await page.locator(`#step-${stepNum}.active`).waitFor({ state: 'attached', timeout: 5000 });
  await page.evaluate((n) => {
    const el = document.getElementById(`step-${n}`);
    if (el) el.scrollTop = el.scrollHeight;
  }, stepNum);
  await page.waitForTimeout(200);

  return page.evaluate(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const shell = document.querySelector('.mobile-progress-shell-inner');
    const sh = shell?.getBoundingClientRect();
    const step = document.querySelector('.step-container.active');
    const fab = document.querySelector('.floating-action-btn');
    const fr = fab?.getBoundingClientRect();
    let inner = step?.querySelector('.step-mobile-fit-content');
    if (inner && step.id === 'step-4') {
      inner = step.querySelector('.features-composition') || inner;
    }
    if (!inner) inner = step?.querySelector('.container-inner');
    const ir = inner?.getBoundingClientRect();
    const title = step?.querySelector('.step-title');
    const tr = title?.getBoundingClientRect();
    const back = document.getElementById('btn-back');
    const next = document.getElementById('btn-next');
    const br = back?.getBoundingClientRect();
    const nr = next?.getBoundingClientRect();

    const innerBottom = Math.min(ir?.bottom ?? 0, vh);
    const fabTop = fr?.top ?? 0;
    const gapContentToFab = fabTop - innerBottom;
    const gapFabToScreenBottom = vh - (fr?.bottom ?? 0);
    const verticalAlignBackNext =
      br && nr ? Math.abs(br.top - nr.top) : null;

    return {
      viewport: { w: vw, h: vh },
      shell: sh
        ? { left: sh.left, right: sh.right, width: sh.width }
        : null,
      inner: ir
        ? { left: ir.left, right: ir.right, width: ir.width, bottom: ir.bottom }
        : null,
      title: tr ? { left: tr.left, top: tr.top } : null,
      insetDeltaTitleVsShell:
        sh && tr ? Math.round((tr.left - sh.left) * 100) / 100 : null,
      insetDeltaInnerVsShell:
        sh && ir ? Math.round((ir.left - sh.left) * 100) / 100 : null,
      floatingBar: fr
        ? { top: fr.top, bottom: fr.bottom, height: fr.height }
        : null,
      gapContentBottomToFabTop: Math.round(gapContentToFab * 100) / 100,
      gapFabBottomToViewportBottom: Math.round(gapFabToScreenBottom * 100) / 100,
      backVsNext: {
        backH: br?.height,
        nextH: nr?.height,
        topDeltaPx: verticalAlignBackNext,
      },
    };
  });
}

async function measureLanding(page) {
  await page.evaluate(() => {
    if (typeof navigateToStep === 'function') navigateToStep(0);
  });
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const copy = document.querySelector('.landing-copy');
    const header = document.querySelector('.global-header');
    const cr = copy?.getBoundingClientRect();
    const hr = header?.getBoundingClientRect();
    return {
      headerLeft: hr?.left,
      copyLeft: cr?.left,
      copyWidth: cr?.width,
    };
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  const report = { viewport: { width: 390, height: 844 }, pages: {} };

  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);
    report.pages.landing = await measureLanding(page);
    await shot(page, '01-landing.png');

    await page.getByRole('button', { name: /Build My Website/i }).click();
    await page.waitForTimeout(600);

    for (let s = 1; s <= 5; s++) {
      report.pages[`step${s}`] = await measureOnboardingStep(page, s);
      await shot(page, `0${s + 1}-step${s}.png`);
    }

    await page.goto(`${BASE}/thank-you.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);
    report.pages.thankYou = await page.evaluate(() => {
      const box = document.querySelector('.thank-you-container');
      const r = box?.getBoundingClientRect();
      return {
        containerLeft: r?.left,
        containerWidth: r?.width,
        viewportW: window.innerWidth,
      };
    });
    await shot(page, '08-thank-you.png');
  } catch (e) {
    report.error = String(e);
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
})();
