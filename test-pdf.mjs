import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    console.log("Navigating to site...");
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });
    
    // Set the body attribute to simulate exportToPDF for "all-schedules"
    console.log("Triggering print styling...");
    await page.evaluate(() => {
      // Create a simulated all-schedules block since React needs click to render it
      // Let's just click the TOUT IMPRIMER button, but mock window.print first!
      window.print = () => { console.log('Mocked window.print called'); };
      
      const buttons = Array.from(document.querySelectorAll('button'));
      const printBtn = buttons.find(b => b.textContent && b.textContent.includes('TOUT IMPRIMER'));
      if (printBtn) printBtn.click();
    });
    
    // Wait for React to render tables (300ms) and set data-print-target
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if data-print-target is set
    const targetSet = await page.evaluate(() => document.body.getAttribute('data-print-target'));
    console.log("data-print-target:", targetSet);
    
    // Force CSS media to print to evaluate layout visually in screenshot
    await page.emulateMediaType('print');
    await page.screenshot({ path: 'test-print-preview.png', fullPage: true });
    
    // Generate actual PDF
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
