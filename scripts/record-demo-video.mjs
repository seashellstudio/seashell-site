/**
 * Records a short mobile demo: landing → onboarding steps 1–4 (Features).
 * Output: demo-recordings/*.webm (Playwright default filename)
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'demo-recordings');
fs.mkdirSync(outDir, { recursive: true });

const indexUrl = `file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`;

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  recordVideo: {
    dir: outDir,
    size: { width: 390, height: 844 },
  },
});

const page = await context.newPage();
await page.goto(indexUrl, { waitUntil: 'load' });
await pause(1200);

for (let s = 1; s <= 4; s++) {
  await page.evaluate((step) => navigateToStep(step), s);
  await pause(s === 4 ? 2800 : 1600);
}

/* Scaled UI can sit outside Playwright's "viewport" hit target — use force or script click */
await page.evaluate(() => {
  const first = document.querySelector('#step-4 .feature-toggle-card');
  if (first) first.click();
});
await pause(1200);
await page.evaluate(() => {
  const second = document.querySelectorAll('#step-4 .feature-toggle-card')[1];
  if (second) second.click();
});
await pause(1500);

await context.close();
await browser.close();

const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.webm'));
const latest = files.sort().at(-1);
const outPath = latest ? path.join(outDir, latest) : null;
console.log(outPath || 'No webm found in ' + outDir);
