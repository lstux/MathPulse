"""Test de fumée navigateur : parcours complet + hors ligne.
Usage : python3 tests/smoke.py [url]
  - sans url : démarre un serveur local temporaire sur la racine du dépôt ;
  - avec url : teste ce site (ex. la version déployée).
Nécessite : pip install playwright && playwright install chromium
"""
import os, re, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
import atexit
server = None
atexit.register(lambda: server and server.terminate())
if len(sys.argv) > 1:
    URL = sys.argv[1]
else:
    server = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '--bind', '127.0.0.1'], cwd=ROOT,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    URL = 'http://127.0.0.1:8765/index.html'

def solve(q):
    m = re.match(r'(\d+) ([+×−]) (\d+) = \?', q)
    if m: a, b = int(m[1]), int(m[3]); return a + b if m[2] == '+' else a - b if m[2] == '−' else a * b
    m = re.match(r'(\d+) − \? = (\d+)', q)
    if m: return int(m[1]) - int(m[2])
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
    pg.click('#btn-start-game')
    # coups de pouce : 2 gratuits annoncés, le décompte baisse, le dernier annonce le plafond
    assert '2 gratuits' in pg.inner_text('#btn-hint'), pg.inner_text('#btn-hint')
    pg.click('#btn-hint'); assert pg.locator('.visual').count() == 1, 'illustration attendue après le coup de pouce'
    assert pg.get_attribute('#mascot', 'data-mood') == 'think', 'le renard réfléchit pendant le coup de pouce'
    # sons : activés par défaut, journalisés ; le bouton 🔇 coupe tout
    assert pg.get_attribute('#btn-sound', 'aria-pressed') == 'true'
    log = pg.evaluate('Sound.log'); assert 'start' in log and 'hint' in log, log
    pg.click('#btn-sound'); assert pg.get_attribute('#btn-sound', 'aria-pressed') == 'false'
    n = len(pg.evaluate('Sound.log')); pg.evaluate("Sound.play('good')"); assert len(pg.evaluate('Sound.log')) == n, 'aucun son attendu une fois coupé'
    pg.click('#btn-sound'); assert pg.get_attribute('#btn-sound', 'aria-pressed') == 'true'
    assert pg.evaluate('storage.get(storage.KEYS.USER_PREFS).sound') is True
    def answer_current():
        ans = solve(pg.inner_text('#question'))
        if pg.locator('.choice').count(): pg.click(f'.choice[data-value="{ans}"]')
        else:
            for d in str(ans): pg.click(f'.key[data-key="{d}"]')
            pg.click('.key[data-key="ok"]')
        pg.wait_for_timeout(1400)
    answer_current()
    assert '1 gratuit' in pg.inner_text('#btn-hint') and 'gratuits' not in pg.inner_text('#btn-hint'), pg.inner_text('#btn-hint')
    pg.click('#btn-hint'); answer_current()
    assert 'max cette session' in pg.inner_text('#btn-hint'), pg.inner_text('#btn-hint')
    pg.click('#btn-hint'); answer_current()      # 3e coup de pouce : hors quota
    for _ in range(2): answer_current()          # fin de la session 1 (5 questions)
    assert 'maximum' in pg.inner_text('.result-card'), 'plafond de 2 étoiles attendu au résultat'
    assert pg.evaluate('window.mathpulse.progression.getTotalStars()') == 2
    pg.click('#btn-again'); pg.wait_for_timeout(300)
    for session in range(1, 3):
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
        assert pg.locator('#rabbit-says').count() == 1, 'la lapine doit apparaître en fin de session'
        if session < 2: pg.click('#btn-again'); pg.wait_for_timeout(300)

    # Réapparition des erreurs : un calcul raté revient (étiqueté) aux deux sessions suivantes, puis est acquis
    recalls = [0]
    def play_session(wrong_first=False):
        seen = []
        if pg.locator('#btn-start-game').count(): pg.click('#btn-start-game')
        for i in range(5):
            q = pg.inner_text('#question')
            seen.append((q, pg.locator('#review-tag').count() == 1))
            recalls[0] += pg.locator('#recall-tag').count()
            ans = solve(q)
            wrong = wrong_first and i == 0
            if pg.locator('.choice').count(): pg.click(f'.choice[data-value="{ans}"]')
            else:
                for d in str(ans + 1 if wrong else ans): pg.click(f'.key[data-key="{d}"]')
                pg.click('.key[data-key="ok"]')
            mood = pg.get_attribute('#mascot', 'data-mood')
            assert mood == ('comfort' if wrong else 'bravo'), f'réaction du renard inattendue : {mood}'
            if wrong: pg.click('#btn-continue'); pg.wait_for_timeout(200)
            else: pg.wait_for_timeout(1400)
        assert pg.locator('.result-card').count(), 'écran de résultat attendu'
        assert pg.locator('#rabbit-says').count() == 1, 'la lapine doit apparaître en fin de session'
        return seen

    pg.click('#btn-again'); pg.wait_for_timeout(300)
    missed = play_session(wrong_first=True)[0][0]
    pending = pg.evaluate('window.mathpulse.progression.getPendingErrors().length')
    assert pending == 1, f'1 erreur mémorisée attendue ({pending})'
    for round_ in (1, 2):
        pg.click('#btn-again'); pg.wait_for_timeout(300)
        seen = play_session()
        assert seen.count((missed, True)) == 1, f'« {missed} » doit revenir étiqueté (passage {round_}) : {seen}'
    assert pg.locator('.cleared').count() == 1, 'message « calcul acquis » attendu après 2 réussites'
    assert pg.evaluate('window.mathpulse.progression.getPendingErrors().length') == 0, "l'erreur doit être acquise"

    stars = pg.evaluate('window.mathpulse.progression.getTotalStars()')
    assert stars >= 5, f'étoiles non créditées ({stars})'
    pg.wait_for_timeout(800)
    assert recalls[0] >= 2, f'rappels de notions attendus dans les sessions suivantes ({recalls[0]})'
    # espace parent : version affichée, abandon tracé
    pg.click('#btn-universe') if pg.locator('#btn-universe').count() else None
    pg.evaluate("window.mathpulse.screenManager.show('parent')"); pg.wait_for_timeout(200)
    assert 'Version' in pg.inner_text('#app-version')
    assert 'réflexion' in pg.inner_text('.skill-card >> nth=0') or 'Pas encore' in pg.inner_text('.skill-card >> nth=0')
    ctx.set_offline(True); pg.reload(); pg.wait_for_timeout(600)
    assert pg.inner_text('h1') == 'MathPulse', 'rechargement hors ligne en échec'
    b.close()

if server: server.terminate()
assert not errors, errors
print(f'smoke OK ({stars} étoiles, hors ligne OK, aucune erreur console)')
