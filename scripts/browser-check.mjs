import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } })
const logs = []
const errors = []
page.on('console', (msg) => logs.push({ type: msg.type(), text: msg.text() }))
page.on('pageerror', (err) => errors.push(String(err)))
await page.setExtraHTTPHeaders({
  Authorization: 'Basic ' + Buffer.from('admin:@Crazinerd10111').toString('base64')
})
await page.goto('https://office.esportsza.co.za', { waitUntil: 'networkidle', timeout: 30000 })
await page.screenshot({ path: '/tmp/openclaw-office-browser-check.png', fullPage: true })
const title = await page.title()
const bodyText = await page.locator('body').innerText().catch(() => '')
const cards = await page.locator('.task-card').count().catch(() => 0)
const detail = await page.locator('.panel .panel-section').count().catch(() => 0)
console.log(JSON.stringify({ title, cards, detail, bodyText: bodyText.slice(0, 1200), errors, logs: logs.slice(-30) }, null, 2))
await browser.close()
