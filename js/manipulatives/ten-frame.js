// MathPulse v2 - Manipulation « compléter la dizaine » (boîte de 10)
// Pour a + b (47 + 8) : des dizaines pleines (40), une boîte de 10 entamée (7 sur 10) et b objets libres (8).
// Toucher un objet libre : il va tout seul dans la prochaine case vide (il n'y a qu'une destination possible).
// On peut aussi le faire glisser jusqu'à la boîte ; lâché ailleurs, il revient. Toucher un objet ajouté le fait ressortir.
// But : remplir la boîte. On voit alors « des dizaines pleines, et ce qui reste ».
// TenFrameModel : logique pure (testée). TenFrame.create : rendu tactile (grosses cibles, pointeur = doigt ou souris).

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
    DRAG_THRESHOLD: 8,      // px : en dessous, c'est un toucher ; au-dessus, un glisser
    FLY_MS: 260,

    // onChange(event, model) est appelé après chaque geste ('placed', 'complete', 'back', 'full', 'empty', 'nothing')
    create(model, { item = '💧', onChange = () => {} } = {}) {
        const root = document.createElement('div');
        root.className = 'tenframe';
        const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

        const frame = () => root.querySelector('[data-frame]');
        const shake = () => {
            const f = frame(); if (!f || reduced) return;
            f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
        };

        // Un objet vole de « from » (rectangle à l'écran) jusqu'à la case qu'il vient de remplir
        const fly = (from) => {
            const cell = root.querySelector(`.tf-cell[data-i="${model.inFrame - 1}"]`);
            if (!cell || !from || reduced) return;
            const to = cell.getBoundingClientRect();
            const ghost = document.createElement('span');
            ghost.className = 'tf-ghost'; ghost.textContent = item; ghost.setAttribute('aria-hidden', 'true');
            Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
            document.body.appendChild(ghost);
            cell.classList.add('arriving');
            requestAnimationFrame(() => {
                ghost.style.transition = `transform ${this.FLY_MS}ms ease-out`;
                const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
                ghost.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            setTimeout(() => { ghost.remove(); cell.classList.remove('arriving'); }, this.FLY_MS + 20);
        };

        const addFrom = (rect) => {
            const ev = model.add();
            draw();
            if (ev === 'placed' || ev === 'complete') fly(rect);
            else if (ev === 'full') shake();
            onChange(ev, model);
        };

        // Glisser-déposer au pointeur (doigt ou souris) ; un geste court reste un toucher
        let drag = null;
        root.addEventListener('pointerdown', e => {
            const t = e.target.closest('[data-pick]');
            if (!t || e.button > 0) return;
            drag = { el: t, x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId };
            try { t.setPointerCapture(e.pointerId); } catch (_) { /* pas de capture : le glisser marche quand même dans la zone */ }
        });
        root.addEventListener('pointermove', e => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            if (!drag.moved && Math.hypot(dx, dy) < this.DRAG_THRESHOLD) return;
            if (!drag.moved) {
                if (model.full) { drag = null; shake(); onChange('full', model); return; }
                drag.moved = true;
                const r = drag.el.getBoundingClientRect();
                drag.rect = r;
                drag.ghost = document.createElement('span');
                drag.ghost.className = 'tf-ghost dragging'; drag.ghost.textContent = item; drag.ghost.setAttribute('aria-hidden', 'true');
                Object.assign(drag.ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
                document.body.appendChild(drag.ghost);
                drag.el.classList.add('lifted');
            }
            drag.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
            const f = frame().getBoundingClientRect();
            frame().classList.toggle('ready', e.clientX >= f.left && e.clientX <= f.right && e.clientY >= f.top && e.clientY <= f.bottom);
        });
        const endDrag = (e, cancelled) => {
            if (!drag || e.pointerId !== drag.id) return;
            const d = drag; drag = null;
            if (!d.moved) { if (!cancelled) addFrom(d.el.getBoundingClientRect()); return; }
            const f = frame().getBoundingClientRect();
            const over = !cancelled && e.clientX >= f.left && e.clientX <= f.right && e.clientY >= f.top && e.clientY <= f.bottom;
            frame().classList.remove('ready');
            const at = d.ghost.getBoundingClientRect();
            if (over) { d.ghost.remove(); addFrom(at); return; }
            // lâché à côté : l'objet revient à sa place
            d.ghost.style.transition = `transform ${this.FLY_MS}ms ease-out`;
            d.ghost.style.transform = 'translate(0, 0)';
            setTimeout(() => { d.ghost.remove(); d.el.classList.remove('lifted'); }, reduced ? 0 : this.FLY_MS + 20);
        };
        root.addEventListener('pointerup', e => endDrag(e, false));
        root.addEventListener('pointercancel', e => endDrag(e, true));

        // Clavier (Entrée / Espace sur un bouton) : même effet qu'un toucher. Les clics souris/doigt passent par le pointeur.
        root.addEventListener('click', e => {
            const t = e.target.closest('[data-back], [data-pick]');
            if (!t) return;
            if (t.hasAttribute('data-back')) { const ev = model.takeBack(); draw(); onChange(ev, model); return; }
            if (e.detail === 0) addFrom(t.getBoundingClientRect());
        });

        draw();
        return root;
    }
};
