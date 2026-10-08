// MathPulse - Représentations visuelles (blocs, groupes). Le style/animation est dans css/animations.css.
// Utilisé par la découverte, l'aide (💡) et l'explication d'une erreur.

const Animations = {
    blocks(a, b) {
        const row = (n, cls, offset) => Array.from({ length: n }, (_, i) =>
            `<span class="block ${cls}" style="animation-delay:${(offset + i) * 60}ms"></span>`).join('');
        return `
            <div class="visual visual-blocks" role="img" aria-label="${a} blocs et ${b} blocs">
                <div class="block-row">${row(a, 'addition-first', 0)}</div>
                <div class="visual-sign">+</div>
                <div class="block-row">${row(b, 'addition-second', a)}</div>
            </div>`;
    },

    // Soustraction : a blocs, dont les b derniers sont « enlevés » (ils s'estompent après l'apparition)
    takeAway(a, b) {
        const blocks = Array.from({ length: a }, (_, i) => {
            const removed = i >= a - b;
            return `<span class="block addition-first${removed ? ' removed' : ''}" style="animation-delay:${i * 60}ms;--cross-delay:${a * 60 + 300 + (i - (a - b)) * 120}ms"></span>`;
        }).join('');
        return `
            <div class="visual visual-blocks visual-takeaway" role="img" aria-label="${a} blocs, on en enlève ${b}, il en reste ${a - b}">
                <div class="block-row">${blocks}</div>
                <div class="visual-sign">− ${b}</div>
            </div>`;
    },

    // Multiplier par 10 : `n` paquets de 10
    tens(n) {
        const bars = Array.from({ length: n }, (_, i) =>
            `<span class="ten-bar group" style="animation-delay:${i * 100}ms">10</span>`).join('');
        return `<div class="visual visual-tens" role="img" aria-label="${n} paquets de 10">${bars}</div>`;
    },

    // `groupCount` groupes de `perGroup` objets
    groups(groupCount, perGroup, item = '🍎') {
        const groups = Array.from({ length: groupCount }, (_, g) => `
            <div class="group" style="animation-delay:${g * 120}ms">
                ${Array.from({ length: perGroup }, () => `<span class="group-item">${item}</span>`).join('')}
            </div>`).join('');
        return `<div class="visual visual-groups" role="img" aria-label="${groupCount} groupes de ${perGroup}">${groups}</div>`;
    },

    // Représentation adaptée à un exercice
    forExercise(exercise) {
        const [a, b] = exercise.operands;
        if (exercise.operation === '+') return this.blocks(a, b);
        if (exercise.operation === '−') return this.takeAway(a, b);
        if (b === 10) return this.tens(a);
        if (b === 2) return this.groups(2, a);      // doubler : 2 groupes identiques
        return this.groups(a, b);
    }
};
