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
                const total = ex.operation === '+' ? a + b : ex.operation === '−' ? a - b : ex.operation === '÷' ? a / b : a * b;
                assert.strictEqual(ex.total, total);
                if (ex.type === 'missing') assert.strictEqual(ex.answer, (ex.operation === '×' || ex.operation === '÷') ? a : b);
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

test('soustraction: résultat toujours ≥ 1, jamais négatif, question et explication', () => {
    const { engine } = setup();
    for (let n = 0; n < 500; n++) for (const ex of engine.generateSession('subtract-simple')) {
        const [a, b] = ex.operands;
        assert.ok(a >= 3 && a <= 18 && b >= 1 && b <= 9 && a - b >= 1, `${a} − ${b}`);
        assert.strictEqual(ex.total, a - b);
        assert.ok(ex.type === 'missing' ? ex.question === `${a} − ? = ${a - b}` : ex.question === `${a} − ${b} = ?`, ex.question);
    }
    assert.match(engine.getExplanation({ operation: '−', operands: [8, 3], total: 5 }), /enlève 3 de 8, il en reste 5/);
});

test('×10: réponses jusqu\'à 100, explication « un zéro de plus »', () => {
    const { engine } = setup();
    const seen = new Set();
    for (let n = 0; n < 500; n++) for (const ex of engine.generateSession('multiply-10')) { assert.strictEqual(ex.operands[1], 10); seen.add(ex.total); }
    assert.ok(seen.has(100) && seen.has(10));
    assert.match(engine.getExplanation({ operation: '×', operands: [7, 10], total: 70 }), /ajouter un zéro : 7 × 10 = 70/);
});

test('déblocage: soustractions après additions niveau 2, ×10 après ×2 niveau 2', () => {
    const { engine, progression } = setup();
    assert.ok(!engine.isUnlocked('subtract-simple') && !engine.isUnlocked('multiply-10'));
    for (let i = 0; i < 5; i++) engine.selectSkillForSession(), assert.ok(!['subtract-simple', 'multiply-10'].includes(engine.selectSkillForSession()));
    for (let i = 0; i < 4; i++) progression.recordAnswer('addition-simple', true, 2000);
    assert.ok(engine.isUnlocked('subtract-simple') && !engine.isUnlocked('multiply-10'));
    assert.strictEqual(engine.selectSkillForSession(), 'subtract-simple', 'nouvelle compétence (niveau 0) prioritaire');
    for (let i = 0; i < 4; i++) progression.recordAnswer('multiply-2', true, 2000);
    assert.ok(engine.isUnlocked('multiply-10'));
});

test('série rapide: indisponible tant qu\'aucune compétence n\'est au niveau 2, puis 5 calculs numériques éligibles', () => {
    const { engine, progression } = setup();
    assert.ok(!engine.rapidAvailable());
    for (let i = 0; i < 4; i++) progression.recordAnswer('multiply-2', true, 2000);
    assert.ok(engine.rapidAvailable());
    progression.recordAnswer('addition-simple', true, 2000);   // niveau 1 seulement : exclue
    for (let n = 0; n < 50; n++) {
        const ex = engine.generateRapid();
        assert.strictEqual(ex.length, 5);
        assert.ok(ex.every(e => e.skill === 'multiply-2' && e.type === 'numeric' && !e.choices));
    }
});

