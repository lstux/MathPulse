// MathPulse - Univers : bannière du chapitre en cours, étoiles et chapitres de l'histoire (données dans chapters.js → CHAPTERS)

class Universe {
    constructor(progression) {
        this.stars = progression.getTotalStars();
        this.max = CHAPTERS[CHAPTERS.length - 1].unlockAt;
        const unlocked = chaptersUnlockedAt(this.stars);
        this.currentId = unlocked[unlocked.length - 1].id;   // le dernier chapitre ouvert
    }

    // Haut de l'écran : étoiles, fusée, progression et prochain objectif
    renderHeader() {
        const pct = Math.min(100, Math.round((this.stars / this.max) * 100));
        const current = CHAPTERS.find(c => c.id === this.currentId);
        return `
            <div class="universe-container">
                <div class="star-counter text-center mb-lg">
                    <span aria-hidden="true">⭐</span>
                    <strong>${this.stars}</strong> ${this.stars > 1 ? 'étoiles' : 'étoile'}
                </div>

                <div class="chapter-banner scene-stage mb-lg" role="img" aria-label="Chapitre ${current.number} : ${current.title}">
                    <img class="scene-bg" src="assets/story/scene/${current.banner}.svg" alt="">
                    <div class="scene-cast"><img class="cast left small" src="assets/story/fox-full.svg" alt=""><img class="cast right small" src="assets/story/rabbit-full.svg" alt=""></div>
                </div>

                <div class="progress-bar mb-md">
                    <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${this.max}" aria-valuenow="${Math.min(this.stars, this.max)}">
                        <div class="progress-fill" style="width:${pct}%"></div>
                    </div>
                </div>

                <p class="next-goal text-center text-sm">${this.nextGoalText()}</p>
            </div>`;
    }

    // Carte du ciel : un chemin d'étoiles qui monte de la forêt vers l'espace, un chapitre par étoile
    // Positions en % de la carte (x, y) ; le chapitre 1 est en bas
    static position(index, count) {
        const H = 70 + (count - 1) * 64 + 80;
        return { x: (180 + 100 * Math.sin(index * 1.3)) / 360 * 100, y: (H - 70 - index * 64) / H * 100, px: 180 + 100 * Math.sin(index * 1.3), py: H - 70 - index * 64, H };
    }

    skyBackground(pos) {
        const H = pos[0].H;
        // chemin : un segment plein (or) entre deux chapitres ouverts, pointillé sinon
        const seg = pos.slice(1).map((p, i) => {
            const q = pos[i], open = this.stars >= CHAPTERS[i + 1].unlockAt, my = (q.py + p.py) / 2;
            return `<path d="M${q.px.toFixed(1)} ${q.py} C${q.px.toFixed(1)} ${my} ${p.px.toFixed(1)} ${my} ${p.px.toFixed(1)} ${p.py}" fill="none" stroke="${open ? '#ffd54a' : '#8f97b8'}" stroke-width="${open ? 3 : 2}" ${open ? '' : 'stroke-dasharray="3 6" opacity=".55"'} stroke-linecap="round"/>`;
        }).join('');
        const dots = Array.from({ length: 60 }, (_, i) => {
            const x = (i * 97) % 360, y = (i * 211) % Math.round(H * 0.86), r = i % 5 === 0 ? 1.5 : 1;
            return `<circle cx="${x}" cy="${y}" r="${r}"/>`;
        }).join('');
        const pines = [20, 62, 110, 250, 300, 340].map((x, i) => `<path d="M${x} ${H - 8} l9 -26 h-4 l8 -20 h-5 l9 -22 l9 22 h-5 l8 20 h-4 l9 26Z" fill="#0f2a22" transform="translate(-9 ${i % 2 * 6})"/>`).join('');
        return `<svg class="sky-bg" viewBox="0 0 360 ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150f3a"/><stop offset=".45" stop-color="#2b2370"/><stop offset=".78" stop-color="#3b4a9a"/><stop offset=".9" stop-color="#2d6b4c"/><stop offset="1" stop-color="#16382c"/></linearGradient></defs>
            <rect width="360" height="${H}" fill="url(#skyg)"/><g fill="#fff" opacity=".8">${dots}</g>${seg}${pines}</svg>`;
    }

