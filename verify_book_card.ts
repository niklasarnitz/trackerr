
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to test page...');
    await page.goto('http://localhost:3000/test-ui', { waitUntil: 'networkidle' });

    // Screenshot initial state (buttons hidden)
    await page.screenshot({ path: 'verification_initial.png' });
    console.log('Initial screenshot taken.');

    // Hover over the first card to reveal buttons
    console.log('Hovering over card...');
    const card = page.locator('.group').first(); // The card has 'group' class
    await card.hover();

    // Wait for transition (opacity)
    await page.waitForTimeout(500);

    // Screenshot hovered state (buttons visible)
    await page.screenshot({ path: 'verification_hover.png' });
    console.log('Hover screenshot taken.');

    // Focus on the "Add to Library" button (keyboard navigation check)
    console.log('Checking keyboard focus...');
    const bookmarkButton = card.locator('button[aria-label="Add to library"]'); // Should exist if my change worked
    if (await bookmarkButton.count() > 0) {
        await bookmarkButton.focus();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'verification_focus.png' });
        console.log('Focus screenshot taken.');
    } else {
        console.error('Bookmark button not found via aria-label!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
