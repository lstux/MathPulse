// MathPulse v2 - Déroulement d'une mission (logique pure, sans DOM : testée dans tests/engine.test.js)
// Dépend de : missions.js (MISSION_RULES), diagnosis.js (Diagnosis), progression.js (recordMission)

const MISSION_ANSWER_STEPS = ['problem', 'challenge', 'transfer'];

class MissionRun {
    constructor(mission, progression) {
        if (!mission || !Array.isArray(mission.steps) || !mission.steps.length) throw new Error('Mission invalide');
        this.mission = mission;
        this.progression = progression;
        this.index = 0;
        this.results = {};      // par id d'étape : { attempts, correct, firstTry, answers: [] }
        this.summary = null;
    }

    get step() { return this.mission.steps[this.index]; }

    expectsAnswer(step = this.step) { return !!step && MISSION_ANSWER_STEPS.includes(step.type); }

    expected(step = this.step) {
        const [a, b] = step.operands, op = step.op || '+';
        return op === '+' ? a + b : op === '−' ? a - b : op === '÷' ? a / b : a * b;
    }

    // Retour : { correct, attempts, done, feedback, help }
    //   help (réponse fausse) : { error, level, text, visual } = diagnostic et piste adaptée (voir diagnosis.js)
    //   feedback : 'ok' | 'retry' (réessaie) | 'hint' (indice) | 'explain' (on revoit l'explication, l'étape est close)
    //   problem  : toute réponse clôt l'étape (on découvre avant d'expliquer : l'erreur mène à l'explication, pas à une sanction)
    answer(value) {
        const step = this.step;
        if (!this.expectsAnswer(step)) throw new Error(`L'étape « ${step.type} » n'attend pas de réponse`);
        const r = this.results[step.id] || (this.results[step.id] = { attempts: 0, correct: false, firstTry: false, answers: [], errors: [] });
        if (r.done) return { correct: r.correct, attempts: r.attempts, done: true, feedback: r.correct ? 'ok' : 'explain' };
        const n = Number(value), correct = n === this.expected(step);
        r.attempts++; r.answers.push(n);
        if (correct) { r.correct = true; r.firstTry = r.attempts === 1; }
        const help = correct ? null : Diagnosis.feedback(step.op || '+', step.operands[0], step.operands[1], n, r.attempts);
        if (help && help.error) r.errors.push(help.error);
        const exhausted = r.attempts >= MISSION_RULES.maxAttempts;
        r.done = correct || step.type === 'problem' || exhausted;
        const feedback = correct ? 'ok' : (step.type === 'problem' || exhausted) ? 'explain' : r.attempts === 1 ? 'retry' : 'hint';
        return { correct, attempts: r.attempts, done: r.done, feedback, help };
    }

    // Manipulation terminée (but atteint). info : { moves, hinted }
    explored(info = {}) {
        const step = this.step;
        if (step.type !== 'explore') throw new Error(`L'étape « ${step.type} » n'est pas une manipulation`);
        this.results[step.id] = { attempts: 0, correct: true, firstTry: !info.hinted, answers: [], errors: [], done: true, moves: info.moves || 0, hinted: !!info.hinted };
        return this.results[step.id];
    }

    canAdvance() {
        const needsDone = this.expectsAnswer() || this.step.type === 'explore';   // une manipulation se termine quand son but est atteint
        return !needsDone || !!(this.results[this.step.id] && this.results[this.step.id].done);
    }

    next() {
        if (!this.canAdvance()) return false;
        this.index++;
        return true;
    }

    isComplete() { return this.index >= this.mission.steps.length; }

    // Dernière explication vue avant l'étape courante (pour « revoir l'explication »)
    lastExplain() {
        for (let i = Math.min(this.index, this.mission.steps.length - 1); i >= 0; i--) {
            if (this.mission.steps[i].type === 'explain') return this.mission.steps[i];
        }
        return null;
    }

    // Preuves : toutes les étapes listées réussies ; « sans aide » = du premier coup
    complete() {
        if (this.summary) return this.summary;
        const ev = this.mission.evidence || {};
        const all = (ids, key) => !!(ids && ids.length) && ids.every(id => this.results[id] && this.results[id][key]);
        this.summary = {
            mission: this.mission.id, skill: this.mission.skill, strategy: this.mission.strategy,
            at: new Date().toISOString(),
            discovered: !!(this.results.problem && this.results.problem.correct),   // avait trouvé seul, avant l'explication
            understood: all(ev.understood, 'correct'),
            unaided: all(ev.understood, 'firstTry'),
            reused: all(ev.reused, 'correct'),
            errors: Object.values(this.results).flatMap(r => r.errors),   // types d'erreurs reconnus pendant la mission
            steps: Object.fromEntries(Object.entries(this.results).map(([id, r]) => [id, { attempts: r.attempts, correct: r.correct }]))
        };
        if (this.progression) this.progression.recordMission(this.summary);
        return this.summary;
    }
}
