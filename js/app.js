// MathPulse - Main Application Bootstrap

class MathPulse {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentScreen = null;
        this.engine = null;
        this.progression = null;

        this.init();
    }

    async init() {
        try {
            // Register Service Worker for offline support
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js')
                    .then(reg => console.log('✓ Service Worker registered'))
                    .catch(err => console.log('Service Worker registration failed:', err));
            }

            // Initialize Storage
            storage.init();

            // Initialize Progression System
            this.progression = new Progression();
            this.progression.load();

            // Initialize Engine
            this.engine = new Engine(this.progression);

            // Show Home Screen
            this.showScreen('home');

        } catch (error) {
            console.error('Failed to initialize MathPulse:', error);
            this.showError('Failed to start app');
        }
    }

    showScreen(screenName) {
        try {
            // Clear current screen
            this.appContainer.innerHTML = '';

            // Create screen based on name
            let screen;
            switch (screenName) {
                case 'home':
                    screen = this.createHomeScreen();
                    break;
                case 'universe':
                    screen = this.createUniverseScreen();
                    break;
                case 'game':
                    screen = this.createGameScreen();
                    break;
                case 'result':
                    screen = this.createResultScreen();
                    break;
                case 'parent':
                    screen = this.createParentScreen();
                    break;
                default:
                    screen = this.createHomeScreen();
            }

            this.appContainer.appendChild(screen);
            this.currentScreen = screenName;

        } catch (error) {
            console.error('Failed to show screen:', error);
            this.showError('Failed to load screen');
        }
    }

    createHomeScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        screen.innerHTML = `
            <div class="text-center">
                <div class="text-3xl mb-lg">🧮</div>
                <h1 class="text-3xl font-bold mb-md">MathPulse</h1>
                <p class="text-lg text-text-light mb-2xl">Apprends le calcul mental en t'amusant !</p>
            </div>

            <div class="flex flex-col gap-md" style="width: 100%; max-width: 300px;">
                <button class="btn-primary btn-large" id="btn-play">
                    🎮 JOUER
                </button>
                <button class="btn-secondary" id="btn-parent">
                    👨‍👩‍👧‍👦 Espace Parent
                </button>
            </div>
        `;

        // Event listeners
        screen.querySelector('#btn-play').addEventListener('click', () => {
            this.showScreen('universe');
        });

        screen.querySelector('#btn-parent').addEventListener('click', () => {
            this.showScreen('parent');
        });

        return screen;
    }

    createUniverseScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        const universe = new Universe(this.progression);
        const universeHTML = universe.render();

        screen.innerHTML = `
            <div class="universe-view">
                ${universeHTML}
                <button class="btn-primary btn-large" id="btn-start-session">
                    ▶️ Démarrer une session
                </button>
                <button class="btn-secondary" id="btn-back-home">
                    ⬅️ Retour
                </button>
            </div>
        `;

        screen.querySelector('#btn-start-session').addEventListener('click', () => {
            this.startSession();
        });

        screen.querySelector('#btn-back-home').addEventListener('click', () => {
            this.showScreen('home');
        });

        return screen;
    }

    createGameScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        // Will be populated by session manager
        screen.innerHTML = '<div id="game-container"></div>';

        return screen;
    }

    createResultScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';

        // Will be populated by session manager
        screen.innerHTML = '<div id="result-container"></div>';

        return screen;
    }

    createParentScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col gap-lg p-lg';

        const dashboard = this.renderParentDashboard();

        screen.innerHTML = `
            <h1 class="text-2xl font-bold mb-lg">📊 Progression</h1>
            ${dashboard}
            <button class="btn-secondary mt-lg" id="btn-back-home">
                ⬅️ Retour
            </button>
        `;

        screen.querySelector('#btn-back-home').addEventListener('click', () => {
            this.showScreen('home');
        });

        return screen;
    }

    renderParentDashboard() {
        const stats = this.progression.getStats();

        let html = '<div class="grid grid-2 gap-lg">';

        for (const [skillId, skillStats] of Object.entries(stats)) {
            const masteryPercent = (skillStats.correct / skillStats.seen * 100).toFixed(0);
            html += `
                <div class="stat-card rounded">
                    <h3 class="text-lg font-bold mb-md">${skillStats.name}</h3>
                    <div class="text-2xl mb-md">${this.getMasteryStars(skillStats)}</div>
                    <p class="text-sm">${masteryPercent}% maîtrisé</p>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    getMasteryStars(stats) {
        const percent = (stats.correct / stats.seen * 100);
        if (percent >= 90) return '⭐⭐⭐';
        if (percent >= 70) return '⭐⭐☆';
        return '⭐☆☆';
    }

    startSession() {
        // Start new game session
        this.session = new Session(this.engine, this.progression);
        this.session.start();
        this.renderGameScreen();
    }

    renderGameScreen() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const gameHTML = this.session.renderCurrentGame();
        gameContainer.innerHTML = gameHTML;

        // Attach event listeners for game
        this.attachGameListeners();
    }

    attachGameListeners() {
        // This will be implemented in Session class
    }

    showError(message) {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        screen.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-md">⚠️ Erreur</h1>
                <p class="mb-lg">${message}</p>
                <button class="btn-primary" onclick="location.reload()">Recharger</button>
            </div>
        `;
        this.appContainer.appendChild(screen);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mathpulse = new MathPulse();
});