    renderChapters() {
        const count = CHAPTERS.length;
        const pos = CHAPTERS.map((_, i) => Universe.position(i, count));
        const current = CHAPTERS.find(c => c.id === this.currentId);
        const stars = CHAPTERS.map((c, i) => {
            const unlocked = this.stars >= c.unlockAt, isCurrent = c.id === this.currentId;
            const style = `left:${pos[i].x.toFixed(2)}%;top:${pos[i].y.toFixed(2)}%`;
            if (!unlocked) {
                return `<button class="sky-star locked" style="${style}" data-star="${c.id}" aria-label="Chapitre ${c.number} : à découvrir, ${c.unlockAt} étoiles"><span class="sky-dot" aria-hidden="true"></span><span class="sky-goal text-sm" aria-hidden="true">${c.unlockAt} ⭐</span></button>`;
            }
            return `<button class="sky-star unlocked${isCurrent ? ' current' : ''}" style="${style}" data-star="${c.id}"${isCurrent ? ' aria-current="step"' : ''} aria-label="Chapitre ${c.number} : ${c.title}"><img src="assets/story/icons/${c.id}.svg" alt="" width="44" height="44"></button>`;
        }).join('');
        return `
            <div class="sky-detail" id="sky-detail" aria-live="polite">${this.renderChapter(current)}</div>
            <div class="sky-scroll" id="sky-scroll" role="group" aria-label="La carte du ciel : un chapitre par étoile">
                <div class="sky-map" style="aspect-ratio:360 / ${pos[0].H}">${this.skyBackground(pos)}${stars}</div>
            </div>`;
    }

    render() {
        return this.renderHeader() + this.renderChapters();
    }

    // Un chapitre verrouillé cache son titre : on découvre l'histoire au fur et à mesure
    renderChapter(chapter) {
        const unlocked = this.stars >= chapter.unlockAt;
        if (!unlocked) {
            return `
            <div class="chapter-card locked">
                <img class="chapter-icon" src="assets/story/icons/locked.svg" alt="" width="44" height="44">
                <div class="chapter-body">
                    <div class="chapter-number text-sm">Chapitre ${chapter.number}</div>
                    <div class="chapter-title">À découvrir</div>
                </div>
                <div class="chapter-goal text-sm">${chapter.unlockAt} ⭐<br>encore ${chapter.unlockAt - this.stars}</div>
            </div>`;
        }
        const current = chapter.id === this.currentId;
        return `
            <div class="chapter-card unlocked${current ? ' current' : ''}">
                <img class="chapter-icon" src="assets/story/icons/${chapter.id}.svg" alt="" width="44" height="44">
                <div class="chapter-body">
                    <div class="chapter-number text-sm">Chapitre ${chapter.number}</div>
                    <div class="chapter-title">${chapter.title}</div>
                    <div class="chapter-mission text-sm">${chapter.mission}</div>
                    ${current ? '<div class="chapter-tag text-sm">En cours</div>' : ''}
                </div>
                ${chapter.scene ? `<button class="chapter-replay" data-chapter="${chapter.id}" aria-label="Revoir la scène du chapitre ${chapter.number}">Revoir</button>` : ''}
            </div>`;
    }

    nextGoalText() {
        const next = nextChapter(this.stars);
        if (!next) return 'Bravo ! Tu as débloqué toute l\'histoire. À\u00a0suivre…';
        const left = next.unlockAt - this.stars;
        return `Encore ${left} ${left > 1 ? 'étoiles' : 'étoile'} pour le chapitre ${next.number} !`;
    }
}
