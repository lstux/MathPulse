// MathPulse - Session Management

class Session {
    constructor(engine, progression) {
        this.engine = engine;
        this.progression = progression;
        this.exercises = [];
        this.currentIndex = 0;
        this.results = [];
        this.startTime = null;
        this.skill = null;
    }

    start() {
        this.skill = this.engine.selectSkillForSession();
        this.exercises = this.engine.generateExercise(this.skill, 5);
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.results = [];
    }

    getCurrentExercise() {
        return this.exercises[this.currentIndex];
    }

    submitAnswer(answer) {
        const exercise = this.getCurrentExercise();
        const isCorrect = this.engine.validateAnswer(exercise, answer);
        const timeMs = Date.now() - this.startTime;

        this.results.push({
            exercise: exercise,
            answer: answer,
            correct: isCorrect,
            time_ms: timeMs
        });

        // Record in progression
        this.progression.recordAnswer(this.skill, isCorrect, timeMs);

        return {
            correct: isCorrect,
            answer: exercise.answer
        };
    }

    next() {
        this.currentIndex++;
    }

    isComplete() {
        return this.currentIndex >= this.exercises.length;
    }

    getResults() {
        const correct = this.results.filter(r => r.correct).length;
        const total = this.results.length;
        const avgTime = this.results.reduce((sum, r) => sum + r.time_ms, 0) / total;

        return {
            skill: this.skill,
            correct: correct,
            total: total,
            percentage: (correct / total * 100).toFixed(0),
            avgTime: avgTime,
            starsEarned: Math.floor(correct / 2), // 1-2 stars per session
            results: this.results
        };
    }

    renderCurrentGame() {
        const exercise = this.getCurrentExercise();
        if (!exercise) return '';

        let html = `
            <div class="game-board">
                <div class="text-center">
                    <p class="text-sm text-text-light mb-md">${this.currentIndex + 1} / ${this.exercises.length}</p>
                </div>

                <div class="question">${exercise.question}</div>

                <div id="animation-container" class="animation-${exercise.animation} mb-2xl"></div>

                <div class="input-area">
                    <input type="number" id="answer-input" placeholder="Réponse" autofocus>
                    <button class="btn-primary" id="btn-submit">✓</button>
                </div>
            </div>
        `;

        return html;
    }
}