test('série rapide: étoiles bonus (5/5 + ≥ 4 rapides), sans coup de pouce, erreurs mémorisées', () => {
    assert.strictEqual(Session.rapidStars(5, 5, 5), 2);
    assert.strictEqual(Session.rapidStars(5, 5, 4), 2);
    assert.strictEqual(Session.rapidStars(5, 5, 3), 1);
    assert.strictEqual(Session.rapidStars(4, 5, 4), 1);
    assert.strictEqual(Session.rapidStars(3, 5, 2), 0);
    const { engine, progression } = setup();
    for (let i = 0; i < 4; i++) progression.recordAnswer('multiply-2', true, 2000);
    const s = new Session(engine, progression);
    s.start({ rapid: true });
    assert.strictEqual(s.skill, 'rapid');
    s.exercises.forEach((ex, i) => {
        s.beginQuestion();
        s.questionStart = Date.now() - 1000;
        s.noteInput(s.questionStart + 800);
        const r = s.submitAnswer(i === 0 ? ex.answer + 1 : ex.answer);
        assert.strictEqual(r.fast, i !== 0);
        s.next();
    });
    const sum = s.complete();
    assert.strictEqual(sum.rapid, true);
    assert.strictEqual(sum.correct, 4);
    assert.strictEqual(sum.fast, 4);
    assert.strictEqual(sum.starsEarned, 1, '4 sur 5 : pas le bonus 5/5, mais 4 réponses rapides');
    assert.strictEqual(progression.getPendingErrors().length, 1, 'l\'erreur de la série revient dans les rappels');
});

test('série rapide: seules les 2 premières séries du jour rapportent des étoiles', () => {
    const { engine, progression } = setup();
    for (let i = 0; i < 4; i++) progression.recordAnswer('multiply-2', true, 2000);
    const stars = [];
    for (let n = 0; n < 4; n++) {
        const s = new Session(engine, progression);
        s.start({ rapid: true });
        s.exercises.forEach(ex => { s.beginQuestion(); s.questionStart = Date.now() - 500; s.submitAnswer(ex.answer); s.next(); });
        const sum = s.complete();
        stars.push(sum.starsEarned);
        assert.strictEqual(sum.rewarded, n < RAPID.maxRewardedPerDay);
    }
    assert.deepStrictEqual(stars, [2, 2, 0, 0]);
});

