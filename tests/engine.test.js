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

test('session: étoiles créditées une seule fois, chapitre 2 débloqué à 6', () => {
    const { engine, progression } = setup();
    progression.addStars(4);
    progression.advanceStory(4);   // v2 : l'histoire a sa propre avancée (+3 par session terminée)
    const s = new Session(engine, progression);
    s.start();
    for (const ex of s.exercises) { s.beginQuestion(); s.submitAnswer(ex.answer); s.next(); }
    assert.ok(s.isComplete());
    const sum = s.complete();
    assert.strictEqual(sum.correct, 5);
    assert.strictEqual(sum.starsEarned, 3);
    assert.strictEqual(progression.getTotalStars(), 7);
    assert.deepStrictEqual(sum.newChapters.map(c => c.id), ['vaisseau']);
    s.complete();
    assert.strictEqual(progression.getTotalStars(), 7, 'complete() doit être idempotent');
    assert.strictEqual(storage.get(storage.KEYS.SESSION_HISTORY).length, 1);
});

test('chapitres: 13 chapitres, seuils croissants, le premier est ouvert dès le départ', () => {
    assert.strictEqual(CHAPTERS.length, 13);
    assert.deepStrictEqual(CHAPTERS.map(c => c.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    assert.strictEqual(new Set(CHAPTERS.map(c => c.id)).size, 13, 'identifiants uniques');
    assert.strictEqual(CHAPTERS[0].unlockAt, 0);
    for (let i = 1; i < CHAPTERS.length; i++) assert.ok(CHAPTERS[i].unlockAt > CHAPTERS[i - 1].unlockAt, `seuil croissant au chapitre ${i + 1}`);
    for (const c of CHAPTERS) assert.ok(c.title && c.mission && c.emoji, `titre, mission et émoji au chapitre ${c.number}`);
});

test('chapitres: déblocage par seuil, plusieurs chapitres d\'un coup, fin de l\'histoire', () => {
    assert.deepStrictEqual(chaptersUnlockedAt(0).map(c => c.number), [1]);
    assert.deepStrictEqual(newChaptersBetween(5, 6).map(c => c.number), [2], 'le seuil est inclus');
    assert.deepStrictEqual(newChaptersBetween(6, 7), [], 'pas de nouveau chapitre sans franchir un seuil');
    assert.deepStrictEqual(newChaptersBetween(0, 0), [], 'le chapitre 1 est ouvert dès le départ, pas « nouveau »');
    assert.deepStrictEqual(newChaptersBetween(14, 30).map(c => c.number), [3, 4]);
    assert.strictEqual(nextChapter(0).number, 2);
    assert.strictEqual(nextChapter(6).number, 3);
    assert.strictEqual(nextChapter(225), null);
    assert.strictEqual(chaptersUnlockedAt(500).length, 13);
});

test('univers: chapitres ouverts visibles, chapitres fermés sans titre, dernier chapitre « en cours »', () => {
    const { progression } = setup();
    progression.addStars(16); progression.advanceStory(16);
    const html = new Universe(progression).render();
    assert.ok(html.includes('Les circuits'), 'le chapitre 3 est ouvert');
    assert.ok(!html.includes('La salle des machines'), 'le titre du chapitre 4 reste caché');
    assert.strictEqual((html.match(/sky-star locked/g) || []).length, 10);
    assert.strictEqual((html.match(/sky-star unlocked/g) || []).length, 3);
    assert.strictEqual((html.match(/aria-current="step"/g) || []).length, 1);
    assert.ok(html.includes('Encore 4 missions pour le chapitre 4'), '28 − 16 = 12 pas, soit 4 sessions');
    assert.ok(!/\d+ ⭐/.test(html.replace(/star-counter[\s\S]*?<\/div>/, '')), 'plus aucun seuil en étoiles sur la carte');
});

test('scènes: tous les chapitres complets, vignettes courtes, décors et personnages connus', () => {
    const ARTS = ['forest', 'clearing', 'ship', 'ship-lit', 'engine', 'engine-on', 'tanks', 'tanks-full', 'cockpit', 'cockpit-night', 'cockpit-chart', 'cockpit-lit', 'cockpit-radio', 'airlock', 'airlock-closed', 'porthole-earth', 'fuel', 'space-asteroids', 'space-beacon', 'space-beacon-on', 'space-home', 'earth-top', 'hill', 'hill-reply'];
    const MOODS = { fox: ['content', 'bravo', 'think', 'comfort', 'worried', 'moved'], rabbit: ['content', 'bravo', 'think', 'comfort', 'surprise'] };
    for (const c of CHAPTERS) {
        assert.ok(c.scene.length >= 5 && c.scene.length <= 8, `5 à 8 vignettes au chapitre ${c.number}`);
        assert.strictEqual(c.lines.length, 3, `3 lignes de la lapine au chapitre ${c.number}`);
        assert.ok(c.end, `message de fin au chapitre ${c.number}`);
        for (const v of c.scene) {
            assert.ok(ARTS.includes(v.art), `décor connu : ${v.art}`);
            assert.ok(v.cast.length >= 1);
            for (const m of v.cast) {
                assert.ok(['fox', 'rabbit'].includes(m.who) && ['left', 'right', 'center'].includes(m.at));
            }
            assert.ok(v.lines.length >= 1 && v.lines.length <= 2);
            let words = 0;
            for (const l of v.lines) {
                assert.ok(['narrator', 'fox', 'rabbit'].includes(l.who));
                if (l.who !== 'narrator') assert.ok(!l.mood || MOODS[l.who].includes(l.mood), `expression connue : ${l.who} ${l.mood}`);
                words += l.text.split(/\s+/).length;
            }
            assert.ok(words <= 50, `vignette trop longue au chapitre ${c.number} (${words} mots)`);
        }
    }
});

test('ambiances: chaque chapitre a une ambiance connue, applaudissements à la fin du chapitre 13', () => {
    for (const c of CHAPTERS) assert.ok(['nature', 'ship', 'space'].includes(c.ambience), `ambiance connue au chapitre ${c.number}`);
    assert.strictEqual(CHAPTERS[12].sfx, 'applause');
    for (const c of CHAPTERS) for (const v of c.scene || []) if (v.sfx) assert.ok(['airlock-close', 'launch', 'landing', 'asteroid-pass', 'beacon-ping', 'radio-signal', 'power-on', 'engine-start', 'tank-fill', 'flashlight-click'].includes(v.sfx), `son de vignette connu : ${v.sfx}`);
    assert.ok(CHAPTERS.slice(0, 12).every(c => !c.sfx), 'un seul son de fin, au dernier chapitre');
});

test('scènes: scène à lire = premier chapitre ouvert avec scène non lue', () => {
    assert.strictEqual(pendingScene(0, {}).id, 'lapine');
    assert.strictEqual(pendingScene(0, { lapine: true }), null, 'au départ, seul le chapitre 1 est ouvert');
    assert.strictEqual(pendingScene(7, { lapine: true }).id, 'vaisseau');
    assert.strictEqual(pendingScene(16, { lapine: true }).id, 'vaisseau', 'dans l\'ordre');
    assert.strictEqual(pendingScene(16, { lapine: true, vaisseau: true }).id, 'circuits');
    assert.strictEqual(pendingScene(500, Object.fromEntries(CHAPTERS.map(c => [c.id, true]))), null, 'les chapitres sans scène ne comptent pas');
    assert.strictEqual(pendingScene(0, undefined).id, 'lapine');
});

test('scènes: ligne de la lapine au hasard et message de fin selon les étoiles', () => {
    const c = CHAPTERS[0];
    assert.strictEqual(randomLine(c, () => 0), c.lines[0]);
    assert.strictEqual(randomLine(c, () => 0.999), c.lines[2]);
    assert.strictEqual(randomLine({ id: 'x' }), null, 'pas de ligne tant que le chapitre n\'est pas écrit');
    assert.strictEqual(currentChapter(14).number, 2);
    assert.strictEqual(currentChapter(15).number, 3);
    assert.ok(chapterEndLine(c, 3).includes('Parfait'));
    assert.ok(chapterEndLine(c, 2).includes('Bien joué'));
    assert.ok(chapterEndLine(c, 0).includes('Pas grave'));
    const c3 = CHAPTERS[2];
    assert.strictEqual(chapterEndLine(c3, 3), c3.end.some, 'sans variante « full », on retombe sur le message courant');
    assert.strictEqual(chapterEndLine(c3, 0), null, 'rien à dire sans étoile');
    assert.strictEqual(chapterEndLine({ id: 'x' }, 3), null);
});

test('progression: chapitres lus mémorisés, anciennes données sans ce champ, réinitialisation', () => {
    const { progression } = setup();
    assert.ok(!progression.hasSeenChapter('lapine'));
    progression.markChapterSeen('lapine');
    const again = new Progression(); again.load();
    assert.ok(again.hasSeenChapter('lapine') && !again.hasSeenChapter('vaisseau'));
    storage.set(storage.KEYS.PROGRESSION, { version: 1, skills: {}, totalStars: 3, discovered: {} });   // données d'avant l'histoire
    const old = new Progression(); old.load();
    assert.ok(!old.hasSeenChapter('lapine'));
    assert.strictEqual(old.getTotalStars(), 3);
    again.reset();
    assert.ok(!again.hasSeenChapter('lapine'));
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

test('série libre : mélange des compétences choisies, types variés, pas de doublon', () => {
    localStorage.clear();
    const { engine } = setup();
    for (let n = 0; n < 300; n++) {
        for (const length of [5, 10]) {
            const ex = engine.generateFree(['multiply-4', 'multiply-7'], length);
            assert.strictEqual(ex.length, length);
            assert.ok(ex.every(e => e.free && ['multiply-4', 'multiply-7'].includes(e.skill)));
            assert.strictEqual(new Set(ex.map(e => e.key)).size, length, 'pas de doublon');
            const c4 = ex.filter(e => e.skill === 'multiply-4').length, c7 = ex.filter(e => e.skill === 'multiply-7').length;
            assert.ok(Math.abs(c4 - c7) <= 1, 'répartition équilibrée');
            ex.forEach(e => assert.ok(e.type !== 'multiple' || e.choices.includes(e.answer)));
        }
    }
    // une seule compétence, ou des compétences « manquantes » (compléments) et des divisions
    assert.ok(engine.generateFree(['divide-3'], 5).every(e => e.skill === 'divide-3'));
    assert.ok(engine.generateFree(['complement-10', 'divide-9', 'add-round'], 10).every(e => e.type !== 'numeric' || e.skill !== 'complement-10'));
    assert.throws(() => engine.generateFree([], 5));
    assert.strictEqual(skillShort('multiply-4'), '×4'); assert.strictEqual(skillShort('divide-3'), '÷3'); assert.strictEqual(skillShort('add-units'), '47+8');
});

test('série libre : maîtrise par compétence, étoiles (≥ 80 %, 1 max, 2 séries/jour), historique', () => {
    localStorage.clear();
    const { engine, progression } = setup();
    const play = (skills, wrong = 0, length = 5) => {
        const s = new Session(engine, progression);
        s.start({ free: { skills, length } });
        s.exercises.forEach((ex, i) => { s.beginQuestion(); s.submitAnswer(i < wrong ? -1 : ex.answer); s.next(); });
        return s.complete();
    };
    let sum = play(['multiply-4', 'multiply-7']);
    assert.ok(sum.free && sum.correct === 5 && sum.starsEarned === 1 && sum.rewarded && sum.skills.length === 2);
    assert.ok(progression.getSkillStats('multiply-4') && progression.getSkillStats('multiply-7'), 'chaque compétence compte pour sa maîtrise');
    sum = play(['divide-3'], 2);
    assert.strictEqual(sum.starsEarned, 0, '3/5 : pas d\'étoile');
    assert.ok(sum.rewarded, 'la 2e série du jour est encore éligible (même sans étoile)');
    sum = play(['multiply-4']); assert.ok(!sum.rewarded && sum.starsEarned === 0, '3e série du jour : plus d\'étoile, même avec 5/5');
    assert.ok(sum.correct === 5);
    sum = play(['multiply-4', 'multiply-7'], 2, 10); assert.strictEqual(sum.starsEarned, 0);
    const h = storage.get(storage.KEYS.SESSION_HISTORY).filter(x => x.free);
    assert.ok(h.length === 4 && h[0].skills.join() === 'multiply-4,multiply-7' && h[0].answers.length === 5);
    assert.strictEqual(progression.getTotalStars(), 1);
    // abandon
    const s = new Session(engine, progression); s.start({ free: { skills: ['divide-9'], length: 5 } }); s.abandon();
    const last = storage.get(storage.KEYS.SESSION_HISTORY).slice(-1)[0];
    assert.ok(last.abandoned && last.free && last.skills[0] === 'divide-9');
});

test('export / import : aller-retour, fichier invalide ou trop récent sans effet', () => {
    const { progression } = setup();
    storage.set(storage.KEYS.PROGRESSION, { version: 1, skills: {}, totalStars: 7, discovered: {}, errors: {}, chaptersSeen: { c1: true } });
    storage.set(storage.KEYS.SESSION_HISTORY, [{ date: '2026-11-01' }]);
    storage.set(storage.KEYS.USER_PREFS, { sound: false, introSeen: true });
    const exported = JSON.parse(JSON.stringify(storage.exportData()));
    assert.strictEqual(exported.version, 2);
    storage.resetAll();
    assert.strictEqual(storage.get(storage.KEYS.PROGRESSION).totalStars, 0);
    assert.deepStrictEqual(storage.importData(exported), { ok: true });
    progression.load();
    assert.strictEqual(progression.getTotalStars(), 7);
    assert.ok(progression.data.chaptersSeen.c1);
    assert.strictEqual(storage.get(storage.KEYS.SESSION_HISTORY).length, 1);
    assert.strictEqual(storage.get(storage.KEYS.USER_PREFS).introSeen, true);
    // refus : rien n'est écrit
    assert.strictEqual(storage.importData({ app: 'autre', version: 1, progression: {} }).reason, 'format');
    assert.strictEqual(storage.importData({ app: 'mathpulse', version: 1, progression: [] }).reason, 'format');
    assert.strictEqual(storage.importData({ app: 'mathpulse', version: 3, progression: { totalStars: 99 } }).reason, 'version');
    assert.strictEqual(storage.get(storage.KEYS.PROGRESSION).totalStars, 7);
});

// ---------- v2 : missions ----------
test('missions : données valides (étapes typées, ids uniques, preuves et compétence connues, visuels existants côté Animations)', () => {
    const types = ['scene', 'problem', 'explore', 'explain', 'challenge', 'transfer'];
    for (const m of Object.values(MISSIONS)) {
        assert.ok(SKILLS[m.skill], `${m.id} : compétence inconnue`);
        const ids = m.steps.map(s => s.id);
        assert.strictEqual(new Set(ids).size, ids.length, `${m.id} : ids d'étapes en double`);
        m.steps.forEach(s => {
            assert.ok(types.includes(s.type), `${m.id}/${s.id} : type inconnu`);
            if (MISSION_ANSWER_STEPS.includes(s.type)) assert.ok(Array.isArray(s.operands) && s.operands.length === 2 && s.prompt);
            if (s.type === 'scene') assert.ok(s.vignettes.length && s.vignettes.every(v => v.art && v.lines.length));
            if (s.type === 'explain') assert.ok(s.title && s.text && s.formula);
            if (s.type === 'explore') { assert.ok(s.tool === 'ten-frame' && s.prompt && s.hint && s.done); new TenFrameModel(...s.operands); }
        });
        [...m.evidence.understood, ...m.evidence.reused].forEach(id => assert.ok(ids.includes(id), `${m.id} : preuve « ${id} » sans étape`));
        assert.ok(m.steps.findIndex(s => s.type === 'problem') < m.steps.findIndex(s => s.type === 'explain'), 'on découvre avant d\'expliquer');
    }
});

test('mission : parcours réussi du premier coup → comprise, sans aide, réemployée ; progression enregistrée', () => {
    const { progression } = setup();
    const run = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    assert.throws(() => run.answer(1), /n'attend pas/);          // scène : pas de réponse
    assert.ok(run.next());
    assert.ok(!run.canAdvance() && !run.next(), 'problème : il faut proposer une réponse');
    assert.deepStrictEqual({ ...run.answer('55') }, { correct: true, attempts: 1, done: true, feedback: 'ok', help: null });
    run.next(); run.explored(); run.next(); run.next();   // manipulation, explication
    assert.strictEqual(run.step.type, 'challenge');
    assert.ok(run.answer(43).correct); run.next();
    assert.ok(run.answer(64).correct); run.next();
    assert.ok(run.isComplete());
    const s = run.complete();
    assert.ok(s.discovered && s.understood && s.unaided && s.reused);
    assert.strictEqual(run.complete(), s, 'complete() est idempotent');
    const saved = JSON.parse(JSON.stringify(storage.get(storage.KEYS.PROGRESSION)));
    assert.deepStrictEqual(saved.missions['pass-ten-47-8'].runs, 1);
    assert.strictEqual(saved.mastery['add-units'].state, 'vu', 'une mission ne suffit pas à « comprendre » la compétence');
    assert.strictEqual(saved.mastery['add-units'].strategies['pass-through-ten'], 'compris');
});

test('mission : erreurs → jamais de blocage ; problème raté mène à l\'explication ; 3 essais puis on continue sans preuve', () => {
    const { progression } = setup();
    const run = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    run.next();
    let r = run.answer(54);
    assert.ok(!r.correct && r.done && r.feedback === 'explain', 'problème raté : on passe à l\'explication');
    assert.strictEqual(run.answer(55).correct, false, 'étape close : une nouvelle réponse ne change rien');
    run.next(); run.explored(); run.next(); run.next();
    assert.strictEqual(run.answer(42).feedback, 'retry');
    assert.ok(!run.canAdvance());
    assert.strictEqual(run.answer(44).feedback, 'hint');
    r = run.answer(43);
    assert.ok(r.correct && r.attempts === 3); run.next();
    assert.strictEqual(run.lastExplain().id, 'explain');
    run.answer(1); run.answer(2); r = run.answer(3);
    assert.ok(!r.correct && r.done && r.feedback === 'explain' && run.canAdvance());
    run.next();
    const s = run.complete();
    assert.ok(!s.discovered && s.understood && !s.unaided && !s.reused);
    assert.strictEqual(progression.getMastery('add-units').strategies['pass-through-ten'], 'compris');
    // une mission rejouée moins bien ne fait rien régresser
    const again = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    again.next(); again.answer(0); again.next(); again.explored(); again.next(); again.next();
    [1, 2, 3].forEach(v => again.answer(v)); again.next(); [1, 2, 3].forEach(v => again.answer(v)); again.next();
    assert.ok(!again.complete().understood);
    assert.strictEqual(progression.getMission('pass-ten-47-8').runs, 2);
    assert.ok(progression.getMission('pass-ten-47-8').understood);
    assert.strictEqual(progression.getMastery('add-units').strategies['pass-through-ten'], 'compris');
});

test('données v2 : migration depuis v1 sans perte, maîtrise de départ prudente, import d\'un fichier v1', () => {
    const v1 = { version: 1, totalStars: 12, discovered: { 'multiply-2': true }, errors: {}, chaptersSeen: { lapine: true },
        skills: { 'multiply-2': { seen: 30, correct: 30, mastery_level: 3, recent: [] }, 'addition-simple': { seen: 4, correct: 2, mastery_level: 1, recent: [] } } };
    storage.set(storage.KEYS.PROGRESSION, v1);
    const p = new Progression(); p.load();
    assert.strictEqual(p.data.version, 2);
    assert.strictEqual(p.getTotalStars(), 12);
    assert.ok(p.data.chaptersSeen.lapine && p.data.discovered['multiply-2'] && p.getSkillStats('multiply-2'));
    assert.deepStrictEqual(JSON.parse(JSON.stringify(p.data.missions)), {});
    assert.strictEqual(p.data.reviews.length, 2, 'un premier rappel par compétence déjà pratiquée');
    assert.strictEqual(p.getMastery('multiply-2').state, 'compris', 'niveau 3 en v1 → « compris », jamais « durable »');
    assert.strictEqual(p.getMastery('addition-simple').state, 'vu');
    // un fichier exporté en v1 s'importe toujours
    storage.resetAll();
    assert.ok(storage.importData({ app: 'mathpulse', version: 1, progression: v1, history: [] }).ok);
    const q = new Progression(); q.load();
    assert.strictEqual(q.getTotalStars(), 12);
    assert.strictEqual(q.getMastery('multiply-2').state, 'compris');
});

test('joueur : prénom nettoyé, demandé une fois, {nom} remplacé dans les textes (« renard » par défaut), Andrea nommée', () => {
    storage.init();
    assert.ok(!Player.asked());
    assert.strictEqual(Player.text('Merci, {nom}.'), 'Merci, renard.');
    assert.strictEqual(Player.label('fox'), 'Le renard');
    assert.strictEqual(Player.label('rabbit'), HARE_NAME);
    assert.strictEqual(Player.text('Bravo ! {hase} est contente.'), `Bravo ! ${HARE_NAME} est contente.`);
    assert.strictEqual(Player.set('  <img src=x onerror=1> Léo-Paul 42  '), 'img srcx onerr');
    assert.strictEqual(Player.set("Zoé d'Arc"), "Zoé d'Arc");
    assert.ok(Player.asked());
    assert.strictEqual(Player.text('Merci, {nom}. Tu sais, {nom} ?'), "Merci, Zoé d'Arc. Tu sais, Zoé d'Arc ?");
    assert.strictEqual(Player.label('fox'), "Zoé d'Arc");
    storage.set(storage.KEYS.USER_PREFS, { playerName: '<script>x</script>', nameAsked: true });
    assert.strictEqual(Player.name(), 'scriptxscript', 'un prénom importé est nettoyé à la lecture');
    Player.set('');
    assert.ok(Player.asked() && Player.name() === '' && Player.text('{nom}') === 'renard');
    // l'histoire s'adresse au joueur par {nom}, jamais par « renard » en apostrophe
    const all = JSON.stringify(CHAPTERS);
    assert.ok(all.includes('{nom}') && !/, renard[.,]/.test(all));
    assert.ok(!/lapine de|la lapine/i.test(all.replace(/"id":"lapine"/g, '')));
    // le nom de la hase n'est écrit qu'à un seul endroit (HARE_NAME) : partout ailleurs {hase}, sans élision devant
    const texts = all + JSON.stringify(MISSIONS);
    assert.ok(texts.includes('{hase}') && !texts.includes(HARE_NAME));
    assert.ok(!/(\bde|\bque|\bd'|\bqu') ?\{hase\}/i.test(texts), 'pas de « de {hase} » : l\'élision dépend du nom');
    assert.ok(!/[🐰🦊]/u.test(JSON.stringify(CHAPTERS.map(c => [c.scene, c.lines, c.end]))), 'plus d\'émoji à la place des personnages dans les textes');
    // le renard est le joueur : dans les scènes, il ne donne jamais la réponse à un calcul
    for (const c of CHAPTERS) for (const v of c.scene) for (const l of v.lines) if (l.who === 'fox') assert.ok(!/\d/.test(l.text), `chapitre ${c.number} : le renard ne répond pas aux calculs (« ${l.text} »)`);
});

// ---------- v2 : diagnostic des erreurs ----------
test('diagnostic : chaque erreur typique est reconnue (additions et soustractions), une bonne réponse ou une erreur inconnue ne l\'est pas', () => {
    const id = (op, a, b, r) => { const e = Diagnosis.find(op, a, b, r); return e ? e.id : null; };
    assert.strictEqual(id('+', 47, 8, 415), 'add-concat');
    assert.strictEqual(id('+', 47, 8, 45), 'add-forgot-carry');
    assert.strictEqual(id('+', 47, 8, 5), 'add-units-only');
    assert.strictEqual(id('+', 47, 8, 39), 'op-subtracted');
    assert.strictEqual(id('+', 47, 8, 54), 'off-by-one');
    assert.strictEqual(id('+', 47, 8, 56), 'off-by-one');
    assert.strictEqual(id('+', 47, 8, 65), 'off-by-ten');
    assert.strictEqual(id('+', 42, 5, 37), 'op-subtracted', 'sans passage de dizaine, 37 n\'est pas une retenue oubliée');
    assert.strictEqual(id('+', 47, 8, 55), null);
    assert.strictEqual(id('+', 47, 8, 12), null);
    assert.strictEqual(id('+', 47, 8, NaN), null);
    assert.strictEqual(id('−', 52, 7, 55), 'sub-swapped');
    assert.strictEqual(id('−', 52, 7, 59), 'op-added');
    assert.strictEqual(id('−', 52, 7, 44), 'off-by-one');
    assert.strictEqual(id('−', 52, 7, 35), 'off-by-ten');
    assert.strictEqual(id('−', 54, 8, 56), 'sub-forgot-borrow');
    assert.strictEqual(id('−', 52, 7, 45), null);
});

test('diagnostic : aucune piste ni image ne donne la réponse (tous les calculs à dizaine franchie, toutes les erreurs du catalogue)', () => {
    const shows = (fb, total) => new RegExp(`(^|\\D)${total}(\\D|$)`).test(`${fb.text} ${fb.tip || ''}`) || (fb.visual && fb.visual.fn === 'jumps' && fb.visual.args[0].includes(total));
    const cases = [];
    for (let a = 11; a <= 99; a++) for (let b = 2; b <= 9; b++) cases.push(['+', a, b], ['−', a, b]);
    for (let a = 1; a <= 10; a++) for (let b = 2; b <= 10; b++) cases.push(['×', a, b], ['÷', a * b, b]);
    for (const a of [7, 12, 37, 50]) cases.push(['×', a, 100], ['÷', a * 100, 100], ['×', a, 2], ['÷', a * 2, 2]);
    for (const [op, a, b] of cases) {
        const total = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b;
        if (total < 1 || total === a || total === b) continue;   // résultat égal à un nombre de l'énoncé : le citer ne révèle rien
        for (const r of [...Array(1000).keys(), a * b, total * 10, total * 100]) {
            if (r === total || !Diagnosis.find(op, a, b, r)) continue;
            for (const n of [1, 2]) assert.ok(!shows(Diagnosis.feedback(op, a, b, r, n), total), `${a} ${op} ${b} : réponse ${r}, essai ${n}`);
        }
    }
});

test('diagnostic : retour gradué (question, puis image du chemin sans résultat), erreurs enregistrées par compétence', () => {
    const { progression } = setup();
    let fb = Diagnosis.feedback('+', 47, 8, 45, 1);
    assert.ok(fb.error === 'add-forgot-carry' && fb.level === 'question' && fb.visual === null && fb.text.includes('50'));
    fb = Diagnosis.feedback('+', 47, 8, 45, 2);
    assert.ok(fb.level === 'visual' && fb.visual.fn === 'jumps');
    assert.strictEqual(JSON.stringify(fb.visual.args), JSON.stringify([[47, 50, '?'], ['+3', '+5']]));
    fb = Diagnosis.feedback('+', 47, 8, 12, 1);
    assert.ok(fb.error === null && fb.text === 'Presque ! Essaie encore.');
    fb = Diagnosis.feedback('+', 47, 8, 12, 2);
    assert.ok(fb.visual && fb.text === 'Regarde l\'image, et essaie encore.', 'erreur inconnue au 2e essai : on montre quand même le chemin');
    assert.strictEqual(Diagnosis.feedback('+', 42, 5, 37, 2).visual, null, 'pas de frise quand on ne franchit pas la dizaine');
    // dans une mission : la piste suit la réponse, les types d'erreurs sont comptés
    const run = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    run.next();
    assert.strictEqual(run.answer(45).help.error, 'add-forgot-carry');        // problème : 47 + 8
    run.next(); run.explored(); run.next(); run.next();
    let r = run.answer(33);                                                    // défi : 36 + 7
    assert.ok(r.feedback === 'retry' && r.help.error === 'add-forgot-carry' && r.help.level === 'question');
    r = run.answer(42);
    assert.ok(r.feedback === 'hint' && r.help.error === 'off-by-one' && r.help.level === 'visual' && r.help.visual);
    run.answer(43); run.next(); run.answer(64); run.next();
    assert.deepStrictEqual([...run.complete().errors], ['add-forgot-carry', 'add-forgot-carry', 'off-by-one']);
    assert.strictEqual(progression.getErrorTypes('add-units')['add-forgot-carry'], 2);
    assert.strictEqual(progression.getErrorTypes('add-units')['off-by-one'], 1);
    assert.deepStrictEqual(Object.keys(progression.getErrorTypes('multiply-2')), []);
});

// ---------- v2 : maîtrise durable et rappels espacés ----------
test('maîtrise : vu → compris demande des réussites sans aide dans 2 formes ; une aide ou une erreur ne compte pas, rien ne régresse', () => {
    const { progression } = setup();
    const T = Date.UTC(2026, 10, 17), ex = (type) => ({ skill: 'multiply-3', type });
    assert.strictEqual(progression.recordEvidence(ex('numeric'), true, { context: 'session' }, T), 'vu');
    assert.strictEqual(progression.recordEvidence(ex('numeric'), true, { context: 'session' }, T), 'vu', 'une seule forme ne suffit pas');
    assert.strictEqual(progression.recordEvidence(ex('missing'), true, { aided: true, context: 'session' }, T), 'vu', 'réussite aidée : pas une preuve');
    assert.strictEqual(progression.recordEvidence(ex('missing'), false, { context: 'session' }, T), 'vu');
    assert.strictEqual(progression.recordEvidence(ex('missing'), true, { context: 'session' }, T), 'vu');
    assert.strictEqual(progression.recordEvidence(ex('missing'), true, { context: 'session' }, T), 'compris');
    for (let i = 0; i < 5; i++) progression.recordEvidence(ex('numeric'), false, { context: 'session' }, T + i);
    assert.strictEqual(progression.getMastery('multiply-3').state, 'compris', 'des erreurs ne font pas redescendre');
    assert.strictEqual(JSON.parse(JSON.stringify(storage.get(storage.KEYS.PROGRESSION))).mastery['multiply-3'].state, 'compris', 'enregistré');
});

test('rappels espacés : cases 1, 3, 7, 14, 30 j ; réussite = case suivante, échec = retour plus rapide, aide = rien ne bouge', () => {
    const { progression } = setup();
    const T = Date.UTC(2026, 10, 17), D = 24 * 3600 * 1000, ex = { skill: 'multiply-3', type: 'numeric' };
    const days = () => Math.round((progression.getReview('multiply-3').dueAt - progression.getReview('multiply-3').setAt) / D);
    progression.recordEvidence(ex, true, {}, T);
    assert.strictEqual(days(), 1);
    assert.deepStrictEqual([...progression.dueSkills(T)], []);
    progression.recordEvidence(ex, true, {}, T + 3600e3);
    assert.strictEqual(progression.getReview('multiply-3').box, 0, 'rappel pas encore dû : la case ne bouge pas');
    assert.deepStrictEqual([...progression.dueSkills(T + D)], ['multiply-3']);
    let t = T + D;
    progression.recordEvidence(ex, true, { aided: true }, t);
    assert.ok(progression.getReview('multiply-3').box === 0 && progression.dueSkills(t).length === 1, 'réussi avec aide : le rappel reste dû');
    const seq = [];
    for (let i = 0; i < 5; i++) { progression.recordEvidence(ex, true, {}, t); seq.push(days()); t = progression.getReview('multiply-3').dueAt; }
    assert.deepStrictEqual(seq, [3, 7, 14, 30, 30]);
    progression.recordEvidence(ex, false, {}, t);
    assert.strictEqual(days(), 14, 'échec : une case en arrière');
    progression.recordEvidence(ex, false, {}, t + D);
    assert.strictEqual(days(), 14, 'une erreur avant l\'échéance ne repousse ni n\'avance rien');
    // la plus en retard d'abord
    progression.recordEvidence({ skill: 'multiply-4', type: 'numeric' }, true, {}, T);
    assert.deepStrictEqual([...progression.dueSkills(t + 30 * D)], ['multiply-4', 'multiply-3']);
});

test('maîtrise : durable = compris + 2 contextes de réemploi + un rappel réussi après ≥ 3 j et un autre après ≥ 14 j (jamais plus tôt)', () => {
    const { progression } = setup();
    const T = Date.UTC(2026, 10, 17), D = 24 * 3600 * 1000;
    const ans = (type, context, t) => progression.recordEvidence({ skill: 'add-units', type }, true, { context }, t);
    ans('numeric', 'session', T); ans('numeric', 'session', T); ans('missing', 'session', T);
    assert.strictEqual(ans('missing', 'recall', T), 'compris');
    assert.strictEqual(ans('numeric', 'rapid', T + D), 'compris', '2 contextes, mais rappel après 1 j seulement');       // case 0 → 1
    assert.strictEqual(ans('missing', 'recall', T + 4 * D), 'compris', 'rappel après 3 j : il manque celui de 14 j');      // case 1 → 2
    assert.strictEqual(ans('numeric', 'recall', T + 11 * D), 'compris', 'rappel après 7 j : toujours pas 14 j');           // case 2 → 3
    assert.strictEqual(ans('numeric', 'recall', T + 25 * D), 'durable');                                                    // 14 j
    assert.deepStrictEqual([...progression.getMastery('add-units').gaps], [1, 3, 7, 14]);
    // sans réemploi (toujours dans sa propre session), même avec les rappels : pas durable
    [0, 0, 0, 0, 1, 4, 11, 25].forEach((d, i) => progression.recordEvidence({ skill: 'multiply-6', type: i % 2 ? 'numeric' : 'missing' }, true, { context: 'session' }, T + d * D));
    assert.strictEqual(progression.getMastery('multiply-6').state, 'compris');
    // une mission apporte une forme (défi du premier coup) et un contexte (réemploi)
    progression.recordMission({ mission: 'm1', skill: 'multiply-6', strategy: 's', understood: true, unaided: true, reused: true, at: '', errors: [] }, T + 25 * D);
    progression.recordEvidence({ skill: 'multiply-6', type: 'numeric' }, true, { context: 'free' }, T + 25 * D);
    assert.strictEqual(progression.getMastery('multiply-6').state, 'durable');
});

test('rappels dans les sessions : une compétence à échéance passe devant dans les rappels ; la session enregistre forme, contexte et rappel', () => {
    const { progression, engine } = setup();
    const now = Date.now(), D = 24 * 3600 * 1000;
    ['multiply-2', 'multiply-5', 'multiply-10'].forEach(id => { for (let i = 0; i < 6; i++) progression.recordAnswer(id, true, 1000); });
    progression.recordEvidence({ skill: 'multiply-10', type: 'numeric' }, true, {}, now - 2 * D);   // rappel dû depuis hier
    progression.recordEvidence({ skill: 'multiply-2', type: 'numeric' }, true, {}, now);
    for (let n = 0; n < 30; n++) {
        const recalls = engine.pickRecalls('addition-simple');
        assert.strictEqual(recalls[0].skill, 'multiply-10', 'la compétence à échéance est rappelée en premier');
        assert.ok(SKILLS['multiply-10'].plan.includes(recalls[0].type));
    }
    const s = new Session(engine, progression); s.start({ skill: 'addition-simple' });
    s.exercises.forEach(ex => { s.beginQuestion(); s.submitAnswer(ex.answer); s.next(); });
    s.complete();
    assert.ok(progression.getReview('multiply-10').dueAt > now, 'rappel fait pendant la session : reprogrammé');
    assert.strictEqual(progression.getReview('multiply-10').box, 1);
    assert.ok(progression.getMastery('multiply-10').contexts.recall, 'réemploi hors de sa propre session');
    assert.ok(!progression.getMastery('addition-simple').contexts.session, 'sa propre session n\'est pas un réemploi');
});

test('migration v1 : premiers rappels étalés selon le niveau (1, 3, 7 j)', () => {
    storage.set(storage.KEYS.PROGRESSION, { version: 1, totalStars: 0, skills: {
        a: { seen: 3, mastery_level: 1, recent: [] }, b: { seen: 9, mastery_level: 2, recent: [] }, c: { seen: 30, mastery_level: 3, recent: [] } } });
    const p = new Progression(); p.load();
    const d = id => Math.round((p.getReview(id).dueAt - p.getReview(id).setAt) / (24 * 3600 * 1000));
    assert.deepStrictEqual([d('a'), d('b'), d('c')], [1, 3, 7]);
    p.save(); const q = new Progression(); q.load();
    assert.strictEqual(q.data.reviews.length, 3, 'pas de doublon au rechargement');
});

// ---------- v2 : l'histoire ne dépend plus du score ----------
test('histoire découplée : tout faux, l\'histoire avance quand même ; les étoiles ne débloquent plus rien ; migration sans recul', () => {
    const { engine, progression } = setup();
    const play = (ok, opts) => {
        const s = new Session(engine, progression); s.start(opts);
        s.exercises.forEach(ex => { s.beginQuestion(); s.submitAnswer(ok ? ex.answer : -1); s.next(); });
        return s.complete();
    };
    let sum = play(false);
    assert.ok(sum.starsEarned === 0 && sum.storyGain === 3 && sum.storyPoints === 3 && sum.newChapters.length === 0);
    sum = play(false);
    assert.strictEqual(progression.getTotalStars(), 0);
    assert.deepStrictEqual(sum.newChapters.map(c => c.id), ['vaisseau'], '2 sessions terminées, 0 étoile : le chapitre 2 s\'ouvre');
    assert.strictEqual(pendingScene(progression.getStoryPoints(), { lapine: true }).id, 'vaisseau');
    progression.addStars(500);
    assert.strictEqual(progression.getStoryPoints(), 6, 'des étoiles en plus n\'ouvrent aucun chapitre');
    // une session abandonnée ne fait pas avancer
    const ab = new Session(engine, progression); ab.start(); ab.abandon();
    assert.strictEqual(progression.getStoryPoints(), 6);
    // série libre : +1 tant qu'elle est « récompensable » (2 par jour), même ratée
    sum = play(false, { free: { skills: ['multiply-2'], length: 5 } });
    assert.ok(sum.storyGain === 1 && sum.starsEarned === 0);
    play(false, { free: { skills: ['multiply-2'], length: 5 } });
    assert.strictEqual(play(true, { free: { skills: ['multiply-2'], length: 5 } }).storyGain, 0, '3e série du jour');
    // une mission terminée fait avancer l'histoire
    const before = progression.getStoryPoints();
    const run = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    run.next(); run.answer(0); run.next(); run.explored(); run.next(); run.next(); [1, 2, 3].forEach(v => run.answer(v)); run.next(); [1, 2, 3].forEach(v => run.answer(v)); run.next();
    run.complete();
    assert.strictEqual(progression.getStoryPoints(), before + STORY.mission);
    const replay = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    replay.next(); replay.answer(55); replay.next(); replay.explored(); replay.next(); replay.next(); replay.answer(43); replay.next(); replay.answer(64); replay.next(); replay.complete();
    assert.strictEqual(progression.getStoryPoints(), before + STORY.mission, 'rejouer une mission ne fait pas avancer l\'histoire une 2e fois');
    // migration : l'avancée reprend le total d'étoiles (v1, ou v2 d'avant le découplage)
    storage.set(storage.KEYS.PROGRESSION, { version: 1, totalStars: 40, skills: {} });
    const p = new Progression(); p.load();
    assert.strictEqual(p.getStoryPoints(), 40);
    assert.strictEqual(currentChapter(p.getStoryPoints()).id, currentChapter(40).id);
    p.addStars(9); p.save(); const q = new Progression(); q.load();
    assert.ok(q.getStoryPoints() === 40 && q.getTotalStars() === 49, 'une fois migrée, l\'avancée ne suit plus les étoiles');
});

// ---------- v2 : manipulation (boîte de 10) ----------
test('boîte de 10 : toucher un objet le met dans la boîte ; pleine à 10 ; on peut défaire ; jamais plus de 10', () => {
    const m = new TenFrameModel(47, 8);
    assert.ok(m.tens === 4 && m.inFrame === 7 && m.loose === 8 && !m.full);
    assert.strictEqual(m.takeBack(), 'nothing', 'rien à reprendre au départ (les 7 de départ restent)');
    assert.strictEqual(m.add(), 'placed');
    assert.strictEqual(m.add(), 'placed');
    assert.strictEqual(m.takeBack(), 'back');
    assert.ok(m.inFrame === 8 && m.loose === 7);
    m.add();
    assert.strictEqual(m.add(), 'complete');
    assert.ok(m.full && m.inFrame === 10 && m.loose === 5 && m.tens * 10 + m.inFrame + m.loose === 55, 'rien ne se perd : 40 + 10 + 5');
    assert.strictEqual(m.add(), 'full', 'boîte pleine : les objets restants ne bougent plus');
    assert.ok(m.inFrame === 10 && m.loose === 5);
    assert.strictEqual(m.moves, 5);
    const exact = new TenFrameModel(36, 4); for (let i = 0; i < 4; i++) exact.add();
    assert.ok(exact.full && exact.loose === 0 && exact.add() === 'empty');
    assert.throws(() => new TenFrameModel(42, 5), /ne franchit pas/);
    assert.throws(() => new TenFrameModel(40, 8), /ne franchit pas/);
});

test('mission : la manipulation bloque tant que le but n\'est pas atteint ; elle vient après le problème et avant l\'explication', () => {
    const { progression } = setup();
    const m = MISSIONS['pass-ten-47-8'], order = m.steps.map(s => s.type);
    assert.ok(order.indexOf('problem') < order.indexOf('explore') && order.indexOf('explore') < order.indexOf('explain'));
    const run = new MissionRun(m, progression);
    run.next(); run.answer(1); run.next();
    assert.strictEqual(run.step.type, 'explore');
    assert.ok(!run.canAdvance() && !run.next());
    assert.throws(() => run.answer(55), /n'attend pas/);
    const r = run.explored({ moves: 3, hinted: true });
    assert.ok(r.done && r.moves === 3 && r.hinted && run.canAdvance() && run.next());
    assert.strictEqual(run.step.type, 'explain');
    assert.throws(() => run.explored(), /pas une manipulation/);
    assert.strictEqual(missionForSkill('add-units').id, 'pass-ten-47-8');
    assert.strictEqual(missionForSkill('multiply-2'), null);
});

// ---------- v2 : carnet de découvertes ----------
test('carnet : vide au départ ; notions, astuces, idées de science et missions s\'y écrivent au fil du jeu, sans score', () => {
    const { progression } = setup();
    let n = Notebook.data(progression);
    assert.ok(n.empty && !n.strategies.length && !n.paths.length && !n.science.length && !n.missions.length);
    // une notion présentée, une autre pratiquée
    progression.markDiscovery('multiply-2');
    progression.recordAnswer('addition-simple', true, 1000);
    n = Notebook.data(progression);
    assert.ok(!n.empty);
    assert.deepStrictEqual(n.paths.map(p => p.id), ['calc', 'tables']);
    assert.deepStrictEqual(n.paths[0].skills.map(k => [k.id, k.state]), [['addition-simple', 'vu']]);
    assert.strictEqual(n.paths[1].total, 10);
    // un chapitre lu apporte son idée de science
    progression.markChapterSeen('lapine'); progression.markChapterSeen('vaisseau');
    n = Notebook.data(progression);
    assert.deepStrictEqual(n.science.map(c => c.number), [1, 2]);
    assert.ok(n.science[1].idea.includes('étoile filante'));
    // une mission jouée apporte une astuce (avec sa formule) et se retrouve dans « mes missions »
    const run = new MissionRun(MISSIONS['pass-ten-47-8'], progression);
    run.next(); run.answer(55); run.next(); run.explored(); run.next(); run.next(); run.answer(43); run.next(); run.answer(64); run.next(); run.complete();
    n = Notebook.data(progression);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(n.strategies)), [{ id: 'pass-through-ten', name: 'Passer par la dizaine', mission: 'pass-ten-47-8', state: 'compris', formula: '47 + 3 + 5 = 55' }]);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(n.missions)), [{ id: 'pass-ten-47-8', title: 'Le plein du réservoir', runs: 1 }]);
    assert.ok(n.paths[0].skills.some(k => k.id === 'add-units'), 'la notion vue en mission est dans le carnet');
    // l'état suit la maîtrise durable
    for (let i = 0; i < 2; i++) ['numeric', 'missing'].forEach(type => progression.recordEvidence({ skill: 'addition-simple', type }, true, { context: 'session' }));
    assert.strictEqual(Notebook.data(progression).paths[0].skills.find(k => k.id === 'addition-simple').state, 'compris');
    assert.ok(!/\d+ ?%|⭐/.test(JSON.stringify(Notebook.data(progression))), 'ni pourcentage ni étoiles dans le carnet');
});

test('chapitres : chacun a son idée de science, courte ; chaque stratégie de mission a un nom', () => {
    for (const c of CHAPTERS) assert.ok(c.idea && c.idea.split(/\s+/).length <= 18, `idée de science du chapitre ${c.number}`);
    for (const m of Object.values(MISSIONS)) assert.ok(STRATEGIES[m.strategy] && STRATEGIES[m.strategy].name, `nom de la stratégie de ${m.id}`);
});

test('diagnostic × et ÷ : erreurs typiques reconnues, image ou conseil de méthode au 2e essai', () => {
    const id = (op, a, b, r) => { const e = Diagnosis.find(op, a, b, r); return e ? e.id : null; };
    assert.strictEqual(id('×', 6, 7, 13), 'op-added');
    assert.strictEqual(id('×', 6, 7, 24), 'mul-reversed');
    assert.strictEqual(id('×', 6, 7, 35), 'mul-one-group-off');
    assert.strictEqual(id('×', 6, 7, 49), 'mul-one-group-off');
    assert.strictEqual(id('×', 6, 7, 36), 'mul-wrong-table');
    assert.strictEqual(id('×', 6, 7, 48), 'mul-wrong-table');
    assert.strictEqual(id('×', 6, 7, 56), 'mul-same-table');
    assert.strictEqual(id('×', 6, 7, 41), 'off-by-one');
    assert.strictEqual(id('×', 6, 7, 42), null);
    assert.strictEqual(id('×', 6, 7, 40), null);
    assert.strictEqual(id('×', 37, 100, 370), 'mul-zeros');
    assert.strictEqual(id('×', 37, 100, 37), 'mul-zeros');
    assert.strictEqual(id('×', 4, 10, 4), 'mul-zeros');
    assert.strictEqual(id('×', 3, 3, 9), null, 'un palindrome ou un carré juste n\'est pas une erreur');
    assert.strictEqual(id('÷', 42, 7, 294), 'op-multiplied');
    assert.strictEqual(id('÷', 42, 7, 35), 'op-subtracted');
    assert.strictEqual(id('÷', 42, 7, 7), 'div-gave-divisor');
    assert.strictEqual(id('÷', 42, 7, 5), 'div-one-group-off');
    assert.strictEqual(id('÷', 300, 10, 300), 'div-zeros');
    assert.strictEqual(id('÷', 300, 10, 3), 'div-zeros');
    assert.strictEqual(id('÷', 42, 7, 6), null);
    assert.strictEqual(id('÷', 42, 7, 9), null);
    // 2e essai : des paquets à compter pour les petites tables, sinon un conseil de méthode
    let fb = Diagnosis.feedback('×', 6, 4, 10, 2);
    assert.ok(fb.error === 'op-added' && fb.visual.fn === 'groups' && fb.visual.args[0] === 6 && fb.visual.args[1] === 4 && fb.tip === null);
    fb = Diagnosis.feedback('×', 6, 7, 13, 2);
    assert.ok(fb.visual === null && fb.tip === 'Compte de 7 en 7, 6 fois.');
    assert.strictEqual(Diagnosis.feedback('×', 6, 7, 13, 1).tip, null, 'pas de conseil au 1er essai');
    assert.strictEqual(Diagnosis.feedback('÷', 42, 7, 35, 2).tip, "Compte de 7 en 7 jusqu'à 42 : combien de pas ?");
    assert.strictEqual(Diagnosis.feedback('×', 37, 100, 370, 2).tip, null);
    assert.ok(Diagnosis.feedback('÷', 42, 7, 9, 1).text === 'Presque ! Essaie encore.');
});

// ---------- v2 : deuxième essai en session ----------
test('session : première erreur → piste adaptée et deuxième essai ; seule la première réponse compte', () => {
    const { engine, progression } = setup();
    const s = new Session(engine, progression); s.start({ skill: 'add-units' });
    s.exercises = [engine.buildExercise('add-units', 'numeric', 47, 8), engine.buildExercise('add-units', 'missing', 47, 8),
        engine.buildExercise('multiply-7', 'numeric', 6, 7), engine.buildExercise('double-100', 'numeric', 37, 2), engine.buildExercise('add-units', 'numeric', 36, 7)];
    // 1. dizaine oubliée, puis trouvé au 2e essai
    s.beginQuestion();
    let r = s.submitAnswer('45');
    assert.ok(!r.correct && r.help.error === 'add-forgot-carry' && r.help.text.includes('50'));
    assert.ok(!r.help.text.includes('55'), 'la piste ne donne pas la réponse');
    assert.ok(s.retryAnswer('55').correct);
    assert.throws(() => s.retryAnswer('55'), /deuxième essai/, 'un seul deuxième essai');
    s.next();
    // 2. « 47 + ? = 55 » : piste générale (le diagnostic de 47 + 8 n'aurait pas de sens ici)
    s.beginQuestion(); r = s.submitAnswer('7');
    assert.ok(r.help.error === null && r.help.text.includes('Remplace le ?'));
    assert.ok(!s.retryAnswer('9').correct); s.next();
    // 3. table d'à côté (×) ; 4. question formulée autrement : piste générale
    s.beginQuestion(); assert.strictEqual(s.submitAnswer('48').help.error, 'mul-wrong-table'); s.next();
    s.beginQuestion(); r = s.submitAnswer('39'); assert.ok(r.help.error === null && r.help.text === 'Presque ! Essaie encore.'); s.next();
    s.beginQuestion(); assert.strictEqual(s.submitAnswer('43').help, null, 'bonne réponse : pas de piste'); s.next();
    const sum = s.complete();
    assert.strictEqual(sum.correct, 1, 'le 2e essai réussi ne compte pas comme une bonne réponse');
    assert.strictEqual(sum.starsEarned, starsForScore(1));
    assert.strictEqual(progression.getSkillStats('add-units').seen, 3, 'une seule réponse comptée par question pour la maîtrise');
    assert.strictEqual(progression.getSkillStats('add-units').correct, 1);
    assert.ok(progression.getPendingErrors().some(e => e.operands[0] === 47 && e.operands[1] === 8), 'le calcul raté reste à revoir, même trouvé au 2e essai');
    assert.deepStrictEqual(JSON.parse(JSON.stringify(progression.getErrorTypes('add-units'))), { 'add-forgot-carry': 1 });
    assert.strictEqual(progression.getErrorTypes('multiply-7')['mul-wrong-table'], 1);
    const h = storage.get(storage.KEYS.SESSION_HISTORY).slice(-1)[0];
    assert.ok(h.answers[0].second_ok === true && h.answers[1].second_ok === false && !('second_ok' in h.answers[4]));
});

test('série rapide : pas de piste ni de deuxième essai', () => {
    const { engine, progression } = setup();
    for (let i = 0; i < 6; i++) progression.recordAnswer('multiply-2', true, 1000);
    const s = new Session(engine, progression); s.start({ rapid: true });
    s.beginQuestion();
    const r = s.submitAnswer('99999');
    assert.ok(!r.correct && r.help === null);
    assert.throws(() => s.retryAnswer('1'), /deuxième essai/);
});
