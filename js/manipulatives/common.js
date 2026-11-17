// MathPulse v2 - Outils communs aux manipulations (rendu seulement ; la logique est dans chaque modèle)
//   Manip.fly(fromRect, toEl, item)  : un objet vole jusqu'à sa nouvelle place
//   Manip.shake(el)                  : petite secousse (« impossible », « c'est plein »)
//   Manip.gestures(root, opts)       : toucher et glisser-déposer au pointeur (doigt ou souris), clavier compris
// Règle : un toucher suffit toujours ; glisser est un geste en plus, jamais obligatoire.

const Manip = {
    DRAG_THRESHOLD: 8,      // px : en dessous, c'est un toucher ; au-dessus, un glisser
    FLY_MS: 260,

    reduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; },

    ghost(item, rect, cls = '') {
        const g = document.createElement('span');
        g.className = `manip-ghost ${cls}`.trim(); g.textContent = item; g.setAttribute('aria-hidden', 'true');
        Object.assign(g.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
        document.body.appendChild(g);
        return g;
    },

    fly(from, toEl, item) {
        if (!from || !toEl || this.reduced()) return;
        const to = toEl.getBoundingClientRect();
        const g = this.ghost(item, from);
        toEl.classList.add('arriving');
        requestAnimationFrame(() => {
            g.style.transition = `transform ${this.FLY_MS}ms ease-out`;
            g.style.transform = `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${to.top + to.height / 2 - (from.top + from.height / 2)}px)`;
        });
        setTimeout(() => { g.remove(); toEl.classList.remove('arriving'); }, this.FLY_MS + 20);
    },

    shake(el) {
        if (!el || this.reduced()) return;
        el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    },

    inside(el, x, y) {
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    },

    // opts :
    //   tap      : sélecteur des objets qu'on touche ; onTap(el, rect)
    //   drag     : { targets: sélecteur des destinations, onDrop(el, target, rect), item, canStart() } (facultatif)
    //   buttons  : sélecteurs « simples » (pas de glisser) ; onButton(el) — boutons classiques, clic ou clavier
    gestures(root, { tap, onTap, drag = null, buttons = null, onButton = () => {} }) {
        let cur = null, downOn = null;   // downOn : bouton simple sous le doigt au moment de l'appui
        const targetAt = (x, y) => drag ? [...root.querySelectorAll(drag.targets)].find(t => this.inside(t, x, y)) || null : null;
        root.addEventListener('pointerdown', e => {
            downOn = buttons ? e.target.closest(buttons) : null;
            const el = e.target.closest(tap);
            if (!el || e.button > 0) return;
            cur = { el, x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId };
            try { el.setPointerCapture(e.pointerId); } catch (_) { /* sans capture, le glisser marche dans la zone */ }
        });
        root.addEventListener('pointermove', e => {
            if (!cur || e.pointerId !== cur.id || !drag) return;
            const dx = e.clientX - cur.x, dy = e.clientY - cur.y;
            if (!cur.moved && Math.hypot(dx, dy) < this.DRAG_THRESHOLD) return;
            if (!cur.moved) {
                if (drag.canStart && !drag.canStart(cur.el)) { cur = null; return; }
                cur.moved = true;
                cur.ghost = this.ghost(drag.item, cur.el.getBoundingClientRect(), 'dragging');
                cur.el.classList.add('lifted');
            }
            cur.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
            const over = targetAt(e.clientX, e.clientY);
            root.querySelectorAll(drag.targets).forEach(t => t.classList.toggle('ready', t === over));
        });
        const end = (e, cancelled) => {
            if (!cur || e.pointerId !== cur.id) return;
            const c = cur; cur = null;
            if (!c.moved) { if (!cancelled) onTap(c.el, c.el.getBoundingClientRect()); return; }
            root.querySelectorAll(drag.targets).forEach(t => t.classList.remove('ready'));
            const target = cancelled ? null : targetAt(e.clientX, e.clientY);
            const at = c.ghost.getBoundingClientRect();
            if (target) { c.ghost.remove(); drag.onDrop(c.el, target, at); return; }
            // lâché à côté : l'objet revient à sa place
            c.ghost.style.transition = `transform ${this.FLY_MS}ms ease-out`;
            c.ghost.style.transform = 'translate(0, 0)';
            setTimeout(() => { c.ghost.remove(); c.el.classList.remove('lifted'); }, this.reduced() ? 0 : this.FLY_MS + 20);
        };
        root.addEventListener('pointerup', e => end(e, false));
        root.addEventListener('pointercancel', e => end(e, true));
        // Clic : le clavier (Entrée, Espace : detail = 0) pour les objets à toucher ; tous les clics pour les boutons simples
        root.addEventListener('click', e => {
            // un bouton ne réagit qu'au clic qui a commencé sur lui : après un toucher qui réorganise l'écran,
            // le clic qui suit retomberait sinon sur un autre objet (venu se placer sous le doigt)
            const b = buttons && e.target.closest(buttons);
            if (b) { if (e.detail === 0 || b === downOn) onButton(b); return; }
            const el = e.target.closest(tap);
            if (el && e.detail === 0) onTap(el, el.getBoundingClientRect());
        });
    }
};
