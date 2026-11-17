// MathPulse v2 - Manipulation « compléter la dizaine » (boîte de 10)
// Pour a + b (47 + 8) : des dizaines pleines (40), une boîte de 10 entamée (7 sur 10) et b objets libres (8).
// L'enfant touche un objet, puis touche la boîte : l'objet y entre. Toucher un objet de la boîte le fait ressortir.
// But : remplir la boîte. On voit alors « des dizaines pleines, et ce qui reste ».
// TenFrameModel : logique pure (testée). TenFrame.create : rendu tactile (grosses cibles, pas de glisser-déposer).

class TenFrameModel {
    constructor(a, b) {
        if (!(b < 10 && (a % 10) + b >= 10 && a % 10 > 0)) throw new Error(`Boîte de 10 : ${a} + ${b} ne franchit pas la dizaine`);
        this.a = a; this.b = b;
        this.tens = Math.floor(a / 10);     // dizaines déjà pleines
        this.base = a % 10;                 // objets déjà dans la boîte (ils n'en sortent pas)
        this.added = 0;                     // objets ajoutés par l'enfant
        this.selected = false;              // un objet libre est en main
        this.moves = 0;
    }

    get inFrame() { return this.base + this.added; }
    get loose() { return this.b - this.added; }
    get full() { return this.inFrame === 10; }

    // Toucher un objet libre : on le prend (ou on le repose s'il était déjà pris)
    pick() {
        if (this.loose === 0) return 'empty';
        if (this.full) return 'full';       // la boîte est pleine : inutile d'en prendre un autre
        this.selected = !this.selected;
        return this.selected ? 'picked' : 'dropped';
    }

    // Toucher la boîte : l'objet pris y entre
    place() {
        if (!this.selected) return 'nothing';   // rien en main
        if (this.full) { this.selected = false; return 'full'; }
        this.added++; this.moves++; this.selected = false;
        return this.full ? 'complete' : 'placed';
    }

    // Toucher un objet ajouté dans la boîte : il ressort
    takeBack() {
        if (this.added === 0) return 'nothing';
        this.added--; this.moves++; this.selected = false;
        return 'back';
    }
}

const TenFrame = {
    // onChange(event, model) est appelé après chaque geste ('picked', 'placed', 'complete', 'back', 'full', 'nothing'…)
    create(model, { item = '💧', onChange = () => {} } = {}) {
        const root = document.createElement('div');
        root.className = 'tenframe';
        const draw = () => {
            const bars = Array.from({ length: model.tens }, () => `<span class="tf-bar" aria-hidden="true"></span>`).join('');
            const cells = Array.from({ length: 10 }, (_, i) => {
                const kind = i < model.base ? 'base' : i < model.inFrame ? 'added' : 'empty';
                return kind === 'added'
                    ? `<button class="tf-cell added" data-back aria-label="Reprendre cet objet">${item}</button>`
                    : `<span class="tf-cell ${kind}" aria-hidden="true">${kind === 'base' ? item : ''}</span>`;
            }).join('');
            const loose = Array.from({ length: model.loose }, (_, i) =>
                `<button class="tf-item${model.selected && i === 0 ? ' selected' : ''}" data-pick aria-label="Prendre un objet"${model.selected && i === 0 ? ' aria-pressed="true"' : ''}>${item}</button>`).join('');
            root.innerHTML = `
                <div class="tf-tens" role="img" aria-label="${model.tens} dizaines pleines">${bars}<span class="tf-count">${model.tens * 10}</span></div>
                <button class="tf-frame${model.full ? ' full' : ''}${model.selected ? ' ready' : ''}" data-frame aria-label="Boîte de 10 : ${model.inFrame} sur 10">
                    <span class="tf-grid">${cells}</span>
                </button>
                <p class="tf-status" aria-live="polite">${model.inFrame} sur 10${model.full ? ' ✓' : ''}</p>
                <div class="tf-loose" role="group" aria-label="${model.loose} objets libres">${loose || '<span class="muted text-sm">vide</span>'}</div>`;
        };
        root.addEventListener('click', e => {
            const t = e.target.closest('[data-back], [data-pick], [data-frame]');
            if (!t) return;
            // un objet ajouté est dans la boîte : le toucher sans rien en main le fait ressortir ; avec un objet en main, on vise la boîte
            const ev = t.hasAttribute('data-pick') ? model.pick()
                : t.hasAttribute('data-back') && !model.selected ? model.takeBack()
                : model.place();
            draw();
            onChange(ev, model);
        });
        draw();
        return root;
    }
};
