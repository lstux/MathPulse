// MathPulse - Mode test (« cheat code »), pour parcourir rapidement toutes les compétences.
// Activation : 7 appuis sur la ligne « Version » de l'espace parent, ou ?cheat=1 dans l'adresse (?cheat=0 pour couper).
// Effets : seuils de maîtrise réduits, toutes les compétences débloquées, plafond « en cours » levé,
// bouton ▶ Jouer sur chaque compétence de l'espace parent. Mémorisé dans les préférences de l'appareil.
// Dépend de : skills.js (MASTERY), storage.js

const Cheat = {
    // Seuils réduits : niveau 2 dès 1 réponse, niveau 3 dès 2 réponses (temps de réflexion ignoré)
    MASTERY: { level2: { minSeen: 1, minAccuracy: 50 }, level3: { minSeen: 2, minAccuracy: 70, maxAvgMs: Infinity } },

    isOn() {
        return !!(storage.get(storage.KEYS.USER_PREFS) || {}).cheat;
    },

    set(on) {
        const prefs = storage.get(storage.KEYS.USER_PREFS) || {};
        storage.set(storage.KEYS.USER_PREFS, { ...prefs, cheat: !!on });
    },

    mastery() {
        return this.isOn() ? this.MASTERY : MASTERY;
    }
};
