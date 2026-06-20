const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting E2E QA Crawler...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const errors = [];
    const failedRequests = [];

    // Intercept console messages
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            errors.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });

    // Intercept network requests
    page.on('requestfailed', request => {
        failedRequests.push(`[FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    page.on('response', response => {
        if (!response.ok()) {
            failedRequests.push(`[${response.status()}] ${response.request().method()} ${response.url()}`);
        }
    });

    try {
        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
        
        console.log('Testing login flow...');
        // Let's assume there is an email and password input
        const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]');
        const passInput = await page.$('input[type="password"]');
        
        if (emailInput && passInput) {
            await emailInput.type('admin@example.com');
            await passInput.type('password');
            const submitBtn = await page.$('button[type="submit"]') || await page.$('form button');
            if (submitBtn) {
                await submitBtn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
            }
        }

        console.log('Crawling available links...');
        const links = await page.$$eval('a, button', elements => elements.map(e => e.innerText || e.className).slice(0, 10));
        console.log(`Found interactive elements: ${links.join(', ')}`);

    } catch (err) {
        console.error('Crawler encountered a fatal error:', err.message);
    } finally {
        await browser.close();
        console.log('\n--- QA AUDIT REPORT ---');
        console.log('\nConsole Errors & Warnings:');
        errors.forEach(e => console.log(e));
        
        console.log('\nFailed Network Requests (API/Assets):');
        failedRequests.forEach(r => console.log(r));
        
        console.log('\nAudit Complete.');
    }
})();
