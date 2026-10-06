// MathPulse - Core Engine

class Engine {
    constructor(progression) {
        this.progression = progression;
        this.currentSkill = null;
    }

    selectSkillForSession() {
        // Algorithm: mix of new skills, skills to review, and mastered skills
        const skills = ['addition-simple', 'multiply-2', 'multiply-5'];

        // For MVP, round-robin through skills
        const nextSkill = this.progression.getNextSkill() || skills[0];
        this.currentSkill = nextSkill;

        return nextSkill;
    }

    generateExercise(skillId, count = 5) {
        // Generate random exercises for the skill
        const exercises = [];

        switch (skillId) {
            case 'addition-simple':
                for (let i = 0; i < count; i++) {
                    const a = Math.floor(Math.random() * 10) + 1;
                    const b = Math.floor(Math.random() * 10) + 1;
                    exercises.push({
                        type: 'numeric',
                        skill: skillId,
                        question: `${a} + ${b} = ?`,
                        answer: a + b,
                        operands: [a, b],
                        operation: '+',
                        animation: 'blocks'
                    });
                }
                break;

            case 'multiply-2':
                for (let i = 0; i < count; i++) {
                    const a = Math.floor(Math.random() * 10) + 1;
                    exercises.push({
                        type: 'numeric',
                        skill: skillId,
                        question: `${a} × 2 = ?`,
                        answer: a * 2,
                        operands: [a, 2],
                        operation: '×',
                        animation: 'duplication'
                    });
                }
                break;

            case 'multiply-5':
                for (let i = 0; i < count; i++) {
                    const a = Math.floor(Math.random() * 10) + 1;
                    exercises.push({
                        type: 'numeric',
                        skill: skillId,
                        question: `${a} × 5 = ?`,
                        answer: a * 5,
                        operands: [a, 5],
                        operation: '×',
                        animation: 'groups'
                    });
                }
                break;
        }

        return exercises;
    }

    validateAnswer(exercise, answer) {
        return parseInt(answer) === exercise.answer;
    }
}
