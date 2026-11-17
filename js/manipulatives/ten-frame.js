// MathPulse v2 - Manipulation « compléter la dizaine » (boîte de 10)
// Pour a + b (47 + 8) : des dizaines pleines (40), une boîte de 10 entamée (7 sur 10) et b objets libres (8).
// Toucher un objet libre : il va tout seul dans la prochaine case vide (il n'y a qu'une destination possible).
// On peut aussi le faire glisser jusqu'à la boîte ; lâché ailleurs, il revient. Toucher un objet ajouté le fait ressortir.
// But : remplir la boîte. On voit alors « des dizaines pleines, et ce qui reste ».
// TenFrameModel : logique pure (testée). TenFrame.create : rendu tactile (grosses cibles, gestes de common.js).

class TenFrameModel {
    constructor(a, b) {
        if (!(b < 10 && (a % 10) + b >= 10 && a % 10 > 0)) throw new Error(`Boîte de 10 : ${a} + ${b} ne franchit pas la dizaine`);
        this.a = a; this.b = b;
        this.tens = Math.floor(a / 10);     // dizaines déjà pleines
        this.base = a % 10;                 // objets déjà dans la boîte (ils n'en sortent pas)
        this.added = 0;                     // objets ajoutés par l'enfant
        this.moves = 0;
    }

    get inFrame() { return this.base + this.added; }
    get loose() { return this.b - this.added; }
    get full() { return this.inFrame === 10; }
    get done() { return this.full; }

    // Mettre un objet libre dans la boîte (toucher ou glisser-déposer)
    add() {
        if (this.loose === 0) return 'empty';
        if (this.full) return 'full';       // la boîte est pleine : les objets restants ne bougent plus
        this.added++; this.moves++;
        return this.full ? 'complete' : 'placed';
    }

    // Toucher un objet ajouté dans la boîte : il ressort
    takeBack() {
        if (this.added === 0) return 'nothing';
        this.added--; this.moves++;
        return 'back';
    }
}

const TenFrame = {
    // onChange(event, model) est appelé après chaque geste ('placed', 'complete', 'back', 'full', 'empty', 'nothing')
    create(model, { item = '💧', onChange = () => {} } = {}) {
        const root = document.createElement('div');
        root.className = 'tenframe';

        const draw = () => {
            const bars = Array.from({ length: model.tens }, () => `<span class="tf-bar" aria-hidden="true"></span>`).join('');
            const cells = Array.from({ length: 10 }, (_, i) => {
                const kind = i < model.base ? 'base' : i < model.inFrame ? 'added' : 'empty';
                return kind === 'added'
                    ? `<button class="tf-cell added" data-back data-i="${i}" aria-label="Reprendre cet objet">${item}</button>`
                    : `<span class="tf-cell ${kind}" data-i="${i}" aria-hidden="true">${kind === 'base' ? item : ''}</span>`;
            }).join('');
            const loose = Array.from({ length: model.loose }, () =>
                `<button class="tf-item${model.full ? ' locked' : ''}" data-pick aria-label="Mettre cet objet dans la boîte">${item}</button>`).join('');
            root.innerHTML = `
                <div class="tf-tens" role="img" aria-label="${model.tens} dizaines pleines">${bars}<span class="tf-count">${model.tens * 10}</span></div>
                <div class="tf-frame${model.full ? ' full' : ''}" data-frame role="group" aria-label="Boîte de 10 : ${model.inFrame} sur 10">
                    <span class="tf-grid">${cells}</span>
                </div>
                <p class="tf-status" aria-live="polite">${model.inFrame} sur 10${model.full ? ' ✓' : ''}</p>
                <div class="tf-loose" role="group" aria-label="${model.loose} objets libres">${loose || '<span class="muted text-sm">vide</span>'}</div>`;
        };

        const add = (rect) => {
            const ev = model.add();
            draw();
            if (ev === 'placed' || ev === 'complete') Manip.fly(rect, root.querySelector(`.tf-cell[data-i="${model.inFrame - 1}"]`), item);
            else if (ev === 'full') Manip.shake(root.querySelector('[data-frame]'));
            onChange(ev, model);
        };

        Manip.gestures(root, {
            tap: '[data-pick]', onTap: (el, rect) => add(rect),
            drag: { targets: '[data-frame]', item, onDrop: (el, target, rect) => add(rect),
                    canStart: () => { if (!model.full) return true; Manip.shake(root.querySelector('[data-frame]')); onChange('full', model); return false; } },
            buttons: '[data-back]', onButton: () => { const ev = model.takeBack(); draw(); onChange(ev, model); }
        });

        draw();
        return root;
    }
};
