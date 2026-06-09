import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('file:///home/camiel/Health Me/index.html', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    // Reveal logging view so we can interact
    document.getElementById('view-dashboard').style.display = 'none';
    document.getElementById('view-logging').style.display = 'block';
  });

  console.log("Typing 'apple'");
  await page.type('#food-search', 'apple');
  console.log("Pressing Enter");
  await page.keyboard.press('Enter');

  await new Promise(r => setTimeout(r, 500));
  
  const loading = await page.$eval('#search-results', el => el.innerHTML);
  console.log("Search Results:", loading);

  console.log("Clicking search btn");
  await page.click('#search-btn');

  await new Promise(r => setTimeout(r, 500));

  const loading2 = await page.$eval('#search-results', el => el.innerHTML);
  console.log("Search Results 2:", loading2);

  await browser.close();
})();
