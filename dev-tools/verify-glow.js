const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8000/index.html');
  await page.waitForTimeout(500);

  // Navigate to step 1
  await page.evaluate(() => navigateToStep(1));
  await page.waitForTimeout(600);

  // Click the 2nd palette (index 1) — same one user selects
  const palettes = await page.locator('.palette-option').all();
  await palettes[1].click();
  await page.waitForTimeout(400);

  // Measure exact positions
  const metrics = await page.evaluate(() => {
    const active = document.querySelector('.palette-option.active-palette');
    const viewport = document.querySelector('.palette-scroll-viewport');
    const shell = document.querySelector('.palette-scroll-shell');
    const band = document.querySelector('#step-1 .step-band--primary');

    const ar = active.getBoundingClientRect();
    const vr = viewport.getBoundingClientRect();
    const sr = shell.getBoundingClientRect();
    const br = band ? band.getBoundingClientRect() : null;

    const cs_viewport = getComputedStyle(viewport);
    const cs_shell = getComputedStyle(shell);
    const cs_band = band ? getComputedStyle(band) : null;

    return {
      palette: { left: ar.left, top: ar.top, right: ar.right, bottom: ar.bottom, width: ar.width },
      viewport: { left: vr.left, top: vr.top, right: vr.right, bottom: vr.bottom },
      shell: { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom },
      band: br ? { left: br.left, top: br.top, right: br.right, bottom: br.bottom } : null,
      overflow: {
        viewport: cs_viewport.overflow,
        viewportX: cs_viewport.overflowX,
        viewportY: cs_viewport.overflowY,
        shell: cs_shell.overflow,
        band: cs_band ? cs_band.overflow : null,
      },
      // Distance from palette edge to viewport inner border (= padding edge)
      distPaletteToViewportLeft: ar.left - vr.left,
      distPaletteToViewportTop: ar.top - vr.top,
    };
  });

  console.log('\n=== Glow Clipping Verification ===');
  console.log('Palette position:', JSON.stringify(metrics.palette, null, 2));
  console.log('Viewport bounds:', JSON.stringify(metrics.viewport, null, 2));
  console.log('Shell bounds:', JSON.stringify(metrics.shell, null, 2));
  console.log('Band bounds:', JSON.stringify(metrics.band, null, 2));
  console.log('\nOverflow values:', JSON.stringify(metrics.overflow, null, 2));
  console.log('\nDistance palette LEFT edge → viewport left border:', metrics.distPaletteToViewportLeft.toFixed(1), 'px');
  console.log('Distance palette TOP edge → viewport top border:', metrics.distPaletteToViewportTop.toFixed(1), 'px');
  console.log('\nBox-shadow reach from palette border: ~9px (6px ring + ~3px scale)');
  console.log('Is left glow safe?', metrics.distPaletteToViewportLeft > 9 ? 'YES ✓' : 'NO — CLIPPED ✗');
  console.log('Is top glow safe?', metrics.distPaletteToViewportTop > 9 ? 'YES ✓' : 'NO — CLIPPED ✗');

  // Full-page screenshot + close-up
  await page.screenshot({ path: 'verify-full.png', fullPage: false });

  // Clip to the band area only for a close-up
  const band = metrics.band;
  if (band) {
    await page.screenshot({
      path: 'verify-closeup.png',
      clip: { x: band.left - 5, y: band.top - 5, width: band.right - band.left + 10, height: band.bottom - band.top + 10 }
    });
  }

  await browser.close();
  console.log('\nScreenshots saved: verify-full.png and verify-closeup.png');
})();
