import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
await page.setExtraHTTPHeaders({ Authorization: 'Basic ' + Buffer.from('admin:@Crazinerd10111').toString('base64') })
await page.goto('https://office.esportsza.co.za', { waitUntil: 'networkidle', timeout: 30000 })
const agents = await page.locator('.office-agent').evaluateAll((els) => els.map((el) => ({
  text: el.textContent,
  left: getComputedStyle(el).left,
  top: getComputedStyle(el).top,
  display: getComputedStyle(el).display,
  visibility: getComputedStyle(el).visibility,
  opacity: getComputedStyle(el).opacity,
})))
console.log(JSON.stringify(agents, null, 2))
await browser.close()
