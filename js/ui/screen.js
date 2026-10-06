// MathPulse - Screen Manager
// Handles navigation between all screens

class ScreenManager {
    constructor(appContainer, engine, progression) {
        this.appContainer = appContainer;
        this.engine = engine;
        this.progression = progression;
        this.currentScreen = null;
        this.session = null;
    }

    show(screenName, data = {}) {
        let screen;
        switch (screenName) {
            case 'home': screen = this.createHomeScreen(); break;
            case 'universe': screen = this.createUniverseScreen(); break;
            case 'game': screen = this.createGameScreen(); break;
            case 'result': screen = this.createResultScreen(data); break;
            case 'parent': screen = this.createParentScreen(); break;
            default: screen = this.createHomeScreen();
        }
        this.appContainer.innerHTML = '';
        this.appContainer.appendChild(screen);
        this.currentScreen = screenName;
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
                <button class="btn-primary btn-large" id="btn-play">🎮 JOUER</button>
                <button class="btn-secondary" id="btn-parent">👨‍👩‍👧‍👦 Espace Parent</button>
            </div>
            <div class="mt-md text-center text-sm text-text-light">
                <p>⭐ ${this.progression.getTotalStars()} étoiles collectées</p>
            </div>
        `;
        screen.querySelector('#btn-play').addEventListener('click', () => this.show('universe'));
        screen.querySelector('#btn-parent').addEventListener('click', () => this.show('parent'));
        return screen;
    }

    createUniverseScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        const universe = new Universe(this.progression);
        screen.innerHTML = `
            <div style="width: 100%; overflow-y: auto; flex: 1;">${universe.render()}</div>
            <div class="flex flex-col gap-md" style="width: 100%; max-width: 300px;">
                <button class="btn-primary btn-large" id="btn-start-session">▶️ Démarrer une session</button>
                <button class="btn-secondary" id="btn-back-home">⬅️ Retour</button>
            </div>
        `;
        screen.querySelector('#btn-start-session').addEventListener('click', () => this.startSession());
        screen.querySelector('#btn-back-home').addEventListener('click', () => this.show('home'));
        return screen;
    }

    createGameScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        if (!this.session) {
            screen.innerHTML = '<p>No session</p>';
            return screen;
        }
        const exercise = this.session.getCurrentExercise();
        if (!exercise) {
            screen.innerHTML = '<p>Session complete</p>';
            return screen;
        }
        screen.innerHTML = `
            <div class="flex flex-between" style="width: 100%; max-width: 500px; margin-bottom: 1rem;">
                <span class="text-sm text-text-light">Question ${this.session.currentIndex + 1}/${this.session.exercises.length}</span>
                <span class="text-sm font-bold">⭐ ${this.progression.getTotalStars()}</span>
            </div>
            <div class="question text-2xl font-bold mb-lg">${exercise.question}</div>
            <div id="animation-${exercise.animation}" class="animation-${exercise.animation} mb-2xl" style="min-height: 120px;"></div>
            <div class="input-area gap-md mb-lg">
                <input type="number" id="answer-input" placeholder="Réponse" autofocus style="font-size: 1.25rem; padding: 0.75rem;">
                <button class="btn-primary" id="btn-submit">✓</button>
            </div>
            <div id="feedback-container" style="min-height: 60px;"></div>
        `;
        const inputEl = screen.querySelector('#answer-input');
        const submitBtn = screen.querySelector('#btn-submit');
        const handleSubmit = () => {
            const answer = inputEl.value;
            if (!answer) return;
            const result = this.session.submitAnswer(answer);
            this.showFeedback(result, exercise);
            inputEl.disabled = true;
            submitBtn.disabled = true;
            setTimeout(() => {
                this.session.next();
                if (this.session.isComplete()) {
                    this.show('result', { results: this.session.getResults() });
                } else {
                    this.show('game');
                }
            }, 2000);
        };
        submitBtn.addEventListener('click', handleSubmit);
        inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSubmit(); });
        this.renderAnimation(exercise, screen);
        return screen;
    }

    renderAnimation(exercise, screen) {
        const container = screen.querySelector(`#animation-${exercise.animation}`);
        if (!container) return;
        switch (exercise.animation) {
            case 'blocks': this.renderBlocksAnimation(exercise, container); break;
            case 'duplication': this.renderDuplicationAnimation(exercise, container); break;
            case 'groups': this.renderGroupsAnimation(exercise, container); break;
        }
    }

    renderBlocksAnimation(exercise, container) {
        const [a, b] = exercise.operands;
        container.innerHTML = `
            <div style="display: flex; gap: 2rem; justify-content: center; align-items: flex-end;">
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-width: 150px;">
                    ${Array(a).fill('').map((_, i) => `<div class="block addition-first" style="animation-delay: ${i * 50}ms;"></div>`).join('')}
                </div>
                <div style="font-size: 1.5rem; font-weight: bold;">+</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-width: 150px;">
                    ${Array(b).fill('').map((_, i) => `<div class="block addition-second" style="animation-delay: ${(a + i) * 50}ms;"></div>`).join('')}
                </div>
            </div>
        `;
    }

