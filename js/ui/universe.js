// MathPulse - Univers : fusée, renard 🦊, étoiles et planètes (données dans skills.js → PLANETS)

class Universe {
    constructor(progression) {
        this.stars = progression.getTotalStars();
        this.max = PLANETS[PLANETS.length - 1].unlockAt;
    }

    render() {
        const pct = Math.min(100, Math.round((this.stars / this.max) * 100));
        return `
            <div class="universe-container">
                <div class="star-counter text-center mb-lg">
                    <span aria-hidden="true">⭐</span>
                    <strong>${this.stars}</strong> ${this.stars > 1 ? 'étoiles' : 'étoile'}
                </div>

                <div class="space-scene mb-lg" role="img" aria-label="La fusée du renard avance avec tes étoiles">
                    <div class="rocket" style="bottom:${8 + pct * 0.62}%">🚀</div>
                    <div class="fox" aria-hidden="true">🦊</div>
                </div>

                <div class="planets-container mb-lg">
                    ${PLANETS.map(p => this.renderPlanet(p)).join('')}
                </div>

                <div class="progress-bar mb-md">
                    <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${this.max}" aria-valuenow="${Math.min(this.stars, this.max)}">
                        <div class="progress-fill" style="width:${pct}%"></div>
                    </div>
                </div>

                <p class="next-goal text-center text-sm">${this.nextGoalText()}</p>
            </div>`;
    }

    renderPlanet(planet) {
        const unlocked = this.stars >= planet.unlockAt;
        return `
            <div class="planet-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="planet-emoji" aria-hidden="true">${unlocked ? planet.emoji : '🔒'}</div>
                <div class="planet-name">${planet.name}</div>
                <div class="planet-goal text-sm">${unlocked ? 'Débloquée !' : `${planet.unlockAt} ⭐`}</div>
            </div>`;
    }

    nextGoalText() {
        const next = PLANETS.find(p => this.stars < p.unlockAt);
        if (!next) return 'Bravo ! Tu as exploré toutes les planètes !';
        const left = next.unlockAt - this.stars;
        return `Encore ${left} ${left > 1 ? 'étoiles' : 'étoile'} pour atteindre ${next.name} !`;
    }
}
