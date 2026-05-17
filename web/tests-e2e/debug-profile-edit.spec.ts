import { test } from '@playwright/test';

test('check profile edit page', async ({ page }) => {
  page.on('console', msg => {
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`PAGE ERROR: ${err.message}`);
  });

  await page.goto('http://127.0.0.1:8080/profiles/edit?id=4bc8221f-46ae-43ee-9f17-4f985a8d3083');
  
  // Wait for some time to let errors appear
  await page.waitForTimeout(5000);
  
  const content = await page.content();
  if (content.includes('This page couldn’t load')) {
    console.log('Detected "This page couldn’t load" message');
  }
});
