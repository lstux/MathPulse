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

    renderChapters() {
        return `
            <ol class="chapters-list" aria-label="Les chapitres de l'histoire">
                ${CHAPTERS.map(c => this.renderChapter(c)).join('')}
            </ol>`;
    }

    render() {
        return this.renderHeader() + this.renderChapters();
    }

    // Un chapitre verrouillé cache son titre : on découvre l'histoire au fur et à mesure
    renderChapter(chapter) {
        const unlocked = this.stars >= chapter.unlockAt;
        if (!unlocked) {
            return `
            <li class="chapter-card locked">
                <img class="chapter-icon" src="assets/story/icons/locked.svg" alt="" width="44" height="44">
                <div class="chapter-body">
                    <div class="chapter-number text-sm">Chapitre ${chapter.number}</div>
                    <div class="chapter-title">À découvrir</div>
                </div>
                <div class="chapter-goal text-sm">${chapter.unlockAt} ⭐</div>
            </li>`;
        }
        const current = chapter.id === this.currentId;
        return `
            <li class="chapter-card unlocked${current ? ' current' : ''}"${current ? ' aria-current="step"' : ''}>
                <img class="chapter-icon" src="assets/story/icons/${chapter.id}.svg" alt="" width="44" height="44">
                <div class="chapter-body">
                    <div class="chapter-number text-sm">Chapitre ${chapter.number}</div>
                    <div class="chapter-title">${chapter.title}</div>
                    <div class="chapter-mission text-sm">${chapter.mission}</div>
                    ${current ? '<div class="chapter-tag text-sm">En cours</div>' : ''}
                </div>
                ${chapter.scene ? `<button class="chapter-replay" data-chapter="${chapter.id}" aria-label="Revoir la scène du chapitre ${chapter.number}">Revoir</button>` : ''}
            </li>`;
    }

    nextGoalText() {
        const next = nextChapter(this.stars);
        if (!next) return 'Bravo ! Tu as débloqué toute l\'histoire. À suivre…';
        const left = next.unlockAt - this.stars;
        return `Encore ${left} ${left > 1 ? 'étoiles' : 'étoile'} pour le chapitre ${next.number} !`;
    }
}
