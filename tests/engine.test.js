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

// ---------- Coups de pouce : 2 gratuits par session, au-delà 2⭐ max et hors maîtrise ----------

function playSession(engine, progression, hintOnQuestions = [], wrongOn = []) {
    const s = new Session(engine, progression);
    s.start();
    s.exercises.forEach((ex, i) => {
        s.beginQuestion();
        if (hintOnQuestions.includes(i)) s.useHint();
        s.submitAnswer(wrongOn.includes(i) ? ex.answer + 1 : ex.answer);
        s.next();
    });
    return s;
}

test('coups de pouce: 2 gratuits → aucune pénalité, tout compte pour la maîtrise', () => {
    const { engine, progression } = setup();
    const s = playSession(engine, progression, [0, 1]);
    assert.strictEqual(s.hintsUsed, 2);
    assert.strictEqual(s.freeHintsLeft(), 0);
    const sum = s.complete();
    assert.strictEqual(sum.starsEarned, 3, '5/5 avec 2 coups de pouce garde 3 étoiles');
    assert.strictEqual(sum.capped, false);
    assert.strictEqual(progression.getSkillStats(s.skill).seen, 5, 'les 5 réponses comptent');
});

test('coups de pouce: au-delà du quota → 2 étoiles max et réponses aidées hors maîtrise', () => {
    const { engine, progression } = setup();
    const s = playSession(engine, progression, [0, 1, 2, 3]);   // 4 coups de pouce : les 3e et 4e sont hors quota
    assert.ok(s.isOverHintQuota());
    assert.deepStrictEqual(s.results.map(r => r.countedForMastery), [true, true, false, false, true]);
    const sum = s.complete();
    assert.strictEqual(sum.correct, 5);
    assert.strictEqual(sum.starsEarned, 2, '5/5 mais plafonné à 2 étoiles');
    assert.strictEqual(sum.capped, true);
    assert.strictEqual(progression.getSkillStats(s.skill).seen, 3, 'seules 3 réponses comptent dans la maîtrise');
    assert.strictEqual(progression.getTotalStars(), 2);
});

test('coups de pouce: le plafond ne touche pas une session déjà ≤ 2 étoiles', () => {
    const { engine, progression } = setup();
    const s = playSession(engine, progression, [0, 1, 2], [3]);  // 4/5 → 2 étoiles
    const sum = s.complete();
    assert.strictEqual(sum.starsEarned, 2);
    assert.strictEqual(sum.capped, false, "pas de message « plafonné » si le plafond n'a rien retiré");
});

test('coups de pouce: un seul par question, et le quota est par session', () => {
    const { engine, progression } = setup();
    const s = new Session(engine, progression);
    s.start();
    s.beginQuestion();
    s.useHint(); s.useHint(); s.useHint();
    assert.strictEqual(s.hintsUsed, 1, 'trois clics sur la même question = un seul coup de pouce');
    const s2 = new Session(engine, progression);
    s2.start();
    assert.strictEqual(s2.freeHintsLeft(), HINTS.freePerSession, 'nouvelle session : quota remis à 2');
});

// ---------- Réapparition des erreurs ----------

// Joue une session en répondant faux aux questions (indices) listées, juste aux autres
function playWith(engine, progression, { wrongOn = [], hintOn = [] } = {}) {
    const s = new Session(engine, progression);
    s.start();
    s.exercises.forEach((ex, i) => {
        s.beginQuestion();
        if (hintOn.includes(i)) s.useHint();
        s.submitAnswer(wrongOn.includes(i) ? ex.answer + 1 : ex.answer);
        s.next();
    });
    return s;
}

test('erreurs: une erreur est mémorisée, une réussite non', () => {
    const { engine, progression } = setup();
    const s = playWith(engine, progression, { wrongOn: [0] });
    const wrongKey = s.exercises[0].key;
    const pending = progression.getPendingErrors();
    assert.deepStrictEqual(pending.map(e => e.key), [wrongKey]);
    assert.strictEqual(pending[0].streak, 0);
});

test('erreurs: elle réapparaît à la session suivante, même si la compétence est autre', () => {
    const { engine, progression } = setup();
    const first = playWith(engine, progression, { wrongOn: [0] });
    const wrong = first.exercises[0];
    const next = new Session(engine, progression);
    next.start();
    assert.notStrictEqual(next.skill, first.skill, 'la rotation passe à une autre compétence');
    const idx = next.exercises.findIndex(e => e.key === wrong.key);
    assert.ok(idx === 1 || idx === 3, `à revoir en question 2 ou 4 (index ${idx})`);
    const again = next.exercises[idx];
    assert.strictEqual(again.review, true);
    assert.strictEqual(again.skill, wrong.skill, 'garde sa compétence d\'origine');
    assert.strictEqual(again.type, wrong.type, 'même type d\'exercice');
    assert.strictEqual(next.exercises.length, 5);
    assert.ok(!next.exercises[0].review && !next.exercises[4].review, 'première et dernière questions restent fraîches');
});

