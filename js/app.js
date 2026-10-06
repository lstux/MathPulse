// MathPulse - Main Application Bootstrap

class MathPulse {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.screenManager = null;
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
                    .catch(err => console.log('⚠️ Service Worker registration failed:', err));
            }

            // Initialize Storage
            storage.init();

            // Initialize Progression System
            this.progression = new Progression();
            this.progression.load();

            // Initialize Engine
            this.engine = new Engine(this.progression);

            // Initialize Screen Manager
            this.screenManager = new ScreenManager(
                this.appContainer,
                this.engine,
                this.progression
            );

            // Show Home Screen
            this.screenManager.show('home');

            console.log('✓ MathPulse initialized successfully');
            console.log(`  • Stars: ${this.progression.getTotalStars()}`);

        } catch (error) {
            console.error('Failed to initialize MathPulse:', error);
            this.showError('Failed to start app');
        }
    }

    showError(message) {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        screen.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-md">⚠️ Error</h1>
                <p class="mb-lg">${message}</p>
                <button class="btn-primary" onclick="location.reload()">Reload</button>
            </div>
        `;
        this.appContainer.appendChild(screen);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mathpulse = new MathPulse();
});
