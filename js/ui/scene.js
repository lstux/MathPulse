// MathPulse - Visionneuse de scènes d'histoire : vignettes (décor, personnages, textes), bouton « Passer »
// Données : chapters.js (chapitre.scene). Décors : assets/story/scene/<art>.svg. Personnages : assets/story/*-full.svg.

const Scenes = {
    NAMES: { fox: 'Le renard', rabbit: 'La lapine' },

    create(chapter, { onDone, doneLabel = 'Continuer' } = {}) {
        const vignettes = chapter.scene;
        let index = 0;
        let finished = false;

        const screen = document.createElement('main');
        screen.className = 'screen active scene-screen flex flex-col flex-center gap-md p-lg';
        screen.setAttribute('aria-label', `Chapitre ${chapter.number} : ${chapter.title}`);
        screen.innerHTML = `
            <div class="scene-top">
                <p class="scene-chapter">Chapitre ${chapter.number} · ${chapter.title}</p>
                <button class="btn-scene-skip" id="btn-scene-skip">Passer</button>
            </div>
            <div class="scene-stage" id="scene-stage" aria-hidden="true"></div>
            <div class="scene-lines" id="scene-lines" aria-live="polite"></div>
            <div class="scene-dots" id="scene-dots" aria-hidden="true"></div>
            <button class="btn-primary btn-large" id="btn-scene-next"></button>
        `;
        const stage = screen.querySelector('#scene-stage');
        const lines = screen.querySelector('#scene-lines');
        const dots = screen.querySelector('#scene-dots');
        const next = screen.querySelector('#btn-scene-next');

        const lineHtml = l => {
            if (l.who === 'narrator') return `<p class="scene-narr">${l.text}</p>`;
            return `<div class="scene-line scene-line-${l.who}">
                <img class="face" src="assets/story/expr/${l.who}-${l.mood || 'content'}.svg" alt="" width="56" height="56">
                <p class="speech"><span class="sr-only">${Scenes.NAMES[l.who]} : </span>${l.text}</p>
            </div>`;
        };

        const draw = () => {
            const v = vignettes[index];
            // Celui qui parle fait un petit saut, l'autre s'efface légèrement (personne ne parle : tout le monde est « actif »)
            const speakers = v.lines.map(l => l.who).filter(w => w !== 'narrator');
            const role = who => !speakers.length ? '' : (speakers.includes(who) ? ' speaking' : ' quiet');
            stage.innerHTML = `<img class="scene-bg" src="assets/story/scene/${v.art}.svg" alt="">`
                + `<div class="scene-cast">${v.cast.map(m =>
                    `<img class="cast ${m.at}${m.small ? ' small' : ''}${role(m.who)}" src="assets/story/${m.who}-full.svg" alt="">`).join('')}</div>`;
            lines.innerHTML = v.lines.map(lineHtml).join('');
            dots.innerHTML = vignettes.map((_, i) => `<span class="scene-dot${i === index ? ' on' : ''}"></span>`).join('');
            next.textContent = index < vignettes.length - 1 ? 'Suite ›' : doneLabel;
        };

        const finish = () => {
            if (finished) return;
            finished = true;
            if (onDone) onDone();
        };

        next.addEventListener('click', () => {
            if (index < vignettes.length - 1) { index++; draw(); } else finish();
        });
        screen.querySelector('#btn-scene-skip').addEventListener('click', finish);
        draw();
        return screen;
    }
};
