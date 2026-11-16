// MathPulse - Suivi de progression
// Deux notions distinctes :
//  - maîtrise d'une compétence (niveau 1-3, affichée ⭐⭐⭐ sur les cartes)
//  - étoiles de récompense (totalStars), gagnées en fin de session, qui font avancer la fusée

const DATA_VERSION = 2;
const MASTERY_STATES = ['vu', 'compris', 'durable'];

class Progression {
    constructor() {
        this.data = { version: DATA_VERSION, skills: {}, totalStars: 0, discovered: {}, errors: {}, chaptersSeen: {}, missions: {}, mastery: {}, reviews: [] };
    }

    load() {
        const saved = storage.get(storage.KEYS.PROGRESSION) || {};
        this.data = {
            version: DATA_VERSION,   // version du format des données (v1 → v2 : missions, mastery, reviews ajoutés ; rien n'est retiré)
            skills: this.migrateSkills(saved.skills || {}),
            totalStars: Number.isFinite(saved.totalStars) ? saved.totalStars : 0,
            discovered: saved.discovered || {},
            errors: saved.errors || {},   // calculs à revoir, indexés par exercise.key
            chaptersSeen: saved.chaptersSeen || {},   // scènes d'histoire déjà lues { idDuChapitre: true }
            missions: saved.missions || {},   // v2 : { idMission: { runs, lastAt, understood, unaided, reused } }
            mastery: saved.mastery || {},     // v2 : { idCompétence: { state: 'vu' | 'compris' | 'durable', strategies: { id: état } } }
            reviews: Array.isArray(saved.reviews) ? saved.reviews : []   // v2 : rappels espacés (phase 2c)
        };
        if ((saved.version || 1) < 2) this.seedMastery();
    }

    // Migration v1 → v2 : état de départ prudent, déduit des niveaux v1 (niveau 3 → « compris », jamais « durable »)
    seedMastery() {
        Object.keys(this.data.skills).forEach(id => {
            if (!this.data.mastery[id]) this.data.mastery[id] = { state: this.data.skills[id].mastery_level >= 3 ? 'compris' : 'vu', strategies: {} };
        });
    }

    // Un état ne régresse jamais d'un coup (un échec programmera un rappel plus proche : phase 2c)
    raiseState(current, wanted) {
        return MASTERY_STATES.indexOf(wanted) > MASTERY_STATES.indexOf(current || '') ? wanted : current;
    }

    getMastery(skillId) {
        return this.data.mastery[skillId] || null;
    }

    getMission(missionId) {
        return this.data.missions[missionId] || null;
    }

    // Fin de mission (résumé de MissionRun.complete) : la mission est « vue » ; la stratégie est « comprise » si le défi est réussi.
    // Le passage de la compétence à « compris » / « durable » demande des preuves variées et des rappels : phase 2c.
    recordMission(summary) {
        const m = this.data.missions[summary.mission] || { runs: 0 };
        this.data.missions[summary.mission] = {
            runs: m.runs + 1, lastAt: summary.at,
            understood: !!(m.understood || summary.understood),
            unaided: !!(m.unaided || summary.unaided),
            reused: !!(m.reused || summary.reused)
        };
        if (summary.skill) {
            const ma = this.data.mastery[summary.skill] || (this.data.mastery[summary.skill] = { state: 'vu', strategies: {} });
            ma.state = this.raiseState(ma.state, 'vu');
            if (summary.strategy) ma.strategies[summary.strategy] = this.raiseState(ma.strategies[summary.strategy], summary.understood ? 'compris' : 'vu');
        }
        this.save();
    }

    migrateSkills(skills) {
        Object.values(skills).forEach(sk => this.ensureRecent(sk));
        return skills;
    }

    save() {
        storage.set(storage.KEYS.PROGRESSION, this.data);
    }

    recordAnswer(skillId, correct, timeMs) {
        if (!this.data.skills[skillId]) {
            this.data.skills[skillId] = {
                seen: 0, correct: 0, wrong: 0,
                avg_time_ms: 0, mastery_level: 1, last_practiced: null, recent: []
            };
        }
        const skill = this.data.skills[skillId];
        this.ensureRecent(skill);
        const t = Math.min(Math.max(0, timeMs), MASTERY.maxCountedMs);

        // Totaux sur toute la vie de la compétence (historique, espace parent)
        skill.seen++;
        if (correct) skill.correct++; else skill.wrong++;
        skill.avg_time_ms = (skill.avg_time_ms * (skill.seen - 1) + t) / skill.seen;
        skill.last_practiced = new Date().toISOString();

        // Fenêtre glissante : c'est elle qui décide de la maîtrise
        skill.recent.push({ c: correct ? 1 : 0, t });
        if (skill.recent.length > MASTERY.window) skill.recent.splice(0, skill.recent.length - MASTERY.window);
        skill.mastery_level = this.computeMastery(skill, skillId);

        this.save();
        return skill;
    }

    // Recalcule la maîtrise de toutes les compétences (après activation / désactivation du mode test)
    recomputeAll() {
        Object.entries(this.data.skills).forEach(([id, s]) => { s.mastery_level = this.computeMastery(s, id); });
        this.save();
    }