test('erreurs: acquise après 2 réussites consécutives ; une erreur remet la série à zéro', () => {
    const { engine, progression } = setup();
    const ex = engine.buildExercise('multiply-5', 'numeric', 7, 5);
    progression.noteResult(ex, false);
    assert.strictEqual(progression.noteResult(ex, true), 'progress');
    assert.strictEqual(progression.noteResult(ex, false), 'added', 'une erreur remet la série à 0');
    assert.strictEqual(progression.getPendingErrors()[0].streak, 0);
    assert.strictEqual(progression.noteResult(ex, true), 'progress');
    assert.strictEqual(progression.noteResult(ex, true), 'cleared');
    assert.strictEqual(progression.getPendingErrors().length, 0);
});

test('erreurs: une réussite avec coup de pouce ne fait pas avancer la série', () => {
    const { engine, progression } = setup();
    const ex = engine.buildExercise('addition-simple', 'numeric', 8, 6);
    progression.noteResult(ex, false);
    assert.strictEqual(progression.noteResult(ex, true, true), null);
    assert.strictEqual(progression.noteResult(ex, true, true), null);
    assert.strictEqual(progression.getPendingErrors()[0].streak, 0);
});

test('erreurs: au plus 2 par session, 5 questions, sans doublon, les moins récemment posées d\'abord', () => {
    const { engine, progression } = setup();
    [[2, 3], [4, 4], [6, 5], [7, 8]].forEach(([a, b]) =>
        progression.noteResult(engine.buildExercise('addition-simple', 'numeric', a, b), false));
    const asked = [];
    for (let n = 0; n < 4; n++) {
        const s = new Session(engine, progression);
        s.start();
        assert.strictEqual(s.exercises.length, 5);
        assert.strictEqual(s.exercises.filter(e => e.review).length, 2);
        const keys = s.exercises.map(e => e.key);
        assert.strictEqual(new Set(keys).size, 5, `doublon : ${keys}`);
        asked.push(...s.exercises.filter(e => e.review).map(e => e.key));
    }
    assert.strictEqual(new Set(asked).size, 4, 'les 4 erreurs passent chacune à leur tour : ' + asked);
});

test('erreurs: un calcul à revoir compte pour la maîtrise de sa propre compétence', () => {
    const { engine, progression } = setup();
    progression.recordAnswer('addition-simple', true, 1000);   // l'addition a déjà été jouée : la rotation passe à la suivante
    progression.noteResult(engine.buildExercise('addition-simple', 'numeric', 9, 9), false);
    const s = new Session(engine, progression);
    s.start();
    assert.notStrictEqual(s.skill, 'addition-simple');
    s.exercises.forEach(ex => { s.beginQuestion(); s.submitAnswer(ex.answer); s.next(); });
    // 5 questions : 3 de la compétence du jour, le calcul à revoir + 1 rappel (mélange 60/40) d'addition
    assert.strictEqual(progression.getSkillStats('addition-simple').seen, 3, '1 déjà vue + le calcul à revoir + 1 rappel');
    assert.strictEqual(progression.getSkillStats(s.skill).seen, 3);
});

test('erreurs: résumé de session (revues, calculs acquis) et persistance', () => {
    const { engine, progression } = setup();
    const ex = engine.buildExercise('multiply-2', 'numeric', 6, 2);
    progression.noteResult(ex, false);
    progression.noteResult(ex, true);            // 1 réussite déjà ; la prochaine l'acquiert
    const s = new Session(engine, progression);
    s.start();
    s.exercises.forEach(e => { s.beginQuestion(); s.submitAnswer(e.answer); s.next(); });
    const sum = s.complete();
    assert.strictEqual(sum.reviewed, 1);
    assert.strictEqual(sum.cleared, 1);

    // persistance : une erreur non acquise survit au rechargement
    progression.noteResult(engine.buildExercise('addition-simple', 'numeric', 5, 6), false);
    const reloaded = new Progression(); reloaded.load();
    assert.deepStrictEqual(reloaded.getPendingErrors().map(e => e.key), ['+:5:6']);
});

test('erreurs: stockage plafonné (les plus anciennes sont oubliées)', () => {
    const { engine, progression } = setup();
    for (let i = 1; i <= REVIEW.maxStored + 5; i++) {
        progression.noteResult(engine.buildExercise('multiply-5', 'numeric', i, 5), false);
    }
    assert.strictEqual(progression.getPendingErrors().length, REVIEW.maxStored);
    assert.ok(!progression.data.errors['×:1:5'], 'la plus ancienne a été oubliée');
});

test('maîtrise: fenêtre glissante de 20 réponses (la maîtrise redescend après une mauvaise série)', () => {
    const { progression } = setup();
    for (let i = 0; i < 10; i++) progression.recordAnswer('multiply-2', true, 1500);
    assert.strictEqual(progression.getMasteryLevel('multiply-2'), 3);
    for (let i = 0; i < 12; i++) progression.recordAnswer('multiply-2', false, 4000);
    assert.strictEqual(progression.getMasteryLevel('multiply-2'), 1, '12 erreurs sur les 20 dernières → niveau 1');
    const st = progression.getSkillStats('multiply-2');
    assert.strictEqual(st.recent.length, MASTERY.window);
    assert.strictEqual(st.seen, 22, 'les totaux gardent tout l\'historique');
    for (let i = 0; i < 20; i++) progression.recordAnswer('multiply-2', true, 1500);
    assert.strictEqual(progression.getMasteryLevel('multiply-2'), 3, 'les anciennes erreurs sortent de la fenêtre');
});

