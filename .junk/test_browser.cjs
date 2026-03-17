const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('PAGE LOG ERROR:', msg.text());
    });
    page.on('pageerror', err => {
      console.log('PAGE ERROR:', err.toString());
    });

    console.log("Navigating to http://localhost:5173 ...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log("Navigation complete. Waiting 3s...");
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
    console.log("Done.");
  } catch (err) {
    console.error("Script error:", err);
  }
})();
