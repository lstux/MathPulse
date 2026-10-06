"""Test de fumée navigateur : parcours complet + hors ligne.
Usage : python3 tests/smoke.py [url]   (par défaut http://localhost:8000/index.html)
Nécessite : pip install playwright && playwright install chromium
"""
import re, sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/index.html'

def solve(q):
    m = re.match(r'(\d+) ([+×]) (\d+) = \?', q)
    if m: a, b = int(m[1]), int(m[3]); return a + b if m[2] == '+' else a * b
    m = re.match(r'(\d+) \+ \? = (\d+)', q)
    if m: return int(m[2]) - int(m[1])
    m = re.match(r'\? × (\d+) = (\d+)', q); return int(m[2]) // int(m[1])

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 780})
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL + ('&' if '?' in URL else '?') + 'sw'); pg.wait_for_timeout(500)

    pg.click('#btn-play'); pg.click('#btn-start-session')
    for session in range(3):
        if pg.locator('#btn-start-game').count(): pg.click('#btn-start-game')
        for _ in range(5):
            ans = solve(pg.inner_text('#question'))
            if pg.locator('.choice').count(): pg.click(f'.choice[data-value="{ans}"]')
            else:
                for d in str(ans): pg.click(f'.key[data-key="{d}"]')
                assert pg.inner_text('#answer-display') == str(ans), 'le pavé numérique doit afficher la saisie'
                pg.click('.key[data-key="ok"]')
            pg.wait_for_timeout(1400)
        assert pg.locator('.result-card').count(), 'écran de résultat attendu'
        if session < 2: pg.click('#btn-again'); pg.wait_for_timeout(300)

    stars = pg.evaluate('window.mathpulse.progression.getTotalStars()')
    assert stars >= 3, f'étoiles non créditées ({stars})'
    pg.wait_for_timeout(800)
    ctx.set_offline(True); pg.reload(); pg.wait_for_timeout(600)
    assert pg.inner_text('h1') == 'MathPulse', 'rechargement hors ligne en échec'
    b.close()

assert not errors, errors
print(f'smoke OK ({stars} étoiles, hors ligne OK, aucune erreur console)')
