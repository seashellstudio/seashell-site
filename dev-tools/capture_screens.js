const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  
  const outDir = 'C:/Users/tyler/.gemini/antigravity/brain/f6d74ec5-78d1-4144-88c7-9d410770f652/scratch/screenshots';
  if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
  }

  async function captureFlow(page, prefix) {
    await page.goto('http://127.0.0.1:8000/index.html');
    await page.waitForTimeout(500);

    for (let i = 1; i <= 5; i++) {
      // Use the actual navigation function on the window
      await page.evaluate((step) => {
        if (typeof navigateToStep === 'function') {
          navigateToStep(step);
        } else {
            console.error('navigateToStep not found!');
        }
      }, i);
      
      // wait for animations and layout
      await page.waitForTimeout(600);
      
      await page.screenshot({ path: `${outDir}/${prefix}-step-${i}.png` });
    }
  }

  console.log('Capturing Desktop flow...');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await captureFlow(desktopPage, 'desktop');

  console.log('Capturing Mobile flow...');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const mobilePage = await mobileContext.newPage();
  await captureFlow(mobilePage, 'mobile');

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
