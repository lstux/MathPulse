// MathPulse - Démarrage de l'application

class MathPulse {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.init();
    }

    init() {
        try {
            this.registerServiceWorker();
            storage.init();
            this.requestPersistentStorage();
            Sound.init();

            this.progression = new Progression();
            this.progression.load();
            this.engine = new Engine(this.progression);
            this.screenManager = new ScreenManager(this.appContainer, this.engine, this.progression);
            this.screenManager.show('home');
        } catch (error) {
            console.error('Échec du démarrage de MathPulse:', error);
            this.showError();
        }
    }

    registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        // Pas de service worker en local : il masquerait les modifications pendant le développement
        const dev = ['localhost', '127.0.0.1'].includes(location.hostname);
        if (dev && !location.search.includes('sw')) return;
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker non enregistré:', err));
    }

    // Demande au navigateur de ne pas purger les données (iOS/Safari peut les effacer après quelques jours sans usage)
    requestPersistentStorage() {
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    }

    showError() {
        this.appContainer.innerHTML = `
            <main class="screen active flex flex-col flex-center gap-lg p-lg text-center">
                <h1 class="text-2xl font-bold">Oups, quelque chose s'est mal passé</h1>
                <button class="btn-primary btn-large" onclick="location.reload()">Recharger</button>
            </main>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.mathpulse = new MathPulse();
});
