// MathPulse - Moteur : choix de la compétence, génération d'exercices, validation
// Dépend de : skills.js (SKILLS, SKILL_ORDER)

class Engine {
    constructor(progression) {
        this.progression = progression;
    }

    // ---------- Choix de la compétence ----------
    // Priorité : maîtrise la plus basse, puis pratiquée il y a le plus longtemps, puis ordre du catalogue.
    // Une compétence est disponible quand son prérequis (autre compétence, niveau de maîtrise) est atteint
    isUnlocked(id) {
        const req = SKILLS[id] && SKILLS[id].requires;
        return !req || this.progression.getMasteryLevel(req.skill) >= req.level;
    }

    // ---------- Série rapide ----------
    rapidSkills() {
        return SKILL_ORDER.filter(id => this.progression.getMasteryLevel(id) >= RAPID.minLevel);
    }

    rapidAvailable() {
        return this.rapidSkills().length > 0;
    }

    // 5 calculs à saisie numérique, en alternant les compétences éligibles
    generateRapid() {
        const pool = this.rapidSkills();
        if (!pool.length) throw new Error('Aucune compétence éligible à la série rapide');
        const order = this.shuffle(pool);
        const exercises = [], seen = new Set();
        for (let i = 0; i < RAPID.length; i++) {
            let ex = null;
            for (let tries = 0; tries < 30; tries++) {
                ex = this.generateExercise(order[i % order.length], 'numeric');
                if (!seen.has(ex.key)) break;
            }
            seen.add(ex.key);
            exercises.push(ex);
        }
        return exercises;
    }

    selectSkillForSession() {
        const ranked = SKILL_ORDER.filter(id => this.isUnlocked(id)).map((id, order) => {
            const stats = this.progression.getSkillStats(id);
            return {
                id, order,
                level: this.progression.getMasteryLevel(id),
                last: stats && stats.last_practiced ? Date.parse(stats.last_practiced) : 0
            };
        });
        ranked.sort((a, b) => a.level - b.level || a.last - b.last || a.order - b.order);
        return ranked[0].id;
    }

    // ---------- Génération ----------
    generateSession(skillId) {
        const skill = SKILLS[skillId];
        if (!skill) throw new Error(`Compétence inconnue : ${skillId}`);
        // 40 % de la session reprend d'anciennes notions : d'abord les calculs ratés à revoir,
        // puis des rappels d'autres compétences déjà pratiquées. Placés aux questions 2 et 4
        // (la première et la dernière restent « fraîches »).
        const recalls = this.pickRecalls(skillId);
        const reviewSlots = new Set();
        for (let i = skill.plan.length - 2, n = 0; n < recalls.length && i >= 0; i -= 2, n++) reviewSlots.add(i);
        const reviews = recalls;

        const exercises = [];
        const seen = new Set(reviews.map(r => r.key));
        skill.plan.forEach((type, i) => {
            if (reviewSlots.has(i)) { exercises.push(reviews.shift()); return; }
            let ex = null;
            for (let tries = 0; tries < 30; tries++) {
                ex = this.generateExercise(skillId, type);
                if (!seen.has(ex.key)) break;
            }
            seen.add(ex.key);
            exercises.push(ex);
        });
        return exercises;
    }

    // Emplacements de rappel : calculs ratés d'abord, complétés par d'autres compétences déjà pratiquées
    pickRecalls(targetId) {
        const picked = this.pickReviews();
        const keys = new Set(picked.map(r => r.key));
        const others = SKILL_ORDER
            .filter(id => id !== targetId && this.progression.getSkillStats(id))
            .map(id => ({ id, level: this.progression.getMasteryLevel(id), last: Date.parse(this.progression.getSkillStats(id).last_practiced) || 0 }))
            .sort((a, b) => a.level - b.level || a.last - b.last);
        const total = Math.min(MIX.recallPerSession, 2);
        for (let i = 0; others.length && picked.length < total; i++) {
            let ex = null;
            for (let tries = 0; tries < 30; tries++) {
                ex = this.generateExercise(others[i % others.length].id, 'numeric');
                if (!keys.has(ex.key)) break;
            }
            keys.add(ex.key);
            ex.recall = true;
            picked.push(ex);
        }
        return picked;
    }

