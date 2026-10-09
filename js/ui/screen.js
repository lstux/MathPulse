// MathPulse - Gestionnaire d'écrans : home, universe, discovery, game, result, parent

// Intro animée : durée de l'animation, puis délai avant le passage automatique à l'accueil
const INTRO_DURATION_MS = 7200;
const INTRO_AUTO_SKIP_MS = 5000;

class ScreenManager {
    constructor(appContainer, engine, progression) {
        this.appContainer = appContainer;
        this.engine = engine;
        this.progression = progression;
        this.session = null;
        this.currentScreen = null;
        this.timers = [];
    }

    // setTimeout rattaché à l'écran courant : annulé automatiquement quand on change d'écran
    later(fn, ms) {
        this.timers.push(setTimeout(fn, ms));
    }

    show(name, data = {}) {
        this.timers.forEach(clearTimeout);
        this.timers = [];
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

        const builders = {
            intro: () => this.createIntroScreen(data),
            home: () => this.createHomeScreen(),
            universe: () => this.createUniverseScreen(),
            rapidIntro: () => this.createRapidIntroScreen(),
            rapidCountdown: () => this.createRapidCountdownScreen(),
            discovery: () => data.replay
                ? Discovery.create(data.skillId, () => this.show('parent'), 'Retour')
                : Discovery.create(data.skillId, () => this.show('game')),
            game: () => this.createGameScreen(),
            result: () => this.createResultScreen(data.summary),
            parent: () => this.createParentScreen()
        };
        const screen = (builders[name] || builders.home)();
        this.appContainer.innerHTML = '';
        this.appContainer.appendChild(screen);
        this.currentScreen = name;
        window.scrollTo(0, 0);
    }

    screenEl(extraClass = '') {
        const el = document.createElement('main');
        el.className = `screen active flex flex-col flex-center gap-lg p-lg ${extraClass}`;
        return el;
    }

    // ---------- Intro animée (premier lancement, ou « Revoir l'intro » depuis l'accueil) ----------
    introSeen() {
        return !!(storage.get(storage.KEYS.USER_PREFS) || {}).introSeen;
    }

    markIntroSeen() {
        const prefs = storage.get(storage.KEYS.USER_PREFS) || {};
        if (!prefs.introSeen) storage.set(storage.KEYS.USER_PREFS, { ...prefs, introSeen: true });
    }

    createIntroScreen(data = {}) {
        const screen = document.createElement('main');
        screen.className = 'screen active intro-screen';
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.markIntroSeen();
        const finish = () => this.show('home');
        screen.innerHTML = `
            <div class="intro-art" id="intro-art" aria-live="polite"></div>
            <button class="btn-skip" id="btn-skip-intro">Passer</button>
            ${data.replay ? '' : '<button class="intro-cover" id="btn-intro-start"><span class="intro-cover-icon" aria-hidden="true">🚀</span><span class="text-xl font-bold">Touche pour commencer</span></button>'}
        `;
        const art = screen.querySelector('#intro-art');
        const skip = screen.querySelector('#btn-skip-intro');
        // Fin de l'animation : le bouton devient « Continuer › » (discret, avec une jauge de 5 s) puis on passe à l'accueil tout seul
        const ending = () => {
            skip.textContent = 'Continuer ›';
            skip.classList.add('counting');
            this.later(finish, INTRO_AUTO_SKIP_MS);
        };

        // Le décor est chargé en ligne (et non en <img>) : l'animation redémarre à chaque affichage
        const play = () => {
            fetch('assets/story/intro-anim.svg').then(r => r.text()).then(svg => {
                if (this.currentScreen !== 'intro') return;
                art.innerHTML = svg;
                if (reduced) return ending();
                this.later(() => Sound.play('crash'), 2050);
                this.later(ending, INTRO_DURATION_MS);
            }).catch(ending);
        };
        const cover = screen.querySelector('#btn-intro-start');
        if (cover) cover.addEventListener('click', () => { cover.remove(); play(); });
        else play();

        skip.addEventListener('click', finish);
        return screen;
    }

    // Tête d'un personnage (fox | rabbit) dans une expression : content | bravo | think | comfort
    face(who, mood, alt = '') {
        return `<img class="face face-${who}" src="assets/story/expr/${who}-${mood}.svg" alt="${alt}" width="96" height="96">`;
    }