test('maîtrise: anciennes données (sans fenêtre) reconstituées au chargement', () => {
    const { progression } = setup();
    storage.set(storage.KEYS.PROGRESSION, { version: 1, totalStars: 5, discovered: {}, errors: {},
        skills: { 'multiply-2': { seen: 40, correct: 38, wrong: 2, avg_time_ms: 2000, mastery_level: 3, last_practiced: null } } });
    progression.load();
    const st = progression.getSkillStats('multiply-2');
    assert.strictEqual(st.recent.length, 20);
    assert.strictEqual(progression.windowStats(st).correct, 19);
    assert.strictEqual(progression.computeMastery(st), 3);
});

test('mélange: rien à rappeler tant qu\'une seule compétence a été pratiquée', () => {
    const { engine } = setup();
    for (let i = 0; i < 20; i++) assert.ok(engine.generateSession('addition-simple').every(e => e.skill === 'addition-simple' && !e.recall));
});

test('mélange: 3 questions du jour + 2 rappels d\'autres compétences, aux questions 2 et 4', () => {
    const { engine, progression } = setup();
    progression.recordAnswer('addition-simple', true, 1500);
    progression.recordAnswer('multiply-2', true, 1500);
    for (let i = 0; i < 30; i++) {
        const session = engine.generateSession('multiply-5');
        assert.strictEqual(session.length, 5);
        assert.deepStrictEqual(session.map(e => !!e.recall), [false, true, false, true, false]);
        session.filter(e => e.recall).forEach(e => assert.notStrictEqual(e.skill, 'multiply-5'));
        assert.strictEqual(new Set(session.map(e => e.key)).size, 5, 'pas de doublon');
    }
});

test('mélange: les calculs à revoir passent avant les rappels', () => {
    const { engine, progression } = setup();
    progression.recordAnswer('addition-simple', true, 1500);
    progression.noteResult(engine.buildExercise('multiply-2', 'numeric', 7, 2), false);
    const session = engine.generateSession('multiply-5');
    assert.strictEqual(session.filter(e => e.review).length, 1);
    assert.strictEqual(session.filter(e => e.recall).length, 1);
    assert.strictEqual(session[1].review, true, 'le calcul raté prend la première place de rappel (question 2)');
    assert.strictEqual(session[3].recall, true);
});

test('temps: la maîtrise utilise le temps de réflexion (premier chiffre), le total reste dans le journal', () => {
    const { engine, progression } = setup();
    const s = new Session(engine, progression);
    s.start();
    s.beginQuestion();
    s.questionStart = Date.now() - 6000;           // 6 s au total...
    s.noteInput(s.questionStart + 1800);           // ...dont 1,8 s avant le premier chiffre
    s.noteInput(s.questionStart + 4000);           // un second chiffre ne change rien
    const ex = s.getCurrentExercise();
    s.submitAnswer(ex.answer);
    const r = s.results[0];
    assert.strictEqual(r.think_ms, 1800);
    assert.ok(r.time_ms >= 6000);
    assert.strictEqual(progression.getSkillStats(ex.skill).recent[0].t, 1800);
});

test('temps: réponse à choix → temps de réflexion = temps total', () => {
    const { engine, progression } = setup();
    const s = new Session(engine, progression);
    s.start(); s.beginQuestion();
    s.questionStart = Date.now() - 2500;
    s.submitAnswer(s.getCurrentExercise().answer);
    assert.ok(Math.abs(s.results[0].think_ms - s.results[0].time_ms) < 5);
});

test('journal: une ligne par question dans l\'historique, abandon tracé une seule fois', () => {
    const { engine, progression } = setup();
    const s = new Session(engine, progression);
    s.start();
    s.exercises.forEach(() => { s.beginQuestion(); s.submitAnswer(s.getCurrentExercise().answer); s.next(); });
    s.complete();
    const last = storage.get(storage.KEYS.SESSION_HISTORY).slice(-1)[0];
    assert.strictEqual(last.answers.length, 5);
    assert.ok(last.answers.every(a => typeof a.think_ms === 'number' && typeof a.total_ms === 'number' && a.ok === true));

    const s2 = new Session(engine, progression);
    s2.start(); s2.beginQuestion(); s2.submitAnswer(s2.getCurrentExercise().answer); s2.next();
    s2.abandon(); s2.abandon();
    const hist = storage.get(storage.KEYS.SESSION_HISTORY);
    assert.strictEqual(hist.filter(h => h.abandoned).length, 1);
    assert.strictEqual(hist.slice(-1)[0].answered, 1);
    assert.strictEqual(hist.slice(-1)[0].at_question, 2);
});
