// Exécuté dans le contexte de run.js (globals : SKILLS, Engine, Progression, Session, storage, test, assert...)

function setup() {
    storage.init();
    const progression = new Progression();
    progression.load();
    return { progression, engine: new Engine(progression) };
}

test('engine: toutes les sessions ont 5 exercices corrects (500 tirages / compétence)', () => {
    const { engine } = setup();
    for (const id of SKILL_ORDER) {
        for (let n = 0; n < 500; n++) {
            const session = engine.generateSession(id);
            assert.strictEqual(session.length, 5);
            for (const ex of session) {
                const [a, b] = ex.operands;
                const total = ex.operation === '+' ? a + b : a * b;
                assert.strictEqual(ex.total, total);
                if (ex.type === 'missing') assert.strictEqual(ex.answer, ex.operation === '+' ? b : a);
                else assert.strictEqual(ex.answer, total);
            }
        }
    }
});

test('engine: QCM = 4 choix distincts, positifs, contenant la bonne réponse', () => {
    const { engine } = setup();
    for (const id of SKILL_ORDER) {
        for (let n = 0; n < 500; n++) {
            for (const ex of engine.generateSession(id)) {
                if (ex.type === 'numeric') { assert.strictEqual(ex.choices, undefined); continue; }
                assert.strictEqual(ex.choices.length, 4, `${ex.question} : ${ex.choices}`);
                assert.strictEqual(new Set(ex.choices).size, 4);
                assert.ok(ex.choices.every(c => Number.isInteger(c) && c > 0));
                assert.ok(ex.choices.includes(ex.answer));
            }
        }
    }
});

test('engine: pas de doublon dans une session', () => {
    const { engine } = setup();
    for (const id of SKILL_ORDER) {
        let dup = 0;
        for (let n = 0; n < 500; n++) {
            const keys = engine.generateSession(id).map(e => e.key);
            if (new Set(keys).size !== keys.length) dup++;
        }
        assert.ok(dup <= 5, `${id}: ${dup} sessions avec doublon sur 500`);
    }
});

test('engine: validation de la réponse', () => {
    const { engine } = setup();
    const ex = { answer: 8 };
    assert.ok(engine.validateAnswer(ex, '8'));
    assert.ok(engine.validateAnswer(ex, ' 8 '));
    assert.ok(engine.validateAnswer(ex, 8));
    for (const bad of ['7', '8.5', 'abc', '', '08x', '-8']) assert.ok(!engine.validateAnswer(ex, bad), bad);
});

test('engine: explications en français', () => {
    const { engine } = setup();
    assert.match(engine.getExplanation({ operation: '+', operands: [5, 3], total: 8 }), /5 et 3 font 8/);
    assert.match(engine.getExplanation({ operation: '×', operands: [7, 2], total: 14 }), /double de 7/);
    assert.match(engine.getExplanation({ operation: '×', operands: [7, 5], total: 35 }), /7 groupes de 5 font 35/);
});

test('engine: la compétence tourne (pas toujours la même)', () => {
    const { engine, progression } = setup();
    const order = [];
    for (let i = 0; i < 3; i++) {
        const id = engine.selectSkillForSession();
        order.push(id);
        progression.recordAnswer(id, true, 2000);
    }
    assert.deepStrictEqual(order, ['addition-simple', 'multiply-2', 'multiply-5']);
});

test('progression: les étoiles de récompense sont indépendantes de la maîtrise', () => {
    const { progression } = setup();
    for (let i = 0; i < 6; i++) progression.recordAnswer('multiply-5', true, 1500);
    assert.strictEqual(progression.getMasteryLevel('multiply-5'), 3);
    assert.strictEqual(progression.getTotalStars(), 0);
    progression.addStars(3);
    assert.strictEqual(progression.getTotalStars(), 3);
});

test('progression: maîtrise = précision + vitesse, temps plafonné', () => {
    const { progression } = setup();
    for (let i = 0; i < 5; i++) progression.recordAnswer('multiply-2', true, 8000);
    assert.strictEqual(progression.getMasteryLevel('multiply-2'), 2, 'précis mais lent → niveau 2');
    progression.recordAnswer('multiply-5', true, 10 * 60 * 1000);
    assert.ok(progression.getSkillStats('multiply-5').avg_time_ms <= MASTERY.maxCountedMs);
});

test('progression: persistance et reset sans toucher aux autres clés', () => {
    const { progression } = setup();
    localStorage.setItem('autre_app', 'garder');
    progression.addStars(4);
    progression.markDiscovery('multiply-5');
    const again = new Progression(); again.load();
    assert.strictEqual(again.getTotalStars(), 4);
    assert.ok(again.hasSeenDiscovery('multiply-5'));
    again.reset();
    assert.strictEqual(again.getTotalStars(), 0);
    assert.ok(!again.hasSeenDiscovery('multiply-5'));
    assert.strictEqual(localStorage.getItem('autre_app'), 'garder');
});

test('session: étoiles créditées une seule fois, planète débloquée à 10', () => {
    const { engine, progression } = setup();
    progression.addStars(8);
    const s = new Session(engine, progression);
    s.start();
    for (const ex of s.exercises) { s.beginQuestion(); s.submitAnswer(ex.answer); s.next(); }
    assert.ok(s.isComplete());
    const sum = s.complete();
    assert.strictEqual(sum.correct, 5);
    assert.strictEqual(sum.starsEarned, 3);
    assert.strictEqual(progression.getTotalStars(), 11);
    assert.deepStrictEqual(sum.newPlanets.map(p => p.name), ['Lune']);
    s.complete();
    assert.strictEqual(progression.getTotalStars(), 11, 'complete() doit être idempotent');
    assert.strictEqual(storage.get(storage.KEYS.SESSION_HISTORY).length, 1);
});

test('session: barème d\'étoiles', () => {
    assert.deepStrictEqual([0, 1, 2, 3, 4, 5].map(starsForScore), [0, 0, 0, 1, 2, 3]);
});

test('session: le chrono mesure la question, pas la session', () => {
    const { engine, progression } = setup();
    const s = new Session(engine, progression);
    s.start();
    s.questionStart = Date.now() - 2000;   // question affichée il y a 2 s
    s.submitAnswer(s.getCurrentExercise().answer);
    assert.ok(s.results[0].time_ms >= 1900 && s.results[0].time_ms < 4000);
});
