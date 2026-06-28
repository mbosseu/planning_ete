const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });
    
    // Simulate what the exportToPDF function does
    await page.evaluate(() => {
      document.body.setAttribute('data-print-target', 'members-schedule-table');
    });
    
    await page.pdf({
      path: 'test-print.pdf',
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0.5cm', bottom: '0.5cm', left: '0.5cm', right: '0.5cm' }
    });
    
    await browser.close();
    console.log('PDF saved to test-print.pdf');
  } catch (error) {
    console.error('Error in PDF generation script:', error);
  }
})();
