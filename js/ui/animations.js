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

    // Paquets de dizaines : `first` paquets bleus, puis `second` paquets (mode 'add' : violets ; 'sub' : retirés ; 'missing' : à trouver)
    tensBars(first, second, mode) {
        const bar = (cls, i, extra = '') => `<span class="ten-bar ${cls}" style="animation-delay:${i * 90}ms${extra}">10</span>`;
        const bars = Array.from({ length: first }, (_, i) => bar(mode === 'sub' && i >= first - second ? 'ten-removed' : 'ten-first', i, `;--cross-delay:${first * 90 + 300 + (i - (first - second)) * 140}ms`)).join('')
            + (mode === 'sub' ? '' : Array.from({ length: second }, (_, i) => bar(mode === 'missing' ? 'ten-missing' : 'ten-second', first + i)).join(''));
        const label = mode === 'sub' ? `${first} paquets de 10, on en enlève ${second}`
            : mode === 'missing' ? `${first} paquets de 10, il en manque ${second} pour faire 10`
            : `${first} paquets de 10 et ${second} paquets de 10`;
        return `<div class="visual visual-tens tens-compact" role="img" aria-label="${label}">${bars}</div>`;
    },

    // Frise de sauts : `nodes` = nombres successifs, `labels` = valeur de chaque saut (« +3 », « −20 »)
    jumps(nodes, labels) {
        const W = 300, pad = 34, gap = nodes.length > 1 ? (W - 2 * pad) / (nodes.length - 1) : 0;
        const x = (i) => pad + i * gap;
        const arcs = labels.map((l, i) => `
            <path class="jump-arc ${i % 2 ? 'second' : 'first'}" pathLength="1" d="M ${x(i)} 78 Q ${(x(i) + x(i + 1)) / 2} 14 ${x(i + 1)} 78" style="animation-delay:${i * 700 + 200}ms"/>
            <text class="jump-label ${i % 2 ? 'second' : 'first'}" x="${(x(i) + x(i + 1)) / 2}" y="36" text-anchor="middle" style="animation-delay:${i * 700 + 600}ms">${l}</text>`).join('');
        const pts = nodes.map((n, i) => `<circle class="jump-dot" cx="${x(i)}" cy="78" r="4"/><text class="jump-num" x="${x(i)}" y="102" text-anchor="middle">${n}</text>`).join('');
        return `<div class="visual visual-jumps"><svg viewBox="0 0 ${W} 112" role="img" aria-label="${nodes.join(', puis ')} : ${labels.join(', ')}"><line class="jump-line" x1="${x(0) - 14}" y1="78" x2="${x(nodes.length - 1) + 14}" y2="78"/>${arcs}${pts}</svg></div>`;
    },

    // Frise adaptée au calcul : on passe par la dizaine (47 + 8), ou on décompose (38 + 45)
    jumpsFor(skillId, a, b) {
        const u = a % 10, d = b - (b % 10);
        if (skillId === 'add-units') return u + b > 10 ? this.jumps([a, a + 10 - u, a + b], [`+${10 - u}`, `+${b - (10 - u)}`]) : this.jumps([a, a + b], [`+${b}`]);
        if (skillId === 'sub-units') return b > u ? this.jumps([a, a - u, a - b], [`−${u}`, `−${b - u}`]) : this.jumps([a, a - b], [`−${b}`]);
        if (skillId === 'add-2digits') return this.jumps([a, a + d, a + b], [`+${d}`, `+${b % 10}`]);
        return this.jumps([a, a - d, a - b], [`−${d}`, `−${b % 10}`]);
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
        switch (exercise.skill) {
            case 'complement-10': return this.blocks(a, b);
            case 'complement-100': return this.tensBars(a / 10, b / 10, 'missing');
            case 'tens-add': return this.tensBars(a / 10, b / 10, 'add');
            case 'tens-sub': return this.tensBars(a / 10, b / 10, 'sub');
            case 'add-units': case 'sub-units': case 'add-2digits': case 'sub-2digits': return this.jumpsFor(exercise.skill, a, b);
        }
        if (exercise.operation === '+') return this.blocks(a, b);
        if (exercise.operation === '−') return this.takeAway(a, b);
        if (exercise.operation === '÷') {
            if (b === 10) return this.tens(a / 10);
            if (b === 2) return this.share(a, 2);
            if (b >= 6) return this.array(a / b, b);       // beaucoup de points : tableau de q lignes de b
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
