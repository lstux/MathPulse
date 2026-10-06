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
        this.questionHint = null;     // {free: bool} si un coup de pouce a été pris sur la question courante
        this.hintsUsed = 0;
        this.completed = false;
        this.summary = null;
    }

    start() {
        this.skill = this.engine.selectSkillForSession();
        this.exercises = this.engine.generateSession(this.skill);
        this.currentIndex = 0;
        this.results = [];
        this.hintsUsed = 0;
        this.questionHint = null;
        this.completed = false;
        this.summary = null;
    }

    getCurrentExercise() {
        return this.exercises[this.currentIndex];
    }

    // À appeler quand la question est réellement affichée (le chrono ne tourne pas pendant la découverte)
    beginQuestion() {
        this.questionStart = Date.now();
        this.questionHint = null;
    }

    // ---------- Coups de pouce ----------
    freeHintsLeft() {
        return Math.max(0, HINTS.freePerSession - this.hintsUsed);
    }

    isOverHintQuota() {
        return this.hintsUsed > HINTS.freePerSession;
    }

    // Un seul coup de pouce par question ; le quota se consomme au moment où on le prend
    useHint() {
        if (!this.questionHint) {
            this.hintsUsed++;
            this.questionHint = { free: this.hintsUsed <= HINTS.freePerSession };
        }
        return this.questionHint;
    }

    submitAnswer(answer) {
        const exercise = this.getCurrentExercise();
        const timeMs = this.questionStart ? Date.now() - this.questionStart : 0;
        const correct = this.engine.validateAnswer(exercise, answer);
        const hint = this.questionHint;
        // Une réponse aidée hors quota ne compte pas dans la maîtrise
        const countedForMastery = !(hint && !hint.free);
        this.results.push({
            key: exercise.key, question: exercise.question, answer: String(answer),
            correct, time_ms: timeMs, hinted: !!hint, countedForMastery
        });
        if (countedForMastery) this.progression.recordAnswer(this.skill, correct, timeMs);
        return { correct, answer: exercise.answer, countedForMastery };
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
        const baseStars = starsForScore(correct);
        const capped = this.isOverHintQuota() && baseStars > HINTS.maxStarsOverQuota;
        const starsEarned = capped ? HINTS.maxStarsOverQuota : baseStars;
        const before = this.progression.getTotalStars();
        const after = this.progression.addStars(starsEarned);
        const newPlanets = PLANETS.filter(p => before < p.unlockAt && after >= p.unlockAt);

        this.summary = {
            skill: this.skill, correct, total, starsEarned,
            hintsUsed: this.hintsUsed, capped,
            totalStars: after, newPlanets,
            avgTime: total ? this.results.reduce((s, r) => s + r.time_ms, 0) / total : 0
        };
        storage.append(storage.KEYS.SESSION_HISTORY, {
            at: new Date().toISOString(), skill: this.skill, correct, total, starsEarned, hintsUsed: this.hintsUsed
        });
        this.completed = true;
        return this.summary;
    }
}
