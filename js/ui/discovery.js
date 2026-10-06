// MathPulse - Discovery Phase
// Pedagogical introduction before playing

class DiscoveryPhase {
    constructor(skillId, screenManager) {
        this.skillId = skillId;
        this.screenManager = screenManager;
        this.discoveries = {
            'addition-simple': this.discoveryAddition,
            'multiply-2': this.discoveryMultiplyBy2,
            'multiply-5': this.discoveryMultiplyBy5
        };
    }

    show() {
        const discovery = this.discoveries[this.skillId];
        if (!discovery) {
            this.screenManager.show('game');
            return;
        }
        discovery.call(this);
    }

    discoveryAddition() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        screen.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-lg">Regardons comment ça marche ! ✨</h1>
            </div>

            <div class="animation-blocks mb-2xl" style="min-height: 150px;">
                <div style="display: flex; gap: 2rem; justify-content: center; align-items: flex-end; flex-wrap: wrap;">
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-width: 150px;">
                        ${Array(5).fill('').map((_, i) =>
                            `<div class="block addition-first" style="animation-delay: ${i * 50}ms;"></div>`
                        ).join('')}
                    </div>
                    <div style="font-size: 1.5rem; font-weight: bold;">+</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-width: 150px;">
                        ${Array(3).fill('').map((_, i) =>
                            `<div class="block addition-second" style="animation-delay: ${(5 + i) * 50}ms;"></div>`
                        ).join('')}
                    </div>
                </div>
            </div>

            <div class="text-center mb-2xl">
                <p class="text-lg font-bold mb-md">5 et 3 font 8 ensemble ! 🎉</p>
                <p class="text-text-light">5 + 3 = 8</p>
            </div>

            <div class="text-center mb-2xl">
                <p class="text-sm text-text-light">Tu vas voir comment l'addition fonctionne avec les animations</p>
                <p class="text-sm text-text-light">À chaque réponse, tu verras les blocs s'assembler !</p>
            </div>

            <button class="btn-primary btn-large" id="btn-start-game">
                ▶️ C'est parti !
            </button>
        `;

        screen.querySelector('#btn-start-game').addEventListener('click', () => {
            this.screenManager.show('game');
        });

        this.screenManager.appContainer.innerHTML = '';
        this.screenManager.appContainer.appendChild(screen);
    }

    discoveryMultiplyBy2() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        screen.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-lg">Les doublement ! ✨</h1>
            </div>

            <div style="min-height: 150px;">
                <div style="display: flex; justify-content: center; align-items: center; gap: 3rem; flex-wrap: wrap;">
                    <div style="font-size: 2rem; animation-delay: 0ms;" class="double-item">
                        🍎🍎🍎
                    </div>
                    <div style="font-size: 1.5rem; font-weight: bold;">→</div>
                    <div style="font-size: 2rem; animation-delay: 200ms;" class="double-item">
                        🍎🍎🍎🍎🍎🍎
                    </div>
                </div>
            </div>

            <div class="text-center mb-2xl">
                <p class="text-lg font-bold mb-md">3 doublé, c'est 6 ! 🎉</p>
                <p class="text-text-light">3 × 2 = 6</p>
            </div>

            <div class="text-center mb-2xl">
                <p class="text-sm text-text-light">Quand tu multiplies par 2, tu doubles le nombre</p>
            </div>

            <button class="btn-primary btn-large" id="btn-start-game">
                ▶️ C'est parti !
            </button>
        `;

        screen.querySelector('#btn-start-game').addEventListener('click', () => {
            this.screenManager.show('game');
        });

        this.screenManager.appContainer.innerHTML = '';
        this.screenManager.appContainer.appendChild(screen);
    }

    discoveryMultiplyBy5() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        screen.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-lg">Les groupes de 5 ! ✨</h1>
            </div>

            <div style="min-height: 180px; display: flex; flex-direction: column; gap: 1rem; justify-content: center; align-items: center;">
                ${Array(3).fill('').map((_, i) =>
                    `<div class="group" style="animation-delay: ${i * 100}ms;">
                        ${Array(5).fill('').map((_, j) =>
                            `<div class="group-item" style="animation-delay: ${(i * 5 + j) * 30}ms;">🍎</div>`
                        ).join('')}
                    </div>`
                ).join('')}
            </div>

            <div class="text-center mb-2xl">
                <p class="text-lg font-bold mb-md">3 groupes de 5, c'est 15 ! 🎉</p>
                <p class="text-text-light">3 × 5 = 15</p>
            </div>

            <div class="text-center mb-2xl">
                <p class="text-sm text-text-light">Tu vas créer des groupes de 5 et les compter</p>
            </div>

            <button class="btn-primary btn-large" id="btn-start-game">
                ▶️ C'est parti !
            </button>
        `;

        screen.querySelector('#btn-start-game').addEventListener('click', () => {
            this.screenManager.show('game');
        });

        this.screenManager.appContainer.innerHTML = '';
        this.screenManager.appContainer.appendChild(screen);
    }
}
