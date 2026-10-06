// MathPulse - Core Engine
// Generates exercises and validates answers

class Engine {
    constructor(progression) {
        this.progression = progression;
        this.currentSkill = null;
    }

    selectSkillForSession() {
        // Algorithm: prioritize skills to review, then new skills
        const skills = ['addition-simple', 'multiply-2', 'multiply-5'];
        const stats = this.progression.data.skills;

        // Find skill with lowest mastery or not yet seen
        let targetSkill = null;
        let lowestMastery = 4;

        for (const skill of skills) {
            const skillStats = stats[skill];
            const mastery = skillStats ? skillStats.mastery_level : 0;

            if (mastery < lowestMastery) {
                lowestMastery = mastery;
                targetSkill = skill;
            }
        }

        this.currentSkill = targetSkill || skills[0];
        return this.currentSkill;
    }

    generateExercise(skillId, count = 5) {
        const exercises = [];
        const types = this.getExerciseTypes(skillId);

        for (let i = 0; i < count; i++) {
            // Mix types: mostly numeric (3), then missing (2)
            const typeIdx = i < 3 ? 0 : 1;
            const type = types[Math.min(typeIdx, types.length - 1)];

            const exercise = this.generateSingleExercise(skillId, type);
            exercises.push(exercise);
        }

        return exercises;
    }

    getExerciseTypes(skillId) {
        // Define game types for each skill
        switch (skillId) {
            case 'addition-simple':
                return ['numeric', 'missing'];
            case 'multiply-2':
                return ['numeric', 'missing'];
            case 'multiply-5':
                return ['numeric', 'multiple', 'missing'];
            default:
                return ['numeric'];
        }
    }

    generateSingleExercise(skillId, type = 'numeric') {
        let exercise = {};

        switch (skillId) {
            case 'addition-simple':
                exercise = this.generateAddition(type);
                break;
            case 'multiply-2':
                exercise = this.generateMultiplyBy2(type);
                break;
            case 'multiply-5':
                exercise = this.generateMultiplyBy5(type);
                break;
        }

        exercise.skill = skillId;
        exercise.type = type;
        return exercise;
    }

    generateAddition(type) {
        const a = Math.floor(Math.random() * 9) + 1;  // 1-9
        const b = Math.floor(Math.random() * 9) + 1;  // 1-9
        const answer = a + b;

        if (type === 'missing') {
            // a + ? = c
            const distractors = [b - 2, b - 1, b + 1, b + 2]
                .filter(n => n > 0 && n !== b);
            const choices = [b, ...distractors.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            return {
                question: `${a} + ? = ${answer}`,
                answer: b,
                choices: choices,
                operands: [a, b],
                operation: '+',
                animation: 'blocks'
            };
        }

        // Numeric: a + b = ?
        return {
            question: `${a} + ${b} = ?`,
            answer: answer,
            operands: [a, b],
            operation: '+',
            animation: 'blocks'
        };
    }

    generateMultiplyBy2(type) {
        const a = Math.floor(Math.random() * 10) + 1;  // 1-10
        const answer = a * 2;

        if (type === 'missing') {
            // ? * 2 = c
            const distractors = [a - 2, a - 1, a + 1, a + 2]
                .filter(n => n > 0 && n !== a);
            const choices = [a, ...distractors.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            return {
                question: `? × 2 = ${answer}`,
                answer: a,
                choices: choices,
                operands: [a, 2],
                operation: '×',
                animation: 'duplication'
            };
        }

        // Numeric: a × 2 = ?
        return {
            question: `${a} × 2 = ?`,
            answer: answer,
            operands: [a, 2],
            operation: '×',
            animation: 'duplication'
        };
    }

    generateMultiplyBy5(type) {
        const a = Math.floor(Math.random() * 9) + 1;  // 1-9
        const answer = a * 5;

        if (type === 'multiple') {
            // a × 5 = ? (choose from 4 options)
            const distractors = [
                a * 5 - 5,
                a * 5 - 2,
                a * 5 + 3,
                a * 5 + 5
            ].filter(n => n > 0 && n !== answer);

            const choices = [answer, ...distractors.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            return {
                question: `${a} × 5 = ?`,
                answer: answer,
                choices: choices,
                operands: [a, 5],
                operation: '×',
                animation: 'groups'
            };
        }

        if (type === 'missing') {
            // ? × 5 = c
            const distractors = [a - 2, a - 1, a + 1, a + 2]
                .filter(n => n > 0 && n !== a);
            const choices = [a, ...distractors.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            return {
                question: `? × 5 = ${answer}`,
                answer: a,
                choices: choices,
                operands: [a, 5],
                operation: '×',
                animation: 'groups'
            };
        }

        // Numeric: a × 5 = ?
        return {
            question: `${a} × 5 = ?`,
            answer: answer,
            operands: [a, 5],
            operation: '×',
            animation: 'groups'
        };
    }

    validateAnswer(exercise, answer) {
        const numAnswer = parseInt(answer);
        return numAnswer === exercise.answer;
    }

    getExplanation(exercise) {
        const [a, b] = exercise.operands;
        const answer = exercise.answer;

        switch (exercise.operation) {
            case '+':
                return `${a} and ${b} make ${answer} together`;
            case '×':
                return `${a} groups of ${b} make ${answer}`;
            default:
                return `The answer is ${answer}`;
        }
    }
}
