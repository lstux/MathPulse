// MathPulse v2 - Manipulation « casser une dizaine » (soustraction qui passe la dizaine)
// Pour a − b (52 − 7) : des paquets de 10 (5) et des objets seuls (2). Il faut en enlever b.
// Toucher un objet seul l'enlève (il file à la poubelle ; on peut aussi le glisser). Quand il n'y a plus d'objets seuls,
// on touche un paquet de 10 : il s'ouvre en 10 objets. On voit alors « je suis passé par 50, puis j'ai continué ».
// Ouvrir un paquet alors qu'il reste des objets seuls est refusé : c'est justement la stratégie (redescendre à la dizaine).

class BreakTenModel {
    constructor(a, b) {
        if (!(b < 10 && a >= 10 && a % 10 < b)) throw new Error(`Casser une dizaine : ${a} − ${b} ne passe pas la dizaine`);
        this.a = a; this.b = b;
        this.tens = Math.floor(a / 10);
        this.loose = a % 10;
        this.removed = 0;
        this.opened = 0;        // paquets ouverts
        this.moves = 0;
    }

    get left() { return this.tens * 10 + this.loose; }
    get done() { return this.removed === this.b; }

    // Toucher un objet seul : il est enlevé
    take() {
        if (this.done) return 'done';
        if (this.loose === 0) return 'need-open';
        this.loose--; this.removed++; this.moves++;
        return this.done ? 'complete' : this.loose === 0 ? 'ten' : 'taken';   // 'ten' : on vient de tomber pile sur la dizaine
    }

    // Toucher un paquet de 10 : il s'ouvre (seulement s'il ne reste plus d'objets seuls)
    open() {
        if (this.done) return 'done';
        if (this.loose > 0) return 'not-yet';
        if (this.tens === 0) return 'nothing';
        this.tens--; this.loose += 10; this.opened++; this.moves++;
        return 'opened';
    }
}

const BreakTen = {
    create(model, { item = '🪨', onChange = () => {} } = {}) {
        const root = document.createElement('div');
        root.className = 'manip breakten';
        const draw = () => {
            const bars = Array.from({ length: model.tens }, (_, i) =>
                `<button class="bt-bar" data-open aria-label="Ouvrir ce paquet de 10">10</button>`).join('');
            const loose = Array.from({ length: model.loose }, () =>
                `<button class="bt-item${model.done ? ' locked' : ''}" data-take aria-label="Enlever cet objet">${item}</button>`).join('');
            const bin = Array.from({ length: model.removed }, (_, i) => `<span class="bt-gone" data-i="${i}">${item}</span>`).join('');
            root.innerHTML = `
                <p class="manip-count" aria-live="polite"><span class="manip-big">${model.left}</span></p>
                <div class="bt-bars" role="group" aria-label="${model.tens} paquets de 10">${bars}</div>
                <div class="bt-loose" role="group" aria-label="${model.loose} objets seuls">${loose || '<span class="muted text-sm">plus d\'objets seuls</span>'}</div>
                <div class="bt-bin${model.done ? ' full' : ''}" data-bin aria-label="Enlevés : ${model.removed} sur ${model.b}">
                    <span class="bt-bin-label">🗑️ ${model.removed} sur ${model.b}</span><span class="bt-bin-items">${bin}</span>
                </div>`;
        };
        const take = (rect) => {
            const ev = model.take();
            draw();
            if (['taken', 'ten', 'complete'].includes(ev)) Manip.fly(rect, root.querySelector(`.bt-gone[data-i="${model.removed - 1}"]`), item);
            else if (ev === 'done') Manip.shake(root.querySelector('[data-bin]'));
            onChange(ev, model);
        };
        Manip.gestures(root, {
            tap: '[data-take]', onTap: (el, rect) => take(rect),
            drag: { targets: '[data-bin]', item, onDrop: (el, t, rect) => take(rect), canStart: () => !model.done },
            buttons: '[data-open]', onButton: (el) => {
                const ev = model.open();
                if (ev === 'not-yet') Manip.shake(el);
                else { draw(); if (ev === 'opened') root.querySelectorAll('.bt-item').forEach((b, i) => { b.classList.add('pop'); b.style.animationDelay = `${i * 30}ms`; }); }
                onChange(ev, model);
            }
        });
        draw();
        return root;
    }
};