    renderDuplicationAnimation(exercise, container) {
        const [a, b] = exercise.operands;
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 2rem; flex-wrap: wrap;">
                ${Array(b).fill('').map((_, i) => `<div style="font-size: 2rem; animation-delay: ${i * 200}ms;" class="double-item">${Array(a).fill('🍎').join('')}</div>`).join('')}
            </div>
        `;
    }

    renderGroupsAnimation(exercise, container) {
        const [a, b] = exercise.operands;
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem; justify-content: center; align-items: center;">
                ${Array(a).fill('').map((_, i) => `<div class="group" style="animation-delay: ${i * 100}ms;">${Array(b).fill('').map((_, j) => `<div class="group-item" style="animation-delay: ${(i * b + j) * 30}ms;">🍎</div>`).join('')}</div>`).join('')}
            </div>
        `;
    }

    showFeedback(result, exercise) {
        const feedbackDiv = document.querySelector('#feedback-container');
        if (!feedbackDiv) return;
        if (result.correct) {
            feedbackDiv.innerHTML = `<div class="feedback-success" style="text-align: center;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div><p class="text-lg font-bold">Bravo !</p></div>`;
        } else {
            feedbackDiv.innerHTML = `<div class="feedback-error" style="text-align: center;"><p class="text-sm mb-md">Pas cette fois-ci...</p><p class="text-lg font-bold">La réponse est ${result.answer}</p><p class="text-sm text-text-light mt-md">${this.engine.getExplanation(exercise)}</p></div>`;
        }
    }

    createResultScreen(data) {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        const results = data.results || { correct: 0, total: 0, starsEarned: 0 };
        const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
        screen.innerHTML = `
            <div class="text-center" style="width: 100%;">
                <div class="text-3xl mb-lg">${results.correct === results.total ? '🎉' : '✨'}</div>
                <h2 class="text-2xl font-bold mb-lg">Session complète !</h2>
                <div style="background: linear-gradient(135deg, rgba(106, 90, 205, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                    <p class="text-lg mb-md">${results.correct} / ${results.total} calculs réussis</p>
                    <p class="text-sm text-text-light mb-lg">${percentage}%</p>
                    ${results.starsEarned > 0 ? `<div style="font-size: 2rem; margin: 1rem 0;">${Array(results.starsEarned).fill('⭐').join('')}</div><p class="text-sm font-bold">+${results.starsEarned} étoiles !</p>` : ''}
                </div>
                <div class="flex flex-col gap-md" style="width: 100%; max-width: 300px;">
                    <button class="btn-primary btn-large" id="btn-next">▶️ Suivant</button>
                    <button class="btn-secondary" id="btn-home">🏠 Accueil</button>
                </div>
            </div>
        `;
        screen.querySelector('#btn-next').addEventListener('click', () => this.startSession());
        screen.querySelector('#btn-home').addEventListener('click', () => this.show('home'));
        return screen;
    }

    createParentScreen() {
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col gap-lg p-lg';
        const stats = this.progression.getStats();
        let skillsHtml = '';
        for (const [skillId, skillStats] of Object.entries(stats)) {
            const percent = skillStats.seen > 0 ? Math.round((skillStats.correct / skillStats.seen) * 100) : 0;
            const stars = this.getMasteryStars(skillStats);
            skillsHtml += `<div style="padding: 1rem; background: linear-gradient(135deg, rgba(106, 90, 205, 0.1) 0%, rgba(106, 90, 205, 0.05) 100%); border-radius: 8px;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;"><h3 class="font-bold">${skillStats.name}</h3><span>${stars}</span></div><p class="text-sm text-text-light">${percent}% maîtrisé • ${skillStats.seen} questions</p></div>`;
        }
        screen.innerHTML = `<div><h1 class="text-2xl font-bold mb-lg">📊 Progression</h1><div style="margin-bottom: 2rem;"><h2 class="text-lg font-bold mb-lg">Total: ⭐ ${this.progression.getTotalStars()}</h2></div><h3 class="text-lg font-bold mb-lg">Compétences</h3><div class="flex flex-col gap-md mb-2xl">${skillsHtml || '<p class="text-text-light">Aucune compétence encore</p>'}</div><button class="btn-secondary" id="btn-back-home">⬅️ Retour</button></div>`;
        screen.querySelector('#btn-back-home').addEventListener('click', () => this.show('home'));
        return screen;
    }

    getMasteryStars(stats) {
        const percent = stats.seen > 0 ? (stats.correct / stats.seen) * 100 : 0;
        if (percent >= 90) return '⭐⭐⭐';
        if (percent >= 70) return '⭐⭐☆';
        return '⭐☆☆';
    }

    startSession() {
        this.session = new Session(this.engine, this.progression);
        this.session.start();
        this.show('game');
    }
}
