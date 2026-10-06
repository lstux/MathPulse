// MathPulse - Universe Rendering
// Displays rocket, planets, stars, and progression

class Universe {
    constructor(progression) {
        this.progression = progression;
        this.stars = progression.getTotalStars();
    }

    render() {
        const planets = this.getPlanets();
        const rocketStage = this.getRocketStage();

        let html = `
            <div class="universe-container">
                <!-- Title -->
                <h1 class="text-2xl font-bold mb-lg text-center">MathPulse 🧮</h1>

                <!-- Star Counter -->
                <div class="star-counter text-center mb-2xl">
                    <div class="text-4xl mb-md">⭐</div>
                    <p class="text-xl font-bold">${this.stars} ${this.stars === 1 ? 'étoile' : 'étoiles'}</p>
                </div>

                <!-- Rocket & Space Scene -->
                <div class="space-scene mb-2xl">
                    ${this.renderRocketScene(rocketStage)}
                </div>

                <!-- Planets -->
                <div class="planets-container mb-2xl">
                    ${planets.map((planet, idx) => this.renderPlanet(planet, idx)).join('')}
                </div>

                <!-- Progress Bar -->
                <div class="progress-bar mb-2xl">
                    <div class="progress-label text-sm mb-md">
                        ${this.stars} / 50 étoiles (${Math.round((this.stars / 50) * 100)}%)
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${Math.round((this.stars / 50) * 100)}%"></div>
                    </div>
                </div>

                <!-- Next Goal -->
                <div class="next-goal text-center text-sm text-text-light">
                    ${this.getNextGoalText()}
                </div>
            </div>
        `;

        return html;
    }

    getRocketStage() {
        if (this.stars >= 50) return 5;
        if (this.stars >= 25) return 4;
        if (this.stars >= 10) return 3;
        return 1;
    }

    renderRocketScene(stage) {
        const positions = {
            1: '0%', 2: '15%', 3: '40%', 4: '70%', 5: '95%'
        };

        const position = positions[stage] || '0%';
        const rotation = stage === 1 ? '0deg' : '-30deg';

        return `
            <div class="rocket-scene" style="position: relative; height: 200px;">
                <div class="rocket" style="
                    position: absolute; left: ${position};
                    top: ${Math.max(0, 150 - (stage * 30))}px;
                    transform: rotate(${rotation});
                    transition: all 0.6s ease-out;
                    font-size: 3rem;
                ">🚀</div>
                <div class="stars-trail" style="
                    position: absolute; left: ${position};
                    top: ${Math.max(0, 180 - (stage * 30))}px;
                    opacity: ${stage === 1 ? 0 : 0.6};
                    font-size: 1.5rem;
                ">✨</div>
            </div>
        `;
    }

    getPlanets() {
        const allPlanets = [
            { name: 'Mercury', emoji: '☿️', unlockAt: 10 },
            { name: 'Venus', emoji: '♀️', unlockAt: 25 },
            { name: 'Mars', emoji: '♂️', unlockAt: 50 }
        ];

        return allPlanets.map(planet => ({
            ...planet,
            unlocked: this.stars >= planet.unlockAt,
            progress: Math.min(100, (this.stars / planet.unlockAt) * 100)
        }));
    }

    renderPlanet(planet, index) {
        const locked = !planet.unlocked;
        const lockIcon = locked ? '🔒' : '';

        return `
            <div class="planet-card ${locked ? 'locked' : 'unlocked'}">
                <div class="planet-emoji">${planet.emoji}</div>
                <div class="planet-name">${planet.name}</div>
                <div class="planet-goal text-sm text-text-light">
                    ${planet.unlockAt} ⭐
                </div>
                ${locked ? `<div class="planet-lock">${lockIcon}</div>` : ''}
                <div class="planet-progress">
                    <div class="progress-bar-small">
                        <div class="progress-fill-small" style="width: ${planet.progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getNextGoalText() {
        if (this.stars >= 50) return '🎉 Bravo ! Tu as débloqué toutes les planètes !';
        if (this.stars >= 25) return `📍 ${50 - this.stars} étoiles avant Mars !`;
        if (this.stars >= 10) return `📍 ${25 - this.stars} étoiles avant Venus !`;
        return `📍 ${10 - this.stars} étoiles avant Mercury !`;
    }

    addStars(count) {
        this.stars += count;
        return this.render();
    }
}