test('tables ×3 et ×4: a × n avec a de 1 à 10, explication « double », QCM sur les résultats voisins', () => {
    const { engine } = setup();
    for (const [id, n] of [['multiply-3', 3], ['multiply-4', 4]]) {
        const seen = new Set();
        for (let k = 0; k < 400; k++) for (const ex of engine.generateSession(id)) {
            assert.strictEqual(ex.operands[1], n);
            assert.ok(ex.operands[0] >= 1 && ex.operands[0] <= 10);
            assert.strictEqual(ex.total, ex.operands[0] * n);
            seen.add(ex.operands[0]);
            if (ex.type === 'multiple') assert.ok(ex.choices.length === 4 && ex.choices.includes(ex.total));
        }
        assert.strictEqual(seen.size, 10, `${id}: tous les facteurs de 1 à 10 sont tirés`);
    }
    assert.match(engine.getExplanation({ skill: 'multiply-3', operation: '×', operands: [7, 3], total: 21 }), /double de 7, c'est 14, et encore 7 de plus, ça fait 21/);
    assert.match(engine.getExplanation({ skill: 'multiply-4', operation: '×', operands: [7, 4], total: 28 }), /double de 7, c'est 14, et le double de 14, c'est 28/);
});

test('tables ×3 et ×4: débloquées par ×2 niveau 2 ; seuil de temps propre à une compétence', () => {
    const { engine, progression } = setup();
    assert.ok(!engine.isUnlocked('multiply-3') && !engine.isUnlocked('multiply-4'));
    for (let i = 0; i < 4; i++) progression.recordAnswer('multiply-2', true, 2000);
    assert.ok(engine.isUnlocked('multiply-3') && engine.isUnlocked('multiply-4'));
    // seuil spécifique : avec maxAvgMs = 3000 sur une compétence, 4 s de moyenne ne donne que le niveau 2
    SKILLS['multiply-4'].maxAvgMs = 3000;
    try {
        for (let i = 0; i < 6; i++) progression.recordAnswer('multiply-4', true, 4000);
        assert.strictEqual(progression.getMasteryLevel('multiply-4'), 2);
    } finally { delete SKILLS['multiply-4'].maxAvgMs; }
    for (let i = 0; i < 6; i++) progression.recordAnswer('multiply-3', true, 4000);
    assert.strictEqual(progression.getMasteryLevel('multiply-3'), 3, 'seuil général (5 s) : 4 s suffit');
});

test('divisions ÷2, ÷5, ÷10: divisions exactes, QCM valides, explications, déblocage par la table', () => {
    for (const [id, n, table] of [['divide-2', 2, 'multiply-2'], ['divide-5', 5, 'multiply-5'], ['divide-10', 10, 'multiply-10']]) {
        const { engine, progression } = setup();
        if (id === 'divide-2') assert.ok(!engine.isUnlocked(id), 'verrouillée au départ');
        for (let i = 0; i < 4; i++) progression.recordAnswer(table, true, 2000);   // débloque la division
        assert.ok(engine.isUnlocked(id), `${id} débloquée par ${table} niveau 2`);
        const seen = new Set();
        for (let k = 0; k < 400; k++) for (const ex of engine.generateSession(id)) {
            if (ex.skill !== id) continue;   // rappels de la table déjà pratiquée
            const [a, b] = ex.operands;
            assert.strictEqual(b, n);
            assert.strictEqual(a % n, 0);
            assert.ok(a / n >= 1 && a / n <= 10);
            assert.strictEqual(ex.total, a / n);
            if (ex.type === 'missing') { assert.strictEqual(ex.answer, a); assert.strictEqual(ex.question, `? ÷ ${n} = ${a / n}`); }
            else { assert.strictEqual(ex.answer, a / n); assert.strictEqual(ex.question, `${a} ÷ ${n} = ?`); }
            if (ex.type !== 'numeric') assert.ok(ex.choices.length === 4 && new Set(ex.choices).size === 4 && ex.choices.includes(ex.answer));
            seen.add(a / n);
        }
        assert.strictEqual(seen.size, 10, `${id}: tous les quotients de 1 à 10`);
    }
    const { engine } = setup();
    assert.match(engine.getExplanation({ skill: 'divide-5', operation: '÷', operands: [35, 5], total: 7 }), /Il y en a 7, car 7 × 5 = 35/);
    assert.match(engine.getExplanation({ skill: 'divide-2', operation: '÷', operands: [14, 2], total: 7 }), /7 dans chaque part/);
});

test('tables ×6 à ×9 et mélange: opérandes, explications, chaîne de déblocage, seuil ×7', () => {
    const { engine, progression } = setup();
    const chain = [['multiply-6', 6, 'multiply-5'], ['multiply-8', 8, 'multiply-4'], ['multiply-9', 9, 'multiply-10'], ['multiply-7', 7, 'multiply-8'], ['multiply-mix', 0, 'multiply-7']];
    for (const [id, n] of chain) {
        const { engine: e } = setup();
        for (let k = 0; k < 300; k++) for (const ex of e.generateSession(id)) {
            if (ex.skill !== id) continue;
            const [a, b] = ex.operands;
            if (n) { assert.strictEqual(b, n); assert.ok(a >= 1 && a <= 10); }
            else { assert.ok(a >= 2 && a <= 9 && b >= 2 && b <= 9); }
            assert.strictEqual(ex.total, a * b);
            if (ex.type !== 'numeric') assert.ok(ex.choices.length === 4 && ex.choices.includes(ex.answer));
        }
    }
    for (const [id, , req] of chain) {
        assert.strictEqual(SKILLS[id].requires.skill, req);
    }
    assert.match(engine.getExplanation({ skill: 'multiply-9', operation: '×', operands: [7, 9], total: 63 }), /7 × 10 = 70, moins 7, ça fait 63/);
    assert.match(engine.getExplanation({ skill: 'multiply-6', operation: '×', operands: [7, 6], total: 42 }), /7 × 5 = 35, et encore 7, ça fait 42/);
    assert.match(engine.getExplanation({ skill: 'multiply-7', operation: '×', operands: [6, 7], total: 42 }), /30 \+ 12 = 42/);
    assert.match(engine.getExplanation({ skill: 'multiply-8', operation: '×', operands: [6, 8], total: 48 }), /24, et le double de 24, c'est 48/);
    assert.strictEqual(SKILLS['multiply-7'].maxAvgMs, 6000);
});

test('divisions ÷3 à ÷9: exactes, débloquées par la table, explication « car q × n = a »', () => {
    for (const n of [3, 4, 6, 7, 8, 9]) {
        const id = `divide-${n}`;
        assert.strictEqual(SKILLS[id].requires.skill, `multiply-${n}`);
        const { engine, progression } = setup();
        for (let i = 0; i < 4; i++) progression.recordAnswer(`multiply-${n}`, true, 2000);
        assert.ok(engine.isUnlocked(id));
        const seen = new Set();
        for (let k = 0; k < 300; k++) for (const ex of engine.generateSession(id)) {
            if (ex.skill !== id) continue;
            assert.strictEqual(ex.operands[1], n);
            assert.strictEqual(ex.operands[0] % n, 0);
            assert.strictEqual(ex.total, ex.operands[0] / n);
            if (ex.type !== 'numeric') assert.ok(ex.choices.length === 4 && ex.choices.includes(ex.answer));
            seen.add(ex.total);
        }
        assert.strictEqual(seen.size, 10);
        assert.match(engine.getExplanation({ skill: id, operation: '÷', operands: [6 * n, n], total: 6 }), new RegExp(`car 6 × ${n} = ${6 * n}`));
    }
});

test('voie C : bornes des nombres, compléments en « nombre manquant », explications', () => {
    const { engine } = setup();
    const check = {
        'complement-10': (a, b) => a + b === 10 && a >= 1 && b >= 1,
        'complement-100': (a, b) => a + b === 100 && a % 10 === 0 && b % 10 === 0,
        'tens-add': (a, b) => a % 10 === 0 && b % 10 === 0 && a + b <= 100,
        'tens-sub': (a, b) => a % 10 === 0 && b % 10 === 0 && a > b,
        'add-units': (a, b) => a % 10 !== 0 && b >= 2 && b <= 9 && a + b <= 99,
        'sub-units': (a, b) => a % 10 !== 0 && b >= 2 && b <= 9 && a > b,
        'add-2digits': (a, b) => b >= 11 && b % 10 !== 0 && a + b <= 99,
        'sub-2digits': (a, b) => b >= 11 && b % 10 !== 0 && a > b && a <= 99
    };
    for (const id of Object.keys(check)) {
        for (let k = 0; k < 300; k++) for (const ex of engine.generateSession(id)) {
            if (ex.skill !== id) continue;
            assert.ok(check[id](...ex.operands), `${id}: ${ex.operands}`);
            assert.ok(ex.total >= 1 && ex.total <= 100);
            if (SKILLS[id].noNumeric) assert.notStrictEqual(ex.type, 'numeric', `${id}: jamais « a + b = ? »`);
            assert.ok(ex.type !== 'multiple' || (ex.choices.length === 4 && ex.choices.includes(ex.answer)));
            assert.strictEqual(typeof engine.getExplanation(ex), 'string');
        }
    }
    // série rapide et rappels : les compléments restent des « nombres manquants »
    assert.strictEqual(engine.generateExercise('complement-10', 'numeric').type, 'missing');
    const ex = (skill, op, a, b, t) => engine.getExplanation({ skill, operation: op, operands: [a, b], total: t });
    assert.match(ex('add-units', '+', 47, 8, 55), /on va jusqu'à 50 \(\+3\), puis on ajoute encore 5 : 55/);
    assert.match(ex('add-units', '+', 42, 5, 47), /2 \+ 5 = 7, donc 47/);
    assert.match(ex('sub-units', '−', 52, 7, 45), /on descend à 50 \(−2\), puis on enlève encore 5 : 45/);
    assert.match(ex('add-2digits', '+', 38, 45, 83), /38 \+ 40 = 78, puis \+ 5 = 83/);
    assert.match(ex('sub-2digits', '−', 83, 27, 56), /83 − 20 = 63, puis − 7 = 56/);
    assert.match(ex('tens-add', '+', 30, 40, 70), /3 dizaines \+ 4 dizaines = 7 dizaines, soit 70/);
    assert.match(ex('complement-100', '+', 60, 40, 100), /il manque 40/);
});

test('voie C : chaîne de déblocage', () => {
    const chain = { 'complement-10': 'addition-simple', 'tens-add': 'complement-10', 'tens-sub': 'subtract-simple', 'complement-100': 'tens-add',
        'add-units': 'tens-add', 'sub-units': 'tens-sub', 'add-2digits': 'add-units', 'sub-2digits': 'sub-units' };
    for (const [id, req] of Object.entries(chain)) assert.strictEqual(SKILLS[id].requires.skill, req, id);
    assert.ok(SKILL_ORDER.every(id => SKILLS[id]) && new Set(SKILL_ORDER).size === SKILL_ORDER.length);
    assert.ok(PATHS.every(p => p.skills.every(id => SKILLS[id])));
    assert.strictEqual([].concat(...PATHS.map(p => p.skills)).length, SKILL_ORDER.length, 'chaque compétence est dans une voie');
});

test('plafond de 3 compétences en cours : les nouvelles attendent, une place se libère à la maîtrise', () => {
    localStorage.clear();
    const { engine, progression } = setup();
    const good = (id, n = 4, ms = 2000) => { for (let i = 0; i < n; i++) progression.recordAnswer(id, true, ms); };
    good('addition-simple'); good('subtract-simple');                 // niveau 2 : débloque complement-10, tens-add, tens-sub, multiply-3… (÷ 2 aussi via ×2)
    good('multiply-2');
    // 3 compétences en cours (niveau 2)
    assert.strictEqual(engine.inProgressSkills().length, 3);
    assert.ok(engine.isUnlocked('multiply-3') && engine.isWaiting('multiply-3'), 'une 4e compétence attend');
    for (let k = 0; k < 200; k++) assert.ok(engine.inProgressSkills().includes(engine.selectSkillForSession()), 'seules les compétences en cours sont proposées');
    // l'une est maîtrisée (niveau 3) : une place se libère
    good('multiply-2', 6);
    assert.strictEqual(progression.getMasteryLevel('multiply-2'), 3);
    assert.strictEqual(engine.inProgressSkills().length, 2);
    assert.ok(!engine.isWaiting('multiply-3'));
    // une compétence qui stagne au niveau 2 avec beaucoup de réponses ne bloque plus personne
    localStorage.clear();
    const { engine: e2, progression: p2 } = setup();
    for (let i = 0; i < 4; i++) { p2.recordAnswer('addition-simple', true, 2000); p2.recordAnswer('subtract-simple', true, 2000); p2.recordAnswer('multiply-2', true, 2000); }
    for (let i = 0; i < PROGRESS_CAP.relaxAfterSeen; i++) p2.recordAnswer('subtract-simple', true, 9000);   // juste mais lent : reste au niveau 2
    assert.strictEqual(p2.getMasteryLevel('subtract-simple'), 2);
    assert.ok(!e2.inProgressSkills().includes('subtract-simple'), 'ne compte plus après 30 réponses au niveau 2');
});

test('mode test : seuils réduits, tout débloqué, plafond levé, compétence imposée', () => {
    localStorage.clear();
    const { engine, progression } = setup();
    assert.ok(!Cheat.isOn() && !engine.isUnlocked('divide-9'));
    progression.recordAnswer('multiply-5', true, 9000); progression.recordAnswer('multiply-5', true, 9000);
    assert.strictEqual(progression.getMasteryLevel('multiply-5'), 1, 'seuils normaux : 2 réponses lentes ne suffisent pas');
    Cheat.set(true); progression.recomputeAll();
    assert.ok(Cheat.isOn() && engine.isUnlocked('divide-9') && !engine.isWaiting('sub-2digits'));
    assert.strictEqual(progression.getMasteryLevel('multiply-5'), 3, 'mode test : 2 bonnes réponses = maîtrisé, temps ignoré');
    progression.recordAnswer('divide-7', true, 9000);
    assert.strictEqual(progression.getMasteryLevel('divide-7'), 2, 'niveau 2 dès la première bonne réponse');
    const session = new Session(engine, progression);
    session.start({ skill: 'add-2digits' });
    assert.strictEqual(session.skill, 'add-2digits');
    Cheat.set(false); progression.recomputeAll();
    assert.ok(!engine.isUnlocked('divide-9'));
    assert.strictEqual(progression.getMasteryLevel('multiply-5'), 1, 'retour aux seuils normaux');
});

test('voie D : ×100, doubles, moitiés, dizaines/centaines/milliers ronds', () => {
    localStorage.clear();
    const { engine } = setup();
    const digitAt = (n, k) => Math.floor(n / 10 ** k) % 10;
    const check = {
        'multiply-100': (a, b, t) => b === 100 && a >= 2 && a <= 99 && t === a * 100,
        'double-100': (a, b, t) => b === 2 && a >= 6 && a <= 50 && t === 2 * a,
        'half-100': (a, b, t) => b === 2 && a % 2 === 0 && a >= 12 && a <= 100 && t === a / 2,
        'add-round': (a, b, t) => { const k = String(b).length - 1; return a >= 100 && a <= 9999 && b / 10 ** k >= 1 && b / 10 ** k <= 9 && k >= 1 && digitAt(a, k) + b / 10 ** k <= 9 && t === a + b && t <= 9999; },
        'sub-round': (a, b, t) => { const k = String(b).length - 1; return a >= 100 && b / 10 ** k >= 1 && digitAt(a, k) >= b / 10 ** k && t === a - b && String(t).length === String(a).length; }
    };
    for (const id of Object.keys(check)) {
        for (let n = 0; n < 300; n++) for (const ex of engine.generateSession(id)) {
            if (ex.skill !== id) continue;
            assert.ok(check[id](ex.operands[0], ex.operands[1], ex.total), `${id}: ${ex.operands}`);
            if (ex.type === 'missing') assert.strictEqual(ex.answer, (SKILLS[id].operation === '×' || SKILLS[id].operation === '÷') ? ex.operands[0] : ex.operands[1]);
            else assert.strictEqual(ex.answer, ex.total);
            if (ex.type !== 'numeric') assert.ok(ex.choices.length === 4 && new Set(ex.choices).size === 4 && ex.choices.includes(ex.answer), `${id} ${ex.question} ${ex.choices}`);
            assert.ok(ex.answer >= 0 && String(ex.answer).length <= 4, 'tient sur le pavé de 4 chiffres');
        }
    }
    // formulations et grands nombres avec espace fine
    const q = (id, t, a, b) => engine.buildExercise(id, t, a, b).question;
    assert.strictEqual(q('double-100', 'numeric', 35, 2), 'double de 35 = ?');
    assert.strictEqual(q('double-100', 'missing', 35, 2), 'double de ? = 70');
    assert.strictEqual(q('half-100', 'numeric', 70, 2), 'moitié de 70 = ?');
    assert.strictEqual(q('add-round', 'numeric', 3204, 70), '3 204 + 70 = ?');
    assert.strictEqual(q('multiply-100', 'missing', 37, 100), '? × 100 = 3 700');
    const ex = (skill, op, a, b, t) => engine.getExplanation({ skill, operation: op, operands: [a, b], total: t });
    assert.match(ex('multiply-100', '×', 37, 100, 3700), /deux zéros à 37, ça fait 3 700/);
    assert.match(ex('double-100', '×', 35, 2, 70), /double de 30 est 60, le double de 5 est 10, et 60 \+ 10 = 70/);
    assert.match(ex('add-round', '+', 3204, 70, 3274), /on ajoute 7 dizaines ; le chiffre des dizaines passe de 0 à 7 : 3 274/);
    assert.match(ex('sub-round', '−', 8756, 5000, 3756), /on enlève 5 milliers ; le chiffre des milliers passe de 8 à 3 : 3 756/);
    assert.strictEqual(fmtNum(999), '999'); assert.strictEqual(fmtNum(10000), '10 000');
    // déblocage
    const req = { 'multiply-100': 'multiply-10', 'double-100': 'multiply-2', 'half-100': 'double-100', 'add-round': 'tens-add', 'sub-round': 'tens-sub' };
    for (const [id, r] of Object.entries(req)) assert.strictEqual(SKILLS[id].requires.skill, r, id);
});
