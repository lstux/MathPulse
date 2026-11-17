// MathPulse v2 - Manipulation « paquets égaux » (multiplication)
// Pour g × p (6 × 4) : g supports vides (6 moteurs) ; toucher un support y pose ses p objets (4 boulons) d'un coup.
// Le total avance par bonds de p : 4, 8, 12… C'est le passage de « compter un par un » à « compter par paquets ».

class GroupsModel {
    constructor(groups, per) {
        if (!(groups >= 2 && groups <= 10 && per >= 2 && per <= 10)) throw new Error(`Paquets : ${groups} × ${per} hors limites`);
        this.groups = groups; this.per = per;
        this.filled = Array(groups).fill(false);
        this.moves = 0;
    }

    get count() { return this.filled.filter(Boolean).length; }
    get total() { return this.count * this.per; }
    get done() { return this.count === this.groups; }
    // Les bonds déjà faits : [4, 8, 12…]
    get steps() { return Array.from({ length: this.count }, (_, i) => (i + 1) * this.per); }

    // Toucher un support : on y pose ses objets
    fill(i) {
        if (!(i >= 0 && i < this.groups)) return 'nothing';
        if (this.filled[i]) return 'already';
        this.filled[i] = true; this.moves++;
        return this.done ? 'complete' : 'filled';
    }
}

const Groups = {
    create(model, { item = '🔩', container = '⚙️', onChange = () => {} } = {}) {
        const root = document.createElement('div');
        root.className = 'manip groups';
        const draw = () => {
            const boxes = model.filled.map((f, i) => `
                <button class="gr-box${f ? ' filled' : ''}" data-g="${i}" aria-label="${f ? `${model.per} objets posés` : 'Poser les objets ici'}">
                    <span class="gr-head" aria-hidden="true">${container}</span>
                    <span class="gr-slots" aria-hidden="true">${Array.from({ length: model.per }, () => `<span class="gr-slot">${f ? item : ''}</span>`).join('')}</span>
                </button>`).join('');
            root.innerHTML = `
                <p class="manip-count" aria-live="polite"><span class="manip-big">${model.total}</span></p>
                <p class="gr-steps" aria-hidden="true">${model.steps.map(n => `<span>${n}</span>`).join('') || '&nbsp;'}</p>
                <div class="gr-grid" role="group" aria-label="${model.count} sur ${model.groups}">${boxes}</div>`;
        };
        root.addEventListener('click', e => {
            const b = e.target.closest('[data-g]'); if (!b) return;
            const ev = model.fill(Number(b.dataset.g));
            if (ev === 'already') { Manip.shake(b); onChange(ev, model); return; }
            draw();
            const nb = root.querySelector(`[data-g="${b.dataset.g}"]`);
            if (nb && !Manip.reduced()) nb.querySelectorAll('.gr-slot').forEach((s, k) => { s.classList.add('pop'); s.style.animationDelay = `${k * 60}ms`; });
            onChange(ev, model);
        });
        draw();
        return root;
    }
};
