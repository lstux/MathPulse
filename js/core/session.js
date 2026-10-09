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
        this.firstInputAt = null;     // premier chiffre tapé / première réponse choisie (fin de la réflexion)
        this.abandoned = false;
        this.questionHint = null;     // {free: bool} si un coup de pouce a été pris sur la question courante
        this.hintsUsed = 0;
        this.cleared = 0;
        this.completed = false;
        this.rapid = false;
        this.summary = null;
    }

    // start({ rapid: true }) : série rapide (5 calculs enchaînés, sans coup de pouce ni calcul à revoir)
    start(options = {}) {
        this.rapid = !!options.rapid;
        if (this.rapid) {
            this.skill = 'rapid';
            this.exercises = this.engine.generateRapid();
        } else {
            this.skill = options.skill || this.engine.selectSkillForSession();   // `skill` : mode test
            this.exercises = this.engine.generateSession(this.skill);
            this.progression.markAsked(this.exercises.filter(e => e.review).map(e => e.key));
        }
        this.cleared = 0;
        this.currentIndex = 0;
        this.results = [];
        this.hintsUsed = 0;
        this.questionHint = null;
        this.completed = false;
        this.abandoned = false;
        this.summary = null;
    }

    getCurrentExercise() {
        return this.exercises[this.currentIndex];
    }

    // À appeler quand la question est réellement affichée (le chrono ne tourne pas pendant la découverte)
    beginQuestion() {
        this.questionStart = Date.now();
        this.firstInputAt = null;
        this.questionHint = null;
    }

    // À appeler au premier chiffre tapé : la réflexion est finie, la suite n'est que de la saisie
    noteInput(now = Date.now()) {
        if (this.questionStart && this.firstInputAt === null) this.firstInputAt = now;
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
        const now = Date.now();
        const timeMs = this.questionStart ? now - this.questionStart : 0;
        // Maîtrise : temps de réflexion (jusqu'au premier chiffre tapé), pas la dextérité sur le pavé
        const thinkMs = this.questionStart && this.firstInputAt !== null ? this.firstInputAt - this.questionStart : timeMs;
        const correct = this.engine.validateAnswer(exercise, answer);
        const hint = this.questionHint;
        // Une réponse aidée hors quota ne compte pas dans la maîtrise
        const countedForMastery = !(hint && !hint.free);
        this.results.push({
            key: exercise.key, question: exercise.question, answer: String(answer),
            correct, time_ms: timeMs, think_ms: thinkMs, hinted: !!hint, countedForMastery,
            review: !!exercise.review, recall: !!exercise.recall
        });
        // La maîtrise va à la compétence de l'exercice (un calcul à revoir peut venir d'une autre compétence)
        if (countedForMastery) this.progression.recordAnswer(exercise.skill, correct, thinkMs);
        const reviewOutcome = this.progression.noteResult(exercise, correct, !!hint);
        if (reviewOutcome === 'cleared') this.cleared++;
        const fast = correct && thinkMs <= RAPID.fastMs;
        this.results[this.results.length - 1].fast = fast;
        return { correct, answer: exercise.answer, countedForMastery, reviewOutcome, fast };
    }

    next() {
        this.currentIndex++;
    }

    // Étoiles bonus d'une série rapide : 1⭐ pour 5/5, 1⭐ si au moins 4 réponses rapides. Plafonné par jour.
    static rapidStars(correct, total, fast) {
        return (correct === total ? 1 : 0) + (fast >= total - 1 ? 1 : 0);
    }

    completeRapid() {
        const total = this.results.length;
        const correct = this.results.filter(r => r.correct).length;
        const fast = this.results.filter(r => r.fast).length;
        const today = new Date().toDateString();
        const history = storage.get(storage.KEYS.SESSION_HISTORY) || [];
        const rewardedToday = history.filter(h => h.rapid && h.rewarded && new Date(h.at).toDateString() === today).length;
        const rewarded = rewardedToday < RAPID.maxRewardedPerDay;
        const starsEarned = rewarded ? Session.rapidStars(correct, total, fast) : 0;
        const before = this.progression.getTotalStars();
        const after = this.progression.addStars(starsEarned);
        const newPlanets = PLANETS.filter(p => before < p.unlockAt && after >= p.unlockAt);

        this.summary = {
            rapid: true, skill: 'rapid', correct, total, fast, starsEarned, rewarded,
            hintsUsed: 0, capped: false, reviewed: 0, cleared: 0, totalStars: after, newPlanets,
            avgTime: total ? this.results.reduce((sum, r) => sum + r.think_ms, 0) / total : 0
        };
        storage.append(storage.KEYS.SESSION_HISTORY, {
            at: new Date().toISOString(), skill: 'rapid', rapid: true, rewarded, correct, total, fast, starsEarned,
            hintsUsed: 0,
            answers: this.results.map(r => ({ q: r.question, ok: r.correct, think_ms: r.think_ms, total_ms: r.time_ms, fast: !!r.fast }))
        });
        this.completed = true;
        return this.summary;
    }

    // Session quittée avant la fin (✕) : on garde une trace pour comprendre où l'enfant décroche
    abandon() {
        if (this.completed || this.abandoned || !this.skill) return;
        this.abandoned = true;
        storage.append(storage.KEYS.SESSION_HISTORY, {
            at: new Date().toISOString(), skill: this.skill, abandoned: true,
            answered: this.results.length, total: this.exercises.length, hintsUsed: this.hintsUsed,
            at_question: this.currentIndex + 1
        });
    }

    isComplete() {
        return this.currentIndex >= this.exercises.length;
    }

    // Finalise la session une seule fois : crédite les étoiles et archive l'historique
    complete() {
        if (this.completed) return this.summary;
        if (this.rapid) return this.completeRapid();
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
            reviewed: this.exercises.filter(e => e.review).length, cleared: this.cleared,
            totalStars: after, newPlanets,
            avgTime: total ? this.results.reduce((s, r) => s + r.time_ms, 0) / total : 0
        };
        storage.append(storage.KEYS.SESSION_HISTORY, {
            at: new Date().toISOString(), skill: this.skill, correct, total, starsEarned, hintsUsed: this.hintsUsed,
            // journal d'usage : une ligne par question (temps de réflexion et temps total, aide, revue/rappel)
            answers: this.results.map(r => ({ q: r.question, ok: r.correct, think_ms: r.think_ms, total_ms: r.time_ms,
                hinted: r.hinted, review: r.review, recall: r.recall }))
        });
        this.completed = true;
        return this.summary;
    }
}
