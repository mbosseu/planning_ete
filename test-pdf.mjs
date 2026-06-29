import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    console.log("Navigating to site...");
    await page.goto('http://127.0.0.1:4321', { waitUntil: 'networkidle0' });
    
    console.log("Setting data-print-target to all-schedules...");
    await page.evaluate(() => {
      document.body.setAttribute('data-print-target', 'all-schedules');
    });
    
    console.log("Emulating print media...");
    await page.emulateMediaType('print');
    
    // Give time for layout
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: 'test-print-preview.png', fullPage: true });
    
    console.log("Generating PDF...");
    await page.pdf({
      path: 'test-print.pdf',
      format: 'A4',
      landscape: true,
      printBackground: true
    });
    
    await browser.close();
    console.log('PDF saved to test-print.pdf, Screenshot saved to test-print-preview.png');
  } catch (error) {
    console.error('Error:', error);
  }
})();
