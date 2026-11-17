// MathPulse v2 - Écrans d'une mission : un écran par étape (voir mission/runner.js et content/missions.js)
// MissionUI.create(run, ui) rend l'étape courante ; ui = { rerender, done, quit, later, setKeyHandler }

const MissionUI = {
    create(run, ui) {
        if (run.isComplete()) return this.endScreen(run, ui);
        const step = run.step;
        const advance = () => { run.next(); ui.rerender(); };
        if (step.type === 'scene') {
            return Scenes.create({ label: `Mission · ${run.mission.title}`, scene: step.vignettes }, { onDone: advance });
        }
        if (step.type === 'explore') return this.exploreScreen(run, step, advance, ui);
        if (step.type === 'explain') return this.explainScreen(run, step, advance, ui);
        return this.answerScreen(run, step, advance, ui);
    },

    shell(run, ui, inner) {
        const screen = document.createElement('main');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg mission-screen';
        const total = run.mission.steps.length;
        const dots = run.mission.steps.map((_, i) => `<span class="dot ${i < run.index ? 'done' : i === run.index ? 'current' : ''}"></span>`).join('');
        screen.innerHTML = `
            <div class="game-top">
                <button class="btn-quit" id="btn-quit" aria-label="Quitter la mission">✕</button>
                <div class="dots" aria-label="Étape ${Math.min(run.index + 1, total)} sur ${total}">${dots}</div>
                <div class="game-top-right"><button class="btn-sound" id="btn-sound"></button></div>
            </div>${inner}`;
        screen.querySelector('#btn-quit').addEventListener('click', ui.quit);
        Sound.bindButton(screen.querySelector('#btn-sound'));
        return screen;
    },

    says(who, text, mood = 'content') {
        return `<div class="scene-line scene-line-${who} mission-says">
            <img class="face" src="assets/story/expr/${who}-${mood}.svg" alt="" width="56" height="56">
            <p class="speech"><span class="sr-only">${Player.label(who)} : </span>${Scenes.fr(text)}</p>
        </div>`;
    },

    explainHtml(step) {
        const v = step.visual;
        return `<h1 class="text-2xl font-bold text-center">${Scenes.fr(step.title)}</h1>
            ${v && typeof Animations[v.fn] === 'function' ? Animations[v.fn](...v.args) : ''}
            <div class="text-center">
                <p class="text-lg font-bold mb-md">${Scenes.fr(step.text)}</p>
                <p class="formula">${step.formula}</p>
            </div>`;
    },

    explainScreen(run, step, advance, ui) {
        const screen = this.shell(run, ui, `${this.explainHtml(step)}
            <button class="btn-primary btn-large" id="btn-mission-next">J'ai compris</button>`);
        screen.querySelector('#btn-mission-next').addEventListener('click', advance);
        Sound.play('scene-next');
        return screen;
    },

    // Manipulation libre : but simple, piste d'Andrea après un moment sans geste, « Continuer » quand le but est atteint
    exploreScreen(run, step, advance, ui) {
        const screen = this.shell(run, ui, `
            <div id="explore-says">${this.says(step.who || 'rabbit', step.prompt)}</div>
            <div id="explore-tool"></div>
            <button class="btn-primary btn-large" id="btn-mission-next" hidden>Continuer</button>`);
        const says = screen.querySelector('#explore-says'), next = screen.querySelector('#btn-mission-next');
        const model = new TenFrameModel(step.operands[0], step.operands[1]);
        let hinted = false, idle = null;
        const armHint = () => {
            clearTimeout(idle);
            idle = setTimeout(() => { if (!model.full && screen.isConnected) { hinted = true; says.innerHTML = this.says('rabbit', step.hint, 'think'); } }, MISSION_RULES.exploreHintMs);
        };
        screen.querySelector('#explore-tool').appendChild(TenFrame.create(model, { item: step.item, onChange: (ev) => {
            if (ev === 'complete') {
                clearTimeout(idle);
                run.explored({ moves: model.moves, hinted });
                says.innerHTML = this.says('rabbit', step.done, 'bravo');
                next.hidden = false;
                Sound.play('good');
            } else if (ev === 'back') {
                // l'enfant défait : le but n'est plus atteint, on revient à la consigne
                next.hidden = true; says.innerHTML = this.says(step.who || 'rabbit', step.prompt); armHint();
            } else if (ev === 'nothing' && !model.full) {
                says.innerHTML = this.says('rabbit', step.hint, 'think'); armHint();
            } else if (!model.full) armHint();
        } }));
        next.addEventListener('click', () => { clearTimeout(idle); advance(); });
        armHint();
        return screen;
    },

    answerScreen(run, step, advance, ui) {
        const [a, b] = step.operands, op = step.op || '+';
        const screen = this.shell(run, ui, `
            ${this.says(step.who || 'fox', step.prompt, step.type === 'problem' ? 'worried' : 'content')}
            <div class="question" id="question">${fmtNum(a)} ${op} ${fmtNum(b)} = ?</div>
            <output class="answer-display empty" id="answer-display" aria-live="polite" aria-label="Ta réponse">?</output>
            <div id="feedback" class="feedback-container" aria-live="polite"></div>
            <div class="keypad" id="keypad">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-key="${n}">${n}</button>`).join('')}
                <button class="key key-del" data-key="del" aria-label="Effacer">⌫</button>
                <button class="key" data-key="0">0</button>
                <button class="key key-ok" data-key="ok" aria-label="Valider">✓</button>
            </div>`);
        const display = screen.querySelector('#answer-display'), fb = screen.querySelector('#feedback'), keypad = screen.querySelector('#keypad');
        let typed = '', locked = false;
        const show = () => { display.textContent = typed || '?'; display.classList.toggle('empty', !typed); display.classList.remove('correct', 'wrong'); };
        const close = (html, label) => {
            locked = true; keypad.hidden = true;
            fb.innerHTML = `${html}<button class="btn-primary btn-large mt-md" id="btn-mission-next">${label}</button>`;
            const btn = fb.querySelector('#btn-mission-next');
            btn.addEventListener('click', advance); btn.focus();
        };
        const submit = () => {
            if (locked || typed === '') return;
            const value = typed, res = run.answer(value);
            display.textContent = `${value} ${res.correct ? '✓' : '✗'}`;
            display.classList.add(res.correct ? 'correct' : 'wrong');
            Sound.play(res.correct ? 'good' : 'wrong');
            if (res.correct) {
                locked = true; keypad.hidden = true;
                fb.innerHTML = `<div class="feedback-success"><p class="text-lg font-bold">${step.type === 'problem' ? 'Oui ! Regardons comment faire.' : 'Bravo !'}</p></div>`;
                ui.later(advance, 1200);
            } else if (step.type === 'problem') {
                // On découvre avant d'expliquer : pas de bonne réponse affichée, l'explication arrive juste après
                close(`<div class="feedback-error"><p class="text-lg font-bold">Pas tout à fait. On regarde ensemble ?</p></div>`, 'Voir comment faire');
            } else if (res.feedback === 'explain') {
                const ex = run.lastExplain();
                close(`<div class="feedback-error"><p class="text-lg font-bold">On revoit l'idée, et on continue.</p></div>${ex ? this.explainHtml(ex) : ''}`, 'Continuer');
            } else {
                // Piste d'Andrea adaptée au type d'erreur ; au 2e essai, une image du chemin (sans le résultat) s'y ajoute
                const h = res.help, v = h.visual;
                fb.innerHTML = `${this.says('rabbit', h.tip ? `${h.text} ${h.tip}` : h.text, 'think')}${v && typeof Animations[v.fn] === 'function' ? Animations[v.fn](...v.args) : ''}`;
                screen.classList.add('has-help');
                typed = '';
                ui.later(show, 900);
            }
        };
        const press = key => {
            if (locked) return;
            if (key === 'ok') return submit();
            if (key === 'del') typed = typed.slice(0, -1);
            else if (typed.length < 4) typed = (typed + key).replace(/^0+(?=\d)/, '');
            show();
        };
        screen.querySelectorAll('.key').forEach(k => k.addEventListener('click', e => { press(k.dataset.key); if (e.detail > 0) k.blur(); }));
        ui.setKeyHandler(e => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (/^\d$/.test(e.key)) press(e.key);
            else if (e.key === 'Backspace') press('del');
            else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) press('ok');
            else return;
            e.preventDefault();
        });
        return screen;
    },

    endScreen(run, ui) {
        const s = run.complete();
        const line = s.reused ? "Tu as réutilisé l'astuce dans une autre situation. Bien joué !"
            : s.understood ? "Tu as compris l'astuce. On la reverra bientôt !"
            : "On reverra cette astuce ensemble une prochaine fois.";
        const screen = this.shell(run, ui, `
            <h1 class="text-2xl font-bold text-center">Mission terminée !</h1>
            ${this.says('rabbit', line, s.understood ? 'bravo' : 'content')}
            <button class="btn-primary btn-large" id="btn-mission-done">Continuer</button>`);
        screen.querySelector('#btn-quit').hidden = true;
        screen.querySelector('#btn-mission-done').addEventListener('click', ui.done);
        Sound.play('good');
        return screen;
    }
};
