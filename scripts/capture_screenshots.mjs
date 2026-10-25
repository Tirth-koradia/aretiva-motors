import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const SCREENSHOTS_DIR = path.resolve('docs/screenshots')
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://127.0.0.1:8000/api'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.statusText}`)
  }
  return res.json()
}

async function run() {
  console.log('Fetching customer and admin tokens from local API...')
  const customerSession = await loginApi('tirth.koradia@example.com', 'Customer1234!')
  const adminSession = await loginApi('admin@aretiva.com', 'ChangeMe123!')

  console.log('Launching Chrome browser...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960, deviceScaleFactor: 2 },
  })

  const page = await browser.newPage()

  try {
    // 1. Landing Page
    console.log('Capturing 01-landing-hero.png...')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' })
    await sleep(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-landing-hero.png') })

    // Set Customer Session in localStorage
    await page.evaluate((sess) => {
      localStorage.setItem('aretiva.session', JSON.stringify(sess))
    }, customerSession)

    // 2. Showroom Catalog
    console.log('Capturing 02-showroom-catalog.png...')
    await page.goto(`${BASE_URL}/showroom`, { waitUntil: 'networkidle2' })
    await sleep(2000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-showroom-catalog.png') })

    // 3. Vehicle Comparison Modal
    console.log('Capturing 03-vehicle-comparison-modal.png...')
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.textContent && b.textContent.includes('+ Compare')
      )
      if (btns[0]) btns[0].click()
      if (btns[1]) btns[1].click()
    })
    await sleep(1000)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent && b.textContent.includes('Compare Specifications')
      )
      if (btn) btn.click()
    })
    await sleep(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-vehicle-comparison-modal.png') })

    // Close comparison modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent && b.textContent.includes('✕')
      )
      if (btn) btn.click()
    })
    await sleep(500)

    // 4. Vehicle Detail & EMI Estimator
    console.log('Capturing 04-vehicle-detail-financing.png...')
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find((a) =>
        a.textContent && a.textContent.includes('View specification')
      )
      if (link) link.click()
    })
    await sleep(2000)
    await page.evaluate(() => window.scrollBy(0, 650))
    await sleep(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-vehicle-detail-financing.png') })

    // 5. Customer Purchases & Delivery Lifecycle Tracker
    console.log('Capturing 05-concierge-delivery-tracker.png...')
    await page.goto(`${BASE_URL}/purchases`, { waitUntil: 'networkidle2' })
    await sleep(2000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-concierge-delivery-tracker.png') })

    // 6. Certificate of Acquisition Modal
    console.log('Capturing 06-certificate-of-acquisition.png...')
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent && b.textContent.includes('Acquisition receipt')
      )
      if (btn) btn.click()
    })
    await sleep(1200)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-certificate-of-acquisition.png') })

    // 7. Admin Session Setup
    console.log('Switching to Admin session in localStorage...')
    await page.evaluate((sess) => {
      localStorage.setItem('aretiva.session', JSON.stringify(sess))
    }, adminSession)

    // 8. Admin Inventory Desk
    console.log('Capturing 07-admin-inventory-desk.png...')
    await page.goto(`${BASE_URL}/admin/inventory`, { waitUntil: 'networkidle2' })
    await sleep(2000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-admin-inventory-desk.png') })

    // 9. Admin Activity Ledger
    console.log('Capturing 08-admin-activity-ledger.png...')
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent && b.textContent.includes('Activity & Transaction Ledger')
      )
      if (tab) tab.click()
    })
    await sleep(1200)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-admin-activity-ledger.png') })

    // 10. Admin Concierge Delivery Lifecycle Management
    console.log('Capturing 09-admin-delivery-management.png...')
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent && b.textContent.includes('Concierge Deliveries')
      )
      if (tab) tab.click()
    })
    await sleep(1200)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-admin-delivery-management.png') })

    // 11. Mobile Showroom View
    console.log('Capturing 10-mobile-showroom.png...')
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true })
    await page.goto(`${BASE_URL}/showroom`, { waitUntil: 'networkidle2' })
    await sleep(1500)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-mobile-showroom.png') })

    console.log('All 10 screenshots captured successfully and saved to docs/screenshots/!')
  } catch (err) {
    console.error('Error during capture:', err)
  } finally {
    await browser.close()
  }
}

run()
