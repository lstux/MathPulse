// MathPulse - Session de jeu (5 questions sur une compétence)

class Session {
    constructor(engine, progression) {
        this.engine = engine;
        this.progression = progression;
        this.skill = null;
        this.exercises = [];
        this.currentIndex = 0;
        this.results = [];
        this.questionStart = null;
        this.completed = false;
        this.summary = null;
    }

    start() {
        this.skill = this.engine.selectSkillForSession();
        this.exercises = this.engine.generateSession(this.skill);
        this.currentIndex = 0;
        this.results = [];
        this.completed = false;
        this.summary = null;
    }

    getCurrentExercise() {
        return this.exercises[this.currentIndex];
    }

    // À appeler quand la question est réellement affichée (le chrono ne tourne pas pendant la découverte)
    beginQuestion() {
        this.questionStart = Date.now();
    }

    submitAnswer(answer, hinted = false) {
        const exercise = this.getCurrentExercise();
        const timeMs = this.questionStart ? Date.now() - this.questionStart : 0;
        const correct = this.engine.validateAnswer(exercise, answer);
        this.results.push({ key: exercise.key, question: exercise.question, answer: String(answer), correct, time_ms: timeMs, hinted });
        this.progression.recordAnswer(this.skill, correct, timeMs);
        return { correct, answer: exercise.answer };
    }

    next() {
        this.currentIndex++;
    }

    isComplete() {
        return this.currentIndex >= this.exercises.length;
    }

    // Finalise la session une seule fois : crédite les étoiles et archive l'historique
    complete() {
        if (this.completed) return this.summary;
        const total = this.results.length;
        const correct = this.results.filter(r => r.correct).length;
        const starsEarned = starsForScore(correct);
        const before = this.progression.getTotalStars();
        const after = this.progression.addStars(starsEarned);
        const newPlanets = PLANETS.filter(p => before < p.unlockAt && after >= p.unlockAt);

        this.summary = {
            skill: this.skill, correct, total, starsEarned,
            totalStars: after, newPlanets,
            avgTime: total ? this.results.reduce((s, r) => s + r.time_ms, 0) / total : 0
        };
        storage.append(storage.KEYS.SESSION_HISTORY, {
            at: new Date().toISOString(), skill: this.skill, correct, total, starsEarned
        });
        this.completed = true;
        return this.summary;
    }
}
