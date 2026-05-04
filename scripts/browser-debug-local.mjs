import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } })
page.on('console', (msg) => console.log('console', msg.type(), msg.text()))
page.on('pageerror', (err) => console.log('pageerror', err.stack || String(err)))
await page.goto('http://127.0.0.1:4174', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)
console.log('body=', await page.locator('body').innerText().catch(()=>''))
await browser.close()
