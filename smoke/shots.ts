import { chromium } from 'playwright-core';
const EXE = 'C:\\Users\\Administrator\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1680, height: 980 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('PAGEERROR:', e));
await page.goto('http://127.0.0.1:5181/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'smoke/shot-1-overview-lod0.png' });

// 放大到 LOD2
const box = (await page.locator('.map-wrap canvas').boundingBox())!;
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
for (let i = 0; i < 22; i++) {
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(600);
await page.evaluate(() => (window as any).__store.getState().searchAndLocate('SIGN-00001'));
await page.waitForTimeout(1200);
await page.screenshot({ path: 'smoke/shot-2-lod2-labels.png' });

// 选中要素 + 侧栏属性(并聚焦相机)
await page.evaluate(() => (window as any).__store.getState().searchAndLocate('DEV-00001'));
await page.waitForTimeout(4000); // 等闪烁结束,只留青色高亮环
await page.screenshot({ path: 'smoke/shot-3-selected-attrs.png' });
console.log('screenshots done');
await browser.close();
