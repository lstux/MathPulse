// MathPulse - Petits graphiques SVG/CSS pour l'espace parent (sans bibliothèque).
// Radar (« toile d'araignée »), barre de progression, étoiles par jour.

const Charts = {
    // Radar : `axes` = [{ label, value }] avec value de 0 à `max`. Anneaux à 1, 2, … max.
    radar(axes, { max = 3, size = 280, title = '' } = {}) {
        const n = axes.length;
        const c = size / 2, R = size / 2 - 38;
        const pt = (i, v) => {
            const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
            return [c + Math.cos(ang) * R * v / max, c + Math.sin(ang) * R * v / max];
        };
        const poly = (v) => axes.map((_, i) => pt(i, v).map(x => x.toFixed(1)).join(',')).join(' ');
        const rings = Array.from({ length: max }, (_, k) => `<polygon class="radar-ring" points="${poly(k + 1)}"/>`).join('');
        const spokes = axes.map((_, i) => { const [x, y] = pt(i, max); return `<line class="radar-spoke" x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
        const shape = axes.map((a, i) => pt(i, Math.max(0, Math.min(max, a.value))).map(x => x.toFixed(1)).join(',')).join(' ');
        const dots = axes.map((a, i) => { const [x, y] = pt(i, a.value); return `<circle class="radar-dot${a.value >= max ? ' full' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/>`; }).join('');
        const labels = axes.map((a, i) => {
            const [x, y] = pt(i, max + 0.55);
            return `<text class="radar-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${a.label}</text>`;
        }).join('');
        const desc = axes.map(a => `${a.label} : niveau ${a.value} sur ${max}`).join(', ');
        return `<svg class="radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="${title ? title + ' — ' : ''}${desc}">
            ${rings}${spokes}<polygon class="radar-shape" points="${shape}"/>${dots}${labels}</svg>`;
    },

    // Barre de progression en pourcentage (0 à 100)
    bar(percent, label = '') {
        const p = Math.max(0, Math.min(100, Math.round(percent)));
        return `<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${label}"><span style="width:${p}%"></span></div>`;
    },

    // Histogramme des étoiles gagnées par jour : `days` = [{ label, stars }]
    week(days) {
        const top = Math.max(1, ...days.map(d => d.stars));
        const cols = days.map(d => `<div class="wk-col"><span class="wk-val">${d.stars || ''}</span><span class="wk-bar${d.stars ? '' : ' empty'}" style="height:${Math.max(4, Math.round(d.stars / top * 100))}%"></span><span class="wk-day">${d.label}</span></div>`).join('');
        const desc = days.map(d => `${d.label} : ${d.stars} étoile${d.stars > 1 ? 's' : ''}`).join(', ');
        return `<div class="week" role="img" aria-label="Étoiles des 7 derniers jours. ${desc}">${cols}</div>`;
    }
};