    // Données d'avant la fenêtre glissante : on la reconstitue à partir des totaux (proportions, temps moyen)
    ensureRecent(skill) {
        if (Array.isArray(skill.recent)) return;
        const n = Math.min(skill.seen || 0, MASTERY.window);
        const right = skill.seen ? Math.round(n * skill.correct / skill.seen) : 0;
        skill.recent = Array.from({ length: n }, (_, i) => ({ c: i < right ? 1 : 0, t: skill.avg_time_ms || 0 }));
    }

    // Réussite et temps moyen sur les dernières réponses
    windowStats(skill) {
        this.ensureRecent(skill);
        const n = skill.recent.length;
        const correct = skill.recent.reduce((sum, r) => sum + r.c, 0);
        return {
            n, correct,
            accuracy: n ? (correct / n) * 100 : 0,
            avgMs: n ? skill.recent.reduce((sum, r) => sum + r.t, 0) / n : 0
        };
    }

    computeMastery(skill, skillId) {
        const w = this.windowStats(skill);
        const M = Cheat.mastery();   // seuils réduits en mode test
        const l3 = M.level3, l2 = M.level2;
        const maxAvgMs = Cheat.isOn() ? Infinity : (SKILLS[skillId] && SKILLS[skillId].maxAvgMs) || l3.maxAvgMs;   // seuil propre à la compétence, sinon général
        if (w.n >= l3.minSeen && w.accuracy >= l3.minAccuracy && w.avgMs <= maxAvgMs) return 3;
        if (w.n >= l2.minSeen && w.accuracy >= l2.minAccuracy) return 2;
        return 1;
    }

    // ---------- Calculs à revoir ----------
    // Une erreur est mémorisée avec sa série de réussites (streak). Une réussite sans coup de pouce
    // fait avancer la série ; une nouvelle erreur la remet à zéro. À REVIEW.clearAfter, le calcul est acquis.
    // Retourne 'added' | 'cleared' | 'progress' | null (rien à signaler).
    noteResult(exercise, correct, hinted = false) {
        const errors = this.data.errors;
        const now = new Date().toISOString();
        let outcome = null;

        if (!correct) {
            const prev = errors[exercise.key];
            errors[exercise.key] = {
                skill: exercise.skill, type: exercise.type, operands: exercise.operands,
                wrong: (prev ? prev.wrong : 0) + 1, streak: 0, last_wrong: now,
                last_asked: prev ? prev.last_asked : null
            };
            outcome = 'added';
            // Plafond de stockage : on oublie les plus anciennes erreurs
            const keys = Object.keys(errors);
            if (keys.length > REVIEW.maxStored) {
                keys.sort((a, b) => errors[a].last_wrong.localeCompare(errors[b].last_wrong))
                    .slice(0, keys.length - REVIEW.maxStored).forEach(k => delete errors[k]);
            }
        } else if (errors[exercise.key] && !hinted) {
            errors[exercise.key].streak++;
            if (errors[exercise.key].streak >= REVIEW.clearAfter) { delete errors[exercise.key]; outcome = 'cleared'; }
            else outcome = 'progress';
        }
        this.save();
        return outcome;
    }

    // Calculs à revoir, ceux posés le moins récemment en premier
    getPendingErrors() {
        return Object.entries(this.data.errors)
            .map(([key, e]) => ({ key, ...e }))
            .filter(e => SKILLS[e.skill])
            .sort((a, b) => (a.last_asked || '').localeCompare(b.last_asked || '') || a.last_wrong.localeCompare(b.last_wrong));
    }

    markAsked(keys) {
        const now = new Date().toISOString();
        keys.forEach(k => { if (this.data.errors[k]) this.data.errors[k].last_asked = now; });
        this.save();
    }

    addStars(count) {
        this.data.totalStars += Math.max(0, count);
        this.save();
        return this.data.totalStars;
    }

    getTotalStars() {
        return this.data.totalStars;
    }

    getSkillStats(skillId) {
        return this.data.skills[skillId] || null;
    }

    // Niveau de maîtrise : 0 = jamais pratiquée
    getMasteryLevel(skillId) {
        const s = this.data.skills[skillId];
        return s ? s.mastery_level : 0;
    }

    getStats() {
        const stats = {};
        for (const [skillId, skillData] of Object.entries(this.data.skills)) {
            stats[skillId] = { name: SKILLS[skillId] ? SKILLS[skillId].name : skillId, ...skillData };
        }
        return stats;
    }

    hasSeenChapter(chapterId) {
        return !!this.data.chaptersSeen[chapterId];
    }

    markChapterSeen(chapterId) {
        this.data.chaptersSeen[chapterId] = true;
        this.save();
    }

    hasSeenDiscovery(skillId) {
        return !!this.data.discovered[skillId];
    }

    markDiscovery(skillId) {
        this.data.discovered[skillId] = true;
        this.save();
    }

    reset() {
        storage.resetAll();
        this.load();
    }
}
