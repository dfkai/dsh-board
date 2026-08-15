"""Headless visual check of the dshboard sidebar usage entry (3081).

Dev-only: python3 test/e2e.py
Requires: python3 -m playwright install chromium
"""
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:3081/'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL, wait_until='domcontentloaded')
    # The app keeps SSE/WebSocket channels open, so networkidle never fires.
    page.wait_for_timeout(8000)
    triggers = page.locator('.dshboard-trigger').count()
    print(f'triggers: {triggers}')
    # Wide mode: the inline panel is expanded by default (no click needed).
    panel = page.locator('.dshboard-inline .dshboard-panel')
    print(f'inline panel (default open): {panel.count()}')
    if panel.count() > 0:
        print('--- panel text (head) ---')
        print('\n'.join(panel.first.inner_text().splitlines()[:10]))
    # Trigger toggles collapse in wide mode.
    page.locator('.dshboard-trigger').first.click()
    page.wait_for_timeout(500)
    print(f'after trigger click (collapsed): {panel.count()}')
    print('--- console errors ---')
    for line in errors[:12]:
        print(line)
    page.screenshot(path='/tmp/dshboard-3081.png', full_page=False)
    print('screenshot: /tmp/dshboard-3081.png')
    browser.close()
