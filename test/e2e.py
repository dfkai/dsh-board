"""Headless visual check of the dsh-rich strip on the webtest instance (3081).

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
    # The app keeps SSE/WebSocket channels open, so networkidle never fires;
    # wait a fixed window for the shell to boot and slots to render.
    page.wait_for_timeout(8000)
    anchors = page.locator('[data-slot="conversation.input.dock"]').count()
    strips = page.locator('.dsh-rich-strip').count()
    cells = page.locator('.dsh-rich-cell').count()
    print(f'dock anchors: {anchors}, strips: {strips}, cells: {cells}')
    if strips > 0:
        text = page.locator('.dsh-rich-strip').first.inner_text()
        print('--- strip text ---')
        print(text)
    print('--- console errors ---')
    for line in errors[:12]:
        print(line)
    page.screenshot(path='/tmp/dsh-rich-3081.png', full_page=False)
    print('screenshot: /tmp/dsh-rich-3081.png')
    browser.close()
