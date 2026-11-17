// MathPulse v2 - Manipulation « partager équitablement » (division)
// Pour t ÷ n (15 ÷ 5) : t objets en tas, n contenants. Toucher un objet l'envoie dans le contenant qui en a le moins
// (« chacun son tour ») ; on peut aussi le glisser dans le contenant de son choix. Toucher un objet rangé le remet au tas.
// But : tas vide ET partage juste (tous pareils). Un partage injuste est signalé, sans jamais bloquer.

class ShareModel {
    constructor(total, n) {
        if (!(n >= 2 && n <= 6 && total > n && total % n === 0 && total / n <= 10)) throw new Error(`Partage : ${total} ÷ ${n} impossible ici`);
        this.total = total; this.n = n;
        this.bins = Array(n).fill(0);
        this.moves = 0;
    }

    get pile() { return this.total - this.bins.reduce((s, x) => s + x, 0); }
    get fair() { return this.bins.every(x => x === this.bins[0]); }
    get done() { return this.pile === 0 && this.fair; }

    // Envoyer un objet du tas dans le contenant i (par défaut : celui qui en a le moins, le premier à égalité)
    deal(i = this.bins.indexOf(Math.min(...this.bins))) {
        if (this.pile === 0) return 'empty';
        if (!(i >= 0 && i < this.n)) return 'nothing';
        this.bins[i]++; this.moves++;
        return this.pile > 0 ? 'dealt' : this.fair ? 'complete' : 'unfair';
    }

    // Toucher un objet rangé dans le contenant i : il revient au tas
    takeBack(i) {
        if (!(this.bins[i] > 0)) return 'nothing';
        this.bins[i]--; this.moves++;
        return 'back';
    }
}

const Share = {
    create(model, { item = '🔋', container = '🛢️', onChange = () => {} } = {}) {
        const root = document.createElement('div');
        root.className = 'manip share';
        const draw = () => {
            const pile = Array.from({ length: model.pile }, () => `<button class="sh-item" data-cell aria-label="Ranger cet objet">${item}</button>`).join('');
            const bins = model.bins.map((k, i) => `
                <div class="sh-bin${model.done ? ' full' : ''}" data-bin="${i}" role="group" aria-label="Contenant ${i + 1} : ${k}">
                    <span class="sh-stack">${Array.from({ length: k }, (_, j) => `<button class="sh-in" data-back="${i}" data-j="${j}" aria-label="Remettre au tas">${item}</button>`).join('')}</span>
                    <span class="sh-head" aria-hidden="true">${container}</span>
                    <span class="sh-n">${k}</span>
                </div>`).join('');
            root.innerHTML = `
                <div class="sh-pile" role="group" aria-label="${model.pile} objets à ranger">${pile || '<span class="muted text-sm">tout est rangé</span>'}</div>
                <div class="sh-bins" style="grid-template-columns: repeat(${model.n}, 1fr)">${bins}</div>`;
        };
        // i : contenant visé (glisser) ; sans i, celui qui en a le moins (toucher)
        const deal = (rect, i = model.bins.indexOf(Math.min(...model.bins))) => {
            const ev = model.deal(i);
            draw();
            if (['dealt', 'complete', 'unfair'].includes(ev)) {
                const stack = root.querySelectorAll(`[data-bin="${i}"] .sh-in`);
                Manip.fly(rect, stack[stack.length - 1], item);
            }
            onChange(ev, model);
        };
        Manip.gestures(root, {
            tap: '[data-cell]', onTap: (el, rect) => deal(rect),
            drag: { targets: '[data-bin]', item, onDrop: (el, t, rect) => deal(rect, Number(t.dataset.bin)) },
            buttons: '[data-back]', onButton: (el) => { const ev = model.takeBack(Number(el.dataset.back)); draw(); onChange(ev, model); }
        });
        draw();
        return root;
    }
};
