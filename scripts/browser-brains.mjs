import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 2000 } })
await page.setExtraHTTPHeaders({ Authorization: 'Basic ' + Buffer.from('admin:@Crazinerd10111').toString('base64') })
await page.goto('https://office.esportsza.co.za', { waitUntil: 'networkidle', timeout: 30000 })
const cards = await page.locator('.brain-card').evaluateAll((els) => els.map((el) => el.textContent))
const detail = await page.locator('.brain-detail-panel').innerText().catch(()=> '')
console.log(JSON.stringify({cards, detail}, null, 2))
await browser.close()
