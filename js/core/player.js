// MathPulse - Le joueur : c'est lui le renard de l'histoire. Son prénom est demandé une fois, puis utilisé dans les textes.
// Dans les textes (chapters.js, missions.js), {nom} est remplacé par le prénom, ou par « renard » s'il n'en a pas donné,
// et {hase} par le nom de la hase (HARE_NAME).

const Player = {
    MAX: 14,

    // Lettres, espaces, tirets et apostrophes seulement : le prénom est inséré dans les écrans
    clean(raw) {
        return String(raw == null ? '' : raw).replace(/[^\p{L} '\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, this.MAX).trim();
    },

    prefs() { return storage.get(storage.KEYS.USER_PREFS) || {}; },

    name() { return this.clean(this.prefs().playerName); },

    // Enregistre le prénom (vide = pas de prénom) et note que la question a été posée
    set(raw) {
        const name = this.clean(raw);
        storage.set(storage.KEYS.USER_PREFS, { ...this.prefs(), playerName: name, nameAsked: true });
        return name;
    },

    asked() { return !!this.prefs().nameAsked; },

    // Nom affiché de celui qui parle (lecteurs d'écran)
    hare() { return typeof HARE_NAME === 'string' && HARE_NAME ? HARE_NAME : 'La hase'; },   // nom de la hase : constante HARE_NAME (content/chapters.js)

    label(who) { return who === 'rabbit' ? this.hare() : (this.name() || 'Le renard'); },

    text(t) { return String(t).replace(/\{nom\}/g, this.name() || 'renard').replace(/\{hase\}/g, this.hare()); }
};
