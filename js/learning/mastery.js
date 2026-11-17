// MathPulse v2 - Maîtrise durable et rappels espacés (logique pure, sans DOM ; `data` = progression.data, `now` en millisecondes)
// Trois états par compétence, qui ne régressent jamais d'un coup :
//   vu      : la notion a été rencontrée (exercice ou mission)
//   compris : réussites SANS aide dans plusieurs formes d'exercice (réponse à taper, nombre manquant, choix, défi de mission)
//   durable : compris + réemploi dans plusieurs contextes + rappels réussis après plusieurs jours, puis plusieurs semaines
// Le temps de réponse ne joue aucun rôle ici (prendre son temps n'est pas un échec) : il reste dans les niveaux ⭐ de la v1.

const MASTERY_RULES = {
    understood: { minForms: 2, minPerForm: 2 },        // au moins 2 réussites sans aide dans au moins 2 formes
    durable: { minContexts: 2, gapsDays: [3, 14] },    // 2 contextes de réemploi ; un rappel réussi après ≥ 3 j et un autre après ≥ 14 j
    boxesDays: [1, 3, 7, 14, 30]                       // rappels espacés : délai avant le prochain rappel, par case
};
const DAY_MS = 24 * 3600 * 1000;

const Mastery = {
    entry(data, skillId) {
        const m = data.mastery[skillId] || (data.mastery[skillId] = { state: 'vu' });
        m.strategies = m.strategies || {};
        m.forms = m.forms || {};         // { forme: nombre de réussites sans aide }
        m.contexts = m.contexts || {};   // { contexte de réemploi: true }
        m.gaps = m.gaps || [];           // jours écoulés lors de chaque rappel réussi
        return m;
    },

    raise(current, wanted) {
        return MASTERY_STATES.indexOf(wanted) > MASTERY_STATES.indexOf(current || '') ? wanted : current;
    },

    isUnderstood(m) {
        const R = MASTERY_RULES.understood;
        return Object.values(m.forms).filter(n => n >= R.minPerForm).length >= R.minForms;
    },

    isDurable(m) {
        const R = MASTERY_RULES.durable;
        if (Object.keys(m.contexts).length < R.minContexts) return false;
        // chaque seuil doit être couvert par un rappel différent (le plus long d'abord)
        const gaps = [...m.gaps].sort((a, b) => b - a);
        return [...R.gapsDays].sort((a, b) => b - a).every((need, i) => gaps[i] !== undefined && gaps[i] >= need);
    },

    refresh(m) {
        if (this.isUnderstood(m)) m.state = this.raise(m.state, 'compris');
        if (MASTERY_STATES.indexOf(m.state) >= 1 && this.isDurable(m)) m.state = this.raise(m.state, 'durable');
        return m.state;
    },

    // Une réponse à un exercice. opts : { aided (coup de pouce), context : 'session' | 'recall' | 'rapid' | 'free' }
    // Réemploi = la notion revient ailleurs que dans sa propre session (rappel, série rapide, série libre, mission).
    recordExercise(data, exercise, correct, opts = {}, now = Date.now()) {
        const m = this.entry(data, exercise.skill);
        const unaided = correct && !opts.aided;
        if (unaided) {
            m.forms[exercise.type] = (m.forms[exercise.type] || 0) + 1;
            if (opts.context && opts.context !== 'session') m.contexts[opts.context] = true;
        }
        const gap = Scheduler.result(data, exercise.skill, correct, !!opts.aided, now);
        if (gap !== null) m.gaps.push(gap);
        return this.refresh(m);
    },

    // Fin de mission : le défi réussi du premier coup compte comme une forme, le réemploi réussi comme un contexte
    recordMission(data, summary, now = Date.now()) {
        if (!summary.skill) return null;
        const m = this.entry(data, summary.skill);
        if (summary.unaided) m.forms.mission = (m.forms.mission || 0) + 1;
        if (summary.reused) m.contexts[`mission:${summary.mission}`] = true;
        if (summary.strategy) m.strategies[summary.strategy] = this.raise(m.strategies[summary.strategy], summary.understood ? 'compris' : 'vu');
        Scheduler.ensure(data, summary.skill, now);
        return this.refresh(m);
    }
};

// Rappels espacés (cases de Leitner). Un rappel réussi fait avancer d'une case ; un échec recule d'une case : le rappel suivant revient plus vite.
const Scheduler = {
    get(data, skillId) {
        return data.reviews.find(r => r.skill === skillId) || null;
    },

    ensure(data, skillId, now) {
        let r = this.get(data, skillId);
        if (!r) { r = { skill: skillId, box: 0, setAt: now, dueAt: now + MASTERY_RULES.boxesDays[0] * DAY_MS }; data.reviews.push(r); }
        return r;
    },

    // Compétences dont le rappel est arrivé à échéance, la plus en retard d'abord
    due(data, now = Date.now()) {
        return data.reviews.filter(r => r.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt).map(r => r.skill);
    },

    // Une réponse sur la compétence. Si un rappel était dû : il est noté et reprogrammé.
    // Retourne le nombre de jours écoulés depuis la programmation si le rappel est réussi sans aide, sinon null.
    result(data, skillId, correct, aided, now) {
        const r = this.ensure(data, skillId, now);
        if (r.dueAt > now || (correct && aided)) return null;   // pas dû, ou réussi avec aide : ni preuve ni échec
        const B = MASTERY_RULES.boxesDays;
        const gap = Math.floor((now - r.setAt) / DAY_MS);
        r.box = correct ? Math.min(r.box + 1, B.length - 1) : Math.max(r.box - 1, 0);
        r.setAt = now;
        r.dueAt = now + B[r.box] * DAY_MS;
        return correct ? gap : null;
    }
};
