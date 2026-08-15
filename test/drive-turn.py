"""Drive one real conversation turn on 3081 and read the usage panel after.

Dev-only: python3 test/drive-turn.py [prompt]
Proves the data path end to end: prompt → model → projections/history → panel.
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:3081/'
PROMPT = sys.argv[1] if len(sys.argv) > 1 else '用一句话介绍你自己'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_timeout(8000)
    box = page.locator('textarea').first
    box.fill(PROMPT)
    box.press('Enter')
    print(f'prompt sent: {PROMPT}')
    page.wait_for_timeout(28000)
    page.locator('.dshboard-trigger').first.click()
    page.wait_for_timeout(2500)
    print('--- panel after turn ---')
    print(page.locator('.dshboard-panel').first.inner_text())
    print(f"spark bars: {page.locator('.dshboard-spark rect').count()}")
    print('--- console errors ---')
    for line in errors[:10]:
        print(line)
    page.screenshot(path='/tmp/dshboard-3081-after-turn.png', full_page=False)
    browser.close()
