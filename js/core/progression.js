// MathPulse - Progression Tracking System

class Progression {
    constructor() {
        this.data = null;
        this.stars = 0;
        this.skills = {};
    }

    load() {
        this.data = storage.get(storage.KEYS.PROGRESSION) || { skills: {} };
        this.calculateStats();
    }

    save() {
        storage.set(storage.KEYS.PROGRESSION, this.data);
    }

    calculateStats() {
        this.stars = 0;
        // Calculate total stars from all skills
        for (const skill of Object.values(this.data.skills || {})) {
            if (skill.mastery_level) {
                this.stars += Math.max(0, skill.mastery_level - 1);
            }
        }
    }

    recordAnswer(skillId, correct, timeMs) {
        if (!this.data.skills[skillId]) {
            this.data.skills[skillId] = {
                seen: 0,
                correct: 0,
                wrong: 0,
                avg_time_ms: 0,
                mastery_level: 1,
                last_practiced: null
            };
        }

        const skill = this.data.skills[skillId];
        skill.seen++;
        if (correct) {
            skill.correct++;
        } else {
            skill.wrong++;
        }
        skill.avg_time_ms = (skill.avg_time_ms * (skill.seen - 1) + timeMs) / skill.seen;
        skill.last_practiced = new Date().toISOString();

        // Update mastery level
        this.updateMastery(skillId);
        this.save();
        this.calculateStats();

        return skill;
    }

    updateMastery(skillId) {
        const skill = this.data.skills[skillId];
        if (!skill) return;

        const correctPercent = (skill.correct / skill.seen) * 100;
        const fastEnough = skill.avg_time_ms < 3000;

        // Level 1: Seen (default)
        // Level 2: 70%+ correct + min 3 seen
        // Level 3: 90%+ correct + min 5 seen + fast

        if (skill.seen >= 5 && correctPercent >= 90 && fastEnough) {
            skill.mastery_level = 3;
        } else if (skill.seen >= 3 && correctPercent >= 70) {
            skill.mastery_level = 2;
        } else {
            skill.mastery_level = 1;
        }
    }

    getSkillStats(skillId) {
        return this.data.skills[skillId] || null;
    }

    getStats() {
        const stats = {};
        for (const [skillId, skillData] of Object.entries(this.data.skills)) {
            stats[skillId] = {
                name: this.getSkillName(skillId),
                ...skillData
            };
        }
        return stats;
    }

    getSkillName(skillId) {
        // Map skill IDs to names
        const names = {
            'addition-simple': 'Additions',
            'multiply-2': '×2 (doubler)',
            'multiply-5': '×5 (groupes)'
        };
        return names[skillId] || skillId;
    }

    getTotalStars() {
        return this.stars;
    }

    getNextSkill() {
        // Simplified: return first skill with lowest mastery
        let lowestSkill = null;
        let lowestMastery = 4;

        for (const [skillId, skill] of Object.entries(this.data.skills)) {
            if ((skill.mastery_level || 1) < lowestMastery) {
                lowestMastery = skill.mastery_level;
                lowestSkill = skillId;
            }
        }

        return lowestSkill;
    }

    reset() {
        this.data = { skills: {} };
        this.stars = 0;
        this.save();
    }
}