    // Reconstruit les exercices correspondant aux erreurs mémorisées (même opération, même type)
    pickReviews() {
        const max = Math.min(REVIEW.maxPerSession, 2);   // 2 emplacements possibles dans une session de 5
        return this.progression.getPendingErrors().slice(0, max).map(e => {
            const ex = this.buildExercise(e.skill, e.type, e.operands[0], e.operands[1]);
            ex.review = true;
            return ex;
        });
    }

    generateExercise(skillId, type = 'numeric') {
        const skill = SKILLS[skillId];
        if (!skill) throw new Error(`Compétence inconnue : ${skillId}`);
        let a, b;
        if (skill.factor) { a = this.randInt(1, 10); b = skill.factor; }          // table de multiplication : a × n
        else if (skill.divisor) { b = skill.divisor; a = this.randInt(1, 10) * b; }   // division exacte : a ÷ n
        else if (skillId === 'addition-simple') { a = this.randInt(1, 9); b = this.randInt(1, 9); }
        else if (skillId === 'subtract-simple') { a = this.randInt(3, 18); b = this.randInt(1, Math.min(9, a - 1)); }   // reste toujours ≥ 1
        else throw new Error(`Compétence inconnue : ${skillId}`);
        return this.buildExercise(skillId, type, a, b);
    }

    buildExercise(skillId, type, a, b) {
        const op = SKILLS[skillId].operation;
        const total = op === '+' ? a + b : op === '−' ? a - b : op === '÷' ? a / b : a * b;
        const ex = {
            skill: skillId, type, operation: op,
            operands: [a, b], total,
            animation: SKILLS[skillId].animation,
            key: `${op}:${a}:${b}`          // sert à éviter les doublons dans une session
        };

        if (type === 'missing') {
            // le nombre manquant est le premier opérande en × et en ÷, le second en + et en −
            const hidden = (op === '×' || op === '÷') ? a : b;
            ex.answer = hidden;
            ex.question = (op === '×' || op === '÷') ? `? ${op} ${b} = ${total}` : `${a} ${op} ? = ${total}`;
            ex.choices = this.makeChoices(hidden, op === '÷' ? [-2 * b, -b, b, 2 * b, -1, 1, 2] : [-3, -2, -1, 1, 2, 3]);
        } else if (type === 'multiple') {
            ex.answer = total;
            ex.question = `${a} ${op} ${b} = ?`;
            ex.choices = this.makeChoices(total, op === '÷' ? [-3, -2, -1, 1, 2, 3] : op === '×' ? (b === 10 ? [-20, -10, 10, 20, -1, 1, 100] : [-2 * b, -b, b, 2 * b, -1, 1, 2]) : [-2, -1, 1, 2, 3]);
        } else {
            ex.answer = total;
            ex.question = `${a} ${op} ${b} = ?`;
        }
        return ex;
    }

    // 4 choix distincts, > 0, dont la bonne réponse, mélangés
    makeChoices(answer, offsets, count = 4) {
        const pool = [...new Set(offsets.map(o => answer + o))].filter(n => n > 0 && n !== answer);
        const picked = this.shuffle(pool).slice(0, count - 1);
        for (let n = answer + 1; picked.length < count - 1; n++) {
            if (n !== answer && !picked.includes(n)) picked.push(n);
        }
        return this.shuffle([answer, ...picked]);
    }

    // ---------- Validation / explication ----------
    validateAnswer(exercise, answer) {
        const s = String(answer).trim();
        return /^\d+$/.test(s) && Number(s) === exercise.answer;
    }

    getExplanation(exercise) {
        const [a, b] = exercise.operands;
        const t = exercise.total;
        if (exercise.operation === '+') return `${a} et ${b} font ${t} ensemble.`;
        const custom = SKILLS[exercise.skill] && SKILLS[exercise.skill].explain;
        if (custom) return custom(a, b, t);
        if (exercise.operation === '−') return `Si on enlève ${b} de ${a}, il en reste ${t}.`;
        if (b === 10) return `Multiplier par 10, c'est ajouter un zéro : ${a} × 10 = ${t}.`;
        if (b === 2) return `Le double de ${a}, c'est ${a} + ${a} = ${t}.`;
        return `${a} groupes de ${b} font ${t}.`;
    }

    // ---------- Utilitaires ----------
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffle(list) {
        const arr = [...list];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
