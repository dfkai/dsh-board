"""Drive one real conversation turn on 3081 and read the strip afterwards.

Dev-only: python3 test/drive-turn.py [prompt]
Proves the projection data path end to end: prompt → model → tokens/steps
→ host projections → session/projection frames → strip cells.
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
    # Poll until the strip reports steps or the budget runs out.
    deadline = 120_000
    waited = 0
    while waited < deadline:
        page.wait_for_timeout(5000)
        waited += 5000
        text = page.locator('.dsh-rich-strip').first.inner_text()
        if '—' not in text.replace('上下文占用\n—', '') and '轮次 / 步骤\n—' not in text:
            break
    print('--- strip text after turn ---')
    print(page.locator('.dsh-rich-strip').first.inner_text())
    print(f"--- dots: {page.locator('.dsh-rich-dot').count()} | cells: {page.locator('.dsh-rich-cell').count()} ---")
    print('--- console errors ---')
    for line in errors[:10]:
        print(line)
    page.screenshot(path='/tmp/dsh-rich-3081-after-turn.png', full_page=False)
    browser.close()
