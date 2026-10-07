// MathPulse - Suivi de progression
// Deux notions distinctes :
//  - maîtrise d'une compétence (niveau 1-3, affichée ⭐⭐⭐ sur les cartes)
//  - étoiles de récompense (totalStars), gagnées en fin de session, qui font avancer la fusée

class Progression {
    constructor() {
        this.data = { version: 1, skills: {}, totalStars: 0, discovered: {}, errors: {} };
    }

    load() {
        const saved = storage.get(storage.KEYS.PROGRESSION) || {};
        this.data = {
            version: 1,   // version du format des données (pour les futures migrations)
            skills: saved.skills || {},
            totalStars: Number.isFinite(saved.totalStars) ? saved.totalStars : 0,
            discovered: saved.discovered || {},
            errors: saved.errors || {}   // calculs à revoir, indexés par exercise.key
        };
    }

    save() {
        storage.set(storage.KEYS.PROGRESSION, this.data);
    }

    recordAnswer(skillId, correct, timeMs) {
        if (!this.data.skills[skillId]) {
            this.data.skills[skillId] = {
                seen: 0, correct: 0, wrong: 0,
                avg_time_ms: 0, mastery_level: 1, last_practiced: null
            };
        }
        const skill = this.data.skills[skillId];
        const t = Math.min(Math.max(0, timeMs), MASTERY.maxCountedMs);

        skill.seen++;
        if (correct) skill.correct++; else skill.wrong++;
        skill.avg_time_ms = (skill.avg_time_ms * (skill.seen - 1) + t) / skill.seen;
        skill.last_practiced = new Date().toISOString();
        skill.mastery_level = this.computeMastery(skill);

        this.save();
        return skill;
    }

    computeMastery(skill) {
        const accuracy = skill.seen > 0 ? (skill.correct / skill.seen) * 100 : 0;
        const l3 = MASTERY.level3, l2 = MASTERY.level2;
        if (skill.seen >= l3.minSeen && accuracy >= l3.minAccuracy && skill.avg_time_ms <= l3.maxAvgMs) return 3;
        if (skill.seen >= l2.minSeen && accuracy >= l2.minAccuracy) return 2;
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