    // Fait réagir le renard de la partie : change d'expression + petite animation (rejouée à chaque appel)
    reactFox(screen, mood, anim) {
        const box = screen.querySelector('#mascot');
        if (!box) return;
        const img = box.querySelector('img');
        img.src = `assets/story/expr/${this.session && this.session.rapid ? 'rabbit' : 'fox'}-${mood}.svg`;
        box.dataset.mood = mood;
        box.classList.remove('hop', 'tilt', 'nod');
        void box.offsetWidth; // relance l'animation
        if (anim) box.classList.add(anim);
    }

    soundLabel() { return Sound.isOn() ? '🔊' : '🔇'; }

    // Bouton son (jeu) : bascule le réglage et met à jour l'icône + l'état pour les lecteurs d'écran
    bindSoundButton(btn, withText = false) {
        const refresh = () => {
            const on = Sound.isOn();
            btn.setAttribute('aria-pressed', String(on));
            btn.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
            btn.textContent = withText ? (on ? '🔊 Sons activés' : '🔇 Sons coupés') : this.soundLabel();
        };
        refresh();
        btn.addEventListener('click', () => { Sound.toggle(); refresh(); });
    }

    stars(n, max = 3) {
        return '⭐'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
    }

    // ---------- Accueil ----------
    createHomeScreen() {
        const screen = this.screenEl();
        screen.innerHTML = `
            <div class="text-center">
                <img class="intro-img" src="assets/story/intro.svg" alt="Un renard et une lapine pilote spatiale devant son vaisseau en panne : « 2 + 3 = ? »" width="360" height="520">
                <h1 class="text-3xl font-bold mb-md">MathPulse</h1>
                <p class="text-lg muted">Le calcul mental, version aventure !</p>
            </div>
            <div class="flex flex-col gap-md btn-column">
                <button class="btn-primary btn-large" id="btn-play">Jouer</button>
                <button class="btn-secondary" id="btn-parent">Espace parent</button>
                <button class="btn-secondary" id="btn-intro">🎬 Revoir l'intro</button>
            </div>
            <p class="text-sm muted">⭐ ${this.progression.getTotalStars()}</p>
        `;
        screen.querySelector('#btn-play').addEventListener('click', () => this.show('universe'));
        screen.querySelector('#btn-parent').addEventListener('click', () => this.show('parent'));
        screen.querySelector('#btn-intro').addEventListener('click', () => this.show('intro', { replay: true }));
        return screen;
    }

    // ---------- Univers ----------
    createUniverseScreen() {
        const screen = this.screenEl();
        screen.innerHTML = `
            <div class="universe-wrap">${new Universe(this.progression).render()}</div>
            <div class="flex flex-col gap-md btn-column">
                <button class="btn-primary btn-large" id="btn-start-session">C'est parti !</button>
                ${this.engine.rapidAvailable() ? '<button class="btn-secondary" id="btn-rapid">⚡ Série rapide</button>' : ''}
                <button class="btn-secondary" id="btn-back-home">Retour</button>
            </div>
        `;
        screen.querySelector('#btn-start-session').addEventListener('click', () => this.startSession());
        const rapidBtn = screen.querySelector('#btn-rapid');
        if (rapidBtn) rapidBtn.addEventListener('click', () => this.show('rapidIntro'));
        screen.querySelector('#btn-back-home').addEventListener('click', () => this.show('home'));
        return screen;
    }

    startRapid() {
        this.session = new Session(this.engine, this.progression);
        this.session.start({ rapid: true });
        this.show('game');
    }

    // Décompte 3 · 2 · 1 · partez ! synchronisé avec le son (bips à 0, 1 et 2 s, son final à 3 s)
    createRapidCountdownScreen() {
        const screen = this.screenEl('countdown-screen');
        screen.innerHTML = `
            <p class="text-lg muted">Prépare-toi…</p>
            <div class="countdown" id="countdown" role="status" aria-live="assertive">3</div>
        `;
        const el = screen.querySelector('#countdown');
        const step = (txt, cls) => { el.textContent = txt; el.className = 'countdown ' + (cls || ''); void el.offsetWidth; el.classList.add('beat'); };
        Sound.play('countdown');
        el.classList.add('beat');
        this.later(() => step('2'), 1000);
        this.later(() => step('1'), 2000);
        this.later(() => step('Partez !', 'go'), 3000);
        this.later(() => this.startRapid(), 3400);
        return screen;
    }

