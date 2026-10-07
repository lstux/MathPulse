// MathPulse - Moteur : choix de la compétence, génération d'exercices, validation
// Dépend de : skills.js (SKILLS, SKILL_ORDER)

class Engine {
    constructor(progression) {
        this.progression = progression;
    }

    // ---------- Choix de la compétence ----------
    // Priorité : maîtrise la plus basse, puis pratiquée il y a le plus longtemps, puis ordre du catalogue.
    selectSkillForSession() {
        const ranked = SKILL_ORDER.map((id, order) => {
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
        // Calculs ratés à revoir : placés aux questions 2 et 4 (la première et la dernière restent « fraîches »)
        const reviews = this.pickReviews();
        const reviewSlots = new Set();
        for (let i = skill.plan.length - 2, n = 0; n < reviews.length && i >= 0; i -= 2, n++) reviewSlots.add(i);

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
        let a, b;
        switch (skillId) {
            case 'addition-simple': a = this.randInt(1, 9); b = this.randInt(1, 9); break;
            case 'multiply-2': a = this.randInt(1, 10); b = 2; break;
            case 'multiply-5': a = this.randInt(1, 10); b = 5; break;
            default: throw new Error(`Compétence inconnue : ${skillId}`);
        }
        return this.buildExercise(skillId, type, a, b);
    }

    buildExercise(skillId, type, a, b) {
        const op = SKILLS[skillId].operation;
        const total = op === '+' ? a + b : a * b;
        const ex = {
            skill: skillId, type, operation: op,
            operands: [a, b], total,
            animation: SKILLS[skillId].animation,
            key: `${op}:${a}:${b}`          // sert à éviter les doublons dans une session
        };

        if (type === 'missing') {
            // le nombre manquant est le premier opérande en ×, le second en +
            const hidden = op === '+' ? b : a;
            ex.answer = hidden;
            ex.question = op === '+' ? `${a} + ? = ${total}` : `? × ${b} = ${total}`;
            ex.choices = this.makeChoices(hidden, [-3, -2, -1, 1, 2, 3]);
        } else if (type === 'multiple') {
            ex.answer = total;
            ex.question = `${a} ${op} ${b} = ?`;
            ex.choices = this.makeChoices(total, op === '×' ? [-10, -5, 5, 10, -1, 1, 2] : [-2, -1, 1, 2, 3]);
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
