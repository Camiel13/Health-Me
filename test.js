const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///home/camiel/Health Me/index.html');
  await page.waitForTimeout(1000);
  
  // click habit view
  await page.click('text=Habit Architect'); // Wait, the bottom nav has SVG icons, no text.
  
  // let's just trigger it directly
  await page.evaluate(() => {
    document.getElementById('habit-trigger').value = 'trigger';
    document.getElementById('habit-action').value = 'action';
    document.getElementById('save-habit-btn').click();
  });
  
  await page.waitForTimeout(500);
  const habitsHtml = await page.innerHTML('#habits-list');
  console.log("Habits list HTML:", habitsHtml);
  
  await browser.close();
})();