    // Écran de départ de la série rapide : la lapine explique, sans pression
    createRapidIntroScreen() {
        const screen = this.screenEl();
        screen.innerHTML = `
            <div class="text-center">
                <div class="rabbit-says">
                    ${this.face('rabbit', 'content')}
                    <p class="speech">Teste tes réflexes !</p>
                </div>
                <h1 class="text-2xl font-bold mb-md">⚡ Série rapide</h1>
                <p class="text-lg muted">5 calculs à la suite. Réponds à ton rythme : chaque réponse rapide charge l'élan de la fusée et peut rapporter des étoiles bonus.</p>
            </div>
            <div class="flex flex-col gap-md btn-column">
                <button class="btn-primary btn-large" id="btn-rapid-go">Décollage !</button>
                <button class="btn-secondary" id="btn-back-universe">Retour</button>
            </div>
        `;
        screen.querySelector('#btn-rapid-go').addEventListener('click', () => this.show('rapidCountdown'));
        screen.querySelector('#btn-back-universe').addEventListener('click', () => this.show('universe'));
        return screen;
    }

    // Jauge « élan de la fusée » : une case allumée par réponse rapide
    elanGauge(fastFlags) {
        const n = fastFlags.filter(Boolean).length;
        return `<div class="elan" id="elan" role="img" aria-label="Élan de la fusée : ${n} sur ${RAPID.length}">
            <span class="elan-label" aria-hidden="true">⚡</span>
            ${Array.from({ length: RAPID.length }, (_, i) => `<span class="elan-cell${fastFlags[i] ? ' on' : ''}" data-i="${i}"></span>`).join('')}
        </div>`;
    }

    startSession() {
        this.session = new Session(this.engine, this.progression);
        this.session.start();
        Sound.play('start');
        const skillId = this.session.skill;
        if (!this.progression.hasSeenDiscovery(skillId)) {
            this.progression.markDiscovery(skillId);
            this.show('discovery', { skillId });
        } else {
            this.show('game');
        }
    }

