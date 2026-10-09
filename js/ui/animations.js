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

    // Tableau de points : `rows` lignes de `cols` points. Les deux premières lignes forment « le double »,
    // le reste est coloré autrement (×3 : double + 1 ligne ; ×4 : double + double). On lit a × n ou n × a.
    table(cols, rows) {
        const lines = Array.from({ length: rows }, (_, r) =>
            `<div class="dot-row ${r < 2 ? 'dbl-1' : 'dbl-2'}" style="animation-delay:${r * 160}ms">${Array.from({ length: cols }, () => '<span class="dot-item"></span>').join('')}</div>`).join('');
        return `<div class="visual visual-array" role="img" aria-label="${rows} lignes de ${cols} points : ${cols} × ${rows} = ${cols * rows}">${lines}</div>`;
    },

    // `groupCount` groupes de `perGroup` objets
    groups(groupCount, perGroup, item = '🍎') {
        const groups = Array.from({ length: groupCount }, (_, g) => `
            <div class="group" style="animation-delay:${g * 120}ms">
                ${Array.from({ length: perGroup }, () => `<span class="group-item">${item}</span>`).join('')}
            </div>`).join('');
        return `<div class="visual visual-groups" role="img" aria-label="${groupCount} groupes de ${perGroup}">${groups}</div>`;
    },

    // Tableau de `rows` lignes × `cols` colonnes : les `split` premières colonnes en bleu, les autres en violet.
    // Avec `minus`, une colonne supplémentaire grisée montre ce qu'on retire (×9 = ×10 moins une colonne).
    array(rows, cols, split = cols, minus = false) {
        const total = minus ? cols + 1 : cols;
        const lines = Array.from({ length: rows }, (_, r) =>
            `<div class="dot-row" style="animation-delay:${r * 120}ms">${Array.from({ length: total }, (_, c) =>
                `<span class="dot-item ${c >= cols ? 'dot-out' : c < split ? 'dbl-blue' : 'dbl-violet'}"></span>`).join('')}</div>`).join('');
        return `<div class="visual visual-array" role="img" aria-label="${rows} lignes de ${cols} points : ${rows} × ${cols} = ${rows * cols}">${lines}</div>`;
    },

    // Partage : `total` objets répartis équitablement dans `n` paniers
    share(total, n, item = '🍎') {
        const per = total / n;
        const baskets = Array.from({ length: n }, (_, g) => `
            <div class="group basket" style="animation-delay:${g * 160}ms">
                ${Array.from({ length: per }, () => `<span class="group-item">${item}</span>`).join('')}
            </div>`).join('');
        return `<div class="visual visual-groups visual-share" role="img" aria-label="${total} objets partagés en ${n} paniers : ${per} dans chaque panier">${baskets}</div>`;
    },

    // Représentation adaptée à un exercice
    forExercise(exercise) {
        const [a, b] = exercise.operands;
        if (exercise.operation === '+') return this.blocks(a, b);
        if (exercise.operation === '−') return this.takeAway(a, b);
        if (exercise.operation === '÷') {
            if (b === 10) return this.tens(a / 10);
            if (b === 2) return this.share(a, 2);
            return this.groups(a / b, b);      // groupement : combien de paquets de b dans a ?
        }
        if (b === 10) return this.tens(a);
        if (SKILLS[exercise.skill] && SKILLS[exercise.skill].mixed) return this.array(a, b);
        if (b === 3 || b === 4) return this.table(a, b);
        if (b === 6) return this.array(a, 6, 5);
        if (b === 7) return this.array(a, 7, 5);
        if (b === 8) return this.array(a, 8, 4);
        if (b === 9) return this.array(a, 9, 9, true);
        if (b === 2) return this.groups(2, a);      // doubler : 2 groupes identiques
        return this.groups(a, b);
    }
};