    // ---------- Jeu ----------
    createGameScreen() {
        const screen = this.screenEl('game-screen');
        const s = this.session;
        const ex = s.getCurrentExercise();
        s.beginQuestion();
        let answered = false;

        const hintLabel = () => {
            const left = s.freeHintsLeft();
            return left > 0
                ? `💡 Un coup de pouce · ${left} gratuit${left > 1 ? 's' : ''}`
                : `💡 Un coup de pouce · ${HINTS.maxStarsOverQuota}⭐ max cette session`;
        };

        const dots = s.exercises.map((_, i) =>
            `<span class="dot ${i < s.currentIndex ? 'done' : i === s.currentIndex ? 'current' : ''}"></span>`).join('');

        const answerArea = ex.choices
            ? `<div class="choices">${ex.choices.map(c => `<button class="choice" data-value="${c}">${c}</button>`).join('')}</div>`
            : `<output class="answer-display empty" id="answer-display" aria-live="polite" aria-label="Ta réponse">?</output>
               <div class="keypad" id="keypad">
                   ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-key="${n}">${n}</button>`).join('')}
                   <button class="key key-del" data-key="del" aria-label="Effacer">⌫</button>
                   <button class="key" data-key="0">0</button>
                   <button class="key key-ok" data-key="ok" aria-label="Valider">✓</button>
               </div>`;

        screen.innerHTML = `
            <div class="game-top">
                <button class="btn-quit" id="btn-quit" aria-label="Quitter la session">✕</button>
                <div class="dots" aria-label="Question ${s.currentIndex + 1} sur ${s.exercises.length}">${dots}</div>
                <div class="game-top-right"><span class="text-sm">⭐ ${this.progression.getTotalStars()}</span>
                <button class="btn-sound" id="btn-sound"></button></div>
            </div>
            <div class="mascot" id="mascot" data-mood="content">${this.face(s.rapid ? 'rabbit' : 'fox', 'content')}</div>
            ${s.rapid ? this.elanGauge(s.results.map(r => r.fast)) : ''}
            ${ex.review ? '<p class="review-tag" id="review-tag">🔁 Un calcul à retenter</p>' : ''}
            ${ex.recall ? '<p class="review-tag" id="recall-tag">🔙 Un petit rappel</p>' : ''}
            <div class="question" id="question">${ex.question}</div>
            <div id="visual-slot"></div>
            ${answerArea}
            <button class="btn-hint" id="btn-hint"${s.rapid ? ' hidden' : ''}>${hintLabel()}</button>
            <div id="feedback" class="feedback-container" aria-live="polite"></div>
        `;

        const controls = () => screen.querySelectorAll('.choice, .key, #btn-hint');
        const advance = () => {
            s.next();
            if (s.isComplete()) this.show('result', { summary: s.complete() });
            else this.show('game');
        };

        const submit = (value, chosenBtn) => {
            if (answered || String(value).trim() === '') return;
            answered = true;
            const result = s.submitAnswer(value);
            controls().forEach(c => { c.disabled = true; });
            screen.querySelector('#btn-hint').hidden = true;

            // Pavé numérique : on affiche la réponse validée (✓ / ✗) et on libère la place pour le retour
            const display = screen.querySelector('#answer-display');
            if (display) {
                display.textContent = `${value} ${result.correct ? '✓' : '✗'}`;
                display.classList.add(result.correct ? 'correct' : 'wrong');
                screen.querySelector('#keypad').hidden = true;
            }

            // Le retour d'un choix ne repose pas que sur la couleur : ✓ / ✗
            screen.querySelectorAll('.choice').forEach(btn => {
                if (Number(btn.dataset.value) === result.answer) { btn.classList.add('correct'); btn.textContent += ' ✓'; }
                else if (btn === chosenBtn) { btn.classList.add('wrong'); btn.textContent += ' ✗'; }
            });

            const fb = screen.querySelector('#feedback');
            this.reactFox(screen, result.correct ? 'bravo' : 'comfort', result.correct ? 'hop' : 'tilt');
            Sound.play(result.correct ? 'good' : 'wrong');
            if (s.rapid) {
                // Série rapide : retour très court, enchaînement automatique, pas d'explication (les erreurs reviendront en rappel)
                if (result.fast) {
                    screen.querySelector(`.elan-cell[data-i="${s.currentIndex}"]`).classList.add('on');
                    screen.querySelector('#elan').setAttribute('aria-label', `Élan de la fusée : ${s.results.filter(r => r.fast).length} sur ${RAPID.length}`);
                    this.later(() => Sound.play('fast'), 180);
                }
                fb.innerHTML = result.correct
                    ? `<div class="feedback-success"><p class="text-lg font-bold">${result.fast ? 'Rapide !' : 'Bravo !'}</p></div>`
                    : `<div class="feedback-error"><p class="text-lg font-bold">Presque ! C'était ${result.answer}.</p></div>`;
                this.later(advance, result.correct ? 850 : 1700);
                return;
            }
            if (result.correct) {
                fb.innerHTML = `<div class="feedback-success"><p class="text-lg font-bold">Bravo !</p></div>`;
                this.later(advance, 1100);
            } else {
                fb.innerHTML = `
                    <div class="feedback-error">
                        <p class="text-lg font-bold">Presque ! La réponse est ${result.answer}.</p>
                        <p class="muted">${this.engine.getExplanation(ex)}</p>
                        ${Animations.forExercise(ex)}
                        <button class="btn-primary btn-large mt-md" id="btn-continue">Continuer</button>
                    </div>`;
                const cont = fb.querySelector('#btn-continue');
                cont.addEventListener('click', advance);
                cont.focus();
            }
        };

        // Pavé numérique (3 chiffres maximum : les réponses attendues vont jusqu'à 50)
        if (!ex.choices) {
            let typed = '';
            const display = screen.querySelector('#answer-display');
            const press = key => {
                if (answered) return;
                if (/^\d$/.test(key)) s.noteInput();
                if (key === 'ok') return submit(typed);
                if (key === 'del') typed = typed.slice(0, -1);
                else if (typed.length < 3) typed = (typed + key).replace(/^0+(?=\d)/, '');
                display.textContent = typed || '?';
                display.classList.toggle('empty', !typed);
            };
            // e.detail > 0 : clic souris/tactile → on retire le focus pour que Entrée au clavier valide la réponse
            // (e.detail === 0 : activation au clavier, le focus doit rester pour la navigation Tab)
            screen.querySelectorAll('.key').forEach(k => k.addEventListener('click', e => {
                press(k.dataset.key);
                if (e.detail > 0) k.blur();
            }));

            // Clavier physique (ordinateur) : chiffres, Retour arrière, Entrée
            this.keyHandler = e => {
                if (e.ctrlKey || e.metaKey || e.altKey) return;
                if (/^\d$/.test(e.key)) press(e.key);
                else if (e.key === 'Backspace') press('del');
                else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) press('ok');
                else return;
                e.preventDefault();
            };
            document.addEventListener('keydown', this.keyHandler);
        }
        screen.querySelectorAll('.choice').forEach(btn =>
            btn.addEventListener('click', () => submit(btn.dataset.value, btn)));

        screen.querySelector('#btn-hint').addEventListener('click', e => {
            s.useHint();
            this.reactFox(screen, 'think', 'nod');
            Sound.play('hint');
            this.later(() => { if (!answered) this.reactFox(screen, 'content', null); }, 1600);
            screen.querySelector('#visual-slot').innerHTML = Animations.forExercise(ex);
            e.currentTarget.hidden = true;
        });
        screen.querySelector('#btn-quit').addEventListener('click', () => { s.abandon(); this.show('universe'); });
        this.bindSoundButton(screen.querySelector('#btn-sound'));
        return screen;
    }

    // ---------- Résultat ----------
    createResultScreen(summary) {
        if (summary.rapid) return this.createRapidResultScreen(summary);
        const screen = this.screenEl();
        const { correct, total, starsEarned, newPlanets, skill, capped, cleared } = summary;
        const title = correct === total ? 'Parfait !' : correct >= 3 ? 'Bien joué !' : 'On continue de s\'entraîner !';
        const planets = newPlanets.map(p => `<p class="unlock text-lg font-bold">${p.emoji} Nouvelle planète : ${p.name} !</p>`).join('');
        const mood = correct === total ? 'bravo' : correct >= 3 ? 'content' : 'comfort';
        const line = { bravo: 'Tu pourrais piloter mon vaisseau !', content: 'Bien joué, on avance !', comfort: 'Pas grave, on réessaie ensemble !' }[mood];
        screen.innerHTML = `
            <div class="text-center">
                <div class="rabbit-says" id="rabbit-says" data-mood="${mood}">
                    ${this.face('rabbit', mood)}
                    <p class="speech">${line}</p>
                </div>
                <h1 class="text-2xl font-bold mb-md">${title}</h1>
                <div class="result-card">
                    <p class="text-lg">${correct} sur ${total} réussis · ${SKILLS[skill].name}</p>
                    <p class="result-stars">${starsEarned > 0 ? '⭐'.repeat(starsEarned) : '—'}</p>
                    <p class="muted">${starsEarned > 0 ? `+${starsEarned} ${starsEarned > 1 ? 'étoiles' : 'étoile'}` : 'Pas d\'étoile cette fois, la prochaine sera la bonne !'}</p>
                    ${capped ? `<p class="muted text-sm">Beaucoup de coups de pouce : ${HINTS.maxStarsOverQuota} étoiles maximum cette fois.</p>` : ''}
                    ${cleared > 0 ? `<p class="cleared text-lg font-bold">🦊 ${cleared > 1 ? `${cleared} calculs qui te résistaient sont maintenant acquis` : 'Un calcul qui te résistait est maintenant acquis'} !</p>` : ''}
                    ${planets}
                </div>
            </div>
            <div class="flex flex-col gap-md btn-column">
                <button class="btn-primary btn-large" id="btn-again">Encore !</button>
                <button class="btn-secondary" id="btn-universe">Mon univers</button>
            </div>
        `;
        // Sons de fin de session, échelonnés : étoiles, puis calcul acquis, puis planète
        let at = 150;
        if (starsEarned > 0) { this.later(() => Sound.play(starsEarned === 3 ? 'stars3' : 'stars'), at); at += 1100; }
        if (cleared > 0) { this.later(() => Sound.play('cleared'), at); at += 1100; }
        if (newPlanets.length) this.later(() => Sound.play('planet'), at);
        screen.querySelector('#btn-again').addEventListener('click', () => this.startSession());
        screen.querySelector('#btn-universe').addEventListener('click', () => this.show('universe'));
        return screen;
    }

    createRapidResultScreen(summary) {
        const screen = this.screenEl();
        const { correct, total, fast, starsEarned, rewarded, newPlanets } = summary;
        const mood = correct === total && fast >= total - 1 ? 'bravo' : correct >= 3 ? 'content' : 'comfort';
        const line = { bravo: 'Décollage réussi ! Plus rapide que mon vaisseau !', content: 'Bien joué, tes réflexes progressent !', comfort: 'Pas grave, la prochaine série sera la bonne !' }[mood];
        const stars = !rewarded
            ? '<p class="muted text-sm">Tu as déjà gagné tes étoiles bonus aujourd\'hui : s\'entraîner, c\'est déjà gagner !</p>'
            : starsEarned > 0
                ? `<p class="result-stars">${'⭐'.repeat(starsEarned)}</p><p class="muted">+${starsEarned} ${starsEarned > 1 ? 'étoiles' : 'étoile'} bonus</p>`
                : '<p class="muted">Pas de bonus cette fois, la prochaine sera la bonne !</p>';
        const planets = newPlanets.map(p => `<p class="unlock text-lg font-bold">${p.emoji} Nouvelle planète : ${p.name} !</p>`).join('');
        screen.innerHTML = `
            <div class="text-center" id="rapid-result">
                <div class="rabbit-says" id="rabbit-says" data-mood="${mood}">
                    ${this.face('rabbit', mood)}
                    <p class="speech">${line}</p>
                </div>
                <h1 class="text-2xl font-bold mb-md">⚡ Série rapide</h1>
                <div class="result-card">
                    <p class="text-lg">${correct} sur ${total} réussis · ${fast} ${fast > 1 ? 'réponses rapides' : 'réponse rapide'}</p>
                    ${this.elanGauge(Array.from({ length: total }, (_, i) => i < fast))}
                    ${stars}
                    ${planets}
                </div>
            </div>
            <div class="flex flex-col gap-md btn-column">
                <button class="btn-primary btn-large" id="btn-again">Encore !</button>
                <button class="btn-secondary" id="btn-universe">Mon univers</button>
            </div>
        `;
        let at = 150;
        if (starsEarned > 0) { this.later(() => Sound.play(starsEarned === 2 ? 'stars3' : 'stars'), at); at += 1100; }
        if (newPlanets.length) this.later(() => Sound.play('planet'), at);
        screen.querySelector('#btn-again').addEventListener('click', () => this.show('rapidCountdown'));
        screen.querySelector('#btn-universe').addEventListener('click', () => this.show('universe'));
        return screen;
    }

    // ---------- Espace parent ----------
    createParentScreen() {
        const screen = this.screenEl('parent-screen');
        const history = storage.get(storage.KEYS.SESSION_HISTORY) || [];
        const card = (id) => {
            const st = this.progression.getSkillStats(id);
            if (!st) {
                const req = SKILLS[id].requires;
                const note = this.engine.isUnlocked(id) ? 'Pas encore pratiquée'
                    : `🔒 Se débloque avec ${SKILLS[req.skill].name} niveau ${req.level} (${this.stars(req.level)})`;
                return `<div class="skill-card"><div class="skill-head"><h3>${SKILLS[id].name}</h3><span>${this.stars(0)}</span></div><p class="muted text-sm">${note}</p></div>`;
            }
            const w = this.progression.windowStats(st);
            const acc = Math.round(w.accuracy);
            return `<div class="skill-card">
                <div class="skill-head"><h3>${SKILLS[id].name}</h3><span aria-label="Maîtrise ${st.mastery_level} sur 3">${this.stars(st.mastery_level)}</span></div>
                <p class="muted text-sm">${acc} % de réussite sur les ${w.n} dernières · ${st.seen} questions au total · ${(w.avgMs / 1000).toFixed(1)} s de réflexion en moyenne</p>
            </div>`;
        };
        const axisLabel = (id) => `${SKILLS[id].operation}${SKILLS[id].factor || SKILLS[id].divisor}`;
        const cards = PATHS.map(path => {
            const levels = path.skills.map(id => this.progression.getMasteryLevel(id));
            const mastered = levels.filter(l => l >= 3).length;
            const started = levels.filter(l => l >= 1).length;
            const percent = levels.reduce((x, y) => x + y, 0) / (3 * levels.length) * 100;
            const radar = path.radar
                ? `<div class="radar-wrap">${Charts.radar(path.radar.map(id => ({ label: axisLabel(id), value: this.progression.getMasteryLevel(id) })), { title: path.name })}
                   <p class="muted text-sm text-center">Du centre vers l'extérieur : vu, en cours, maîtrisé ⭐⭐⭐</p></div>`
                : '';
            return `<section class="path">
                <div class="path-head"><h2 class="text-lg font-bold">${path.emoji} ${path.name}</h2><span class="muted text-sm">${mastered}/${path.skills.length} maîtrisées</span></div>
                ${Charts.bar(percent, `Progression ${path.name}`)}
                <p class="muted text-sm mb-md">${started} sur ${path.skills.length} commencées</p>
                ${radar}
                <details class="path-details"><summary>Détail par compétence</summary>
                    <div class="flex flex-col gap-md">${path.skills.map(card).join('')}</div>
                </details>
            </section>`;
        }).join('');
        // étoiles gagnées par jour (7 derniers jours)
        const days = Array.from({ length: 7 }, (_, k) => {
            const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - k));
            const stars = history.filter(h => new Date(h.at).toDateString() === d.toDateString()).reduce((x, h) => x + (h.starsEarned || 0), 0);
            return { label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3), stars };
        });
        const recent = history.slice(-5).reverse().map(h =>
            `<li>${new Date(h.at).toLocaleDateString('fr-FR')} · ${h.rapid ? 'Série rapide ⚡' : (SKILLS[h.skill] ? SKILLS[h.skill].name : h.skill)} · ${h.abandoned ? `abandon (question ${h.at_question}/${h.total})` : `${h.correct}/${h.total}`}</li>`).join('');

        const pending = this.progression.getPendingErrors();
        const toReview = pending.length
            ? `<h2 class="text-lg font-bold mb-md">Calculs à revoir</h2>
               <p class="muted mb-md" id="review-list">${pending.map(e => `${e.operands[0]} ${SKILLS[e.skill].operation} ${e.operands[1]}`).join(', ')}</p>`
            : '';

        screen.innerHTML = `
            <div class="parent-wrap">
                <h1 class="text-2xl font-bold mb-md">Progression</h1>
                <p class="mb-lg">Étoiles collectées : <strong>⭐ ${this.progression.getTotalStars()}</strong></p>
                ${cards}
                <h2 class="text-lg font-bold mb-md">⭐ Étoiles des 7 derniers jours</h2>
                <div class="mb-lg">${Charts.week(days)}</div>
                ${toReview}
                <h2 class="text-lg font-bold mb-md">Dernières sessions</h2>
                <ul class="history mb-lg">${recent || '<li class="muted">Aucune session pour l\'instant</li>'}</ul>
                <h2 class="text-lg font-bold mb-md">Revoir les explications</h2>
                <div class="replay-list mb-lg">
                    ${SKILL_ORDER.map(id => `<button class="btn-secondary" data-replay="${id}">${SKILLS[id].name}</button>`).join('')}
                </div>
                <p class="muted text-sm mb-md" id="app-version">Version ${APP_VERSION} (${APP_BUILD})</p>
                <div class="flex flex-col gap-md">
                    <button class="btn-secondary" id="btn-sound-parent"></button>
                    <button class="btn-secondary" id="btn-export">Exporter les données</button>
                    <button class="btn-secondary" id="btn-reset">Réinitialiser la progression</button>
                    <button class="btn-primary" id="btn-back-home">Retour</button>
                </div>
            </div>
        `;
        screen.querySelector('#btn-back-home').addEventListener('click', () => this.show('home'));
        this.bindSoundButton(screen.querySelector('#btn-sound-parent'), true);
        screen.querySelectorAll('[data-replay]').forEach(b => b.addEventListener('click', () => this.show('discovery', { skillId: b.dataset.replay, replay: true })));
        screen.querySelector('#btn-export').addEventListener('click', () => this.exportData());
        screen.querySelector('#btn-reset').addEventListener('click', () => {
            if (confirm('Effacer toute la progression de cet appareil ? Cette action est définitive.')) {
                this.progression.reset();
                this.show('parent');
            }
        });
        return screen;
    }

    exportData() {
        const blob = new Blob([JSON.stringify(storage.exportData(), null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `mathpulse-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
}
