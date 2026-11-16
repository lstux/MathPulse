// MathPulse - Abstraction localStorage (toutes les lectures/écritures passent ici)

const storage = {
    KEYS: {
        PROGRESSION: 'mathpulse_progression',
        SESSION_HISTORY: 'mathpulse_history',
        USER_PREFS: 'mathpulse_prefs'
    },

    MAX_HISTORY: 200,
    EXPORT_VERSION: 1,   // version du format de fichier d'export

    init() {
        this.ensureDefaults();
    },

    ensureDefaults() {
        if (!this.get(this.KEYS.PROGRESSION)) this.set(this.KEYS.PROGRESSION, { version: 1, skills: {}, totalStars: 0, discovered: {} });
        if (!this.get(this.KEYS.SESSION_HISTORY)) this.set(this.KEYS.SESSION_HISTORY, []);
        if (!this.get(this.KEYS.USER_PREFS)) this.set(this.KEYS.USER_PREFS, { sound: true });
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`storage.get("${key}"):`, error);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`storage.set("${key}"):`, error);
            return false;
        }
    },

    append(key, item, max = this.MAX_HISTORY) {
        const data = this.get(key);
        const list = Array.isArray(data) ? data : [];
        list.push(item);
        return this.set(key, list.slice(-max));
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    },

    exportData() {
        return {
            app: 'mathpulse',
            version: this.EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            progression: this.get(this.KEYS.PROGRESSION),
            history: this.get(this.KEYS.SESSION_HISTORY),
            prefs: this.get(this.KEYS.USER_PREFS)
        };
    },

    // Restaure un export. Retourne { ok: true } ou { ok: false, reason } ('format' | 'version').
    // Les écritures ne se font qu'après validation complète : un fichier invalide ne touche à rien.
    importData(data) {
        if (!data || data.app !== 'mathpulse' || !data.progression || typeof data.progression !== 'object' || Array.isArray(data.progression)) {
            return { ok: false, reason: 'format' };
        }
        if (!Number.isInteger(data.version) || data.version < 1 || data.version > this.EXPORT_VERSION) {
            return { ok: false, reason: 'version' };
        }
        const history = Array.isArray(data.history) ? data.history.slice(-this.MAX_HISTORY) : [];
        const prefs = data.prefs && typeof data.prefs === 'object' && !Array.isArray(data.prefs) ? data.prefs : { sound: false };
        this.set(this.KEYS.PROGRESSION, data.progression);
        this.set(this.KEYS.SESSION_HISTORY, history);
        this.set(this.KEYS.USER_PREFS, prefs);
        return { ok: true };
    },

    // Supprime uniquement les clés de MathPulse (jamais localStorage.clear())
    resetAll() {
        Object.values(this.KEYS).forEach(k => this.remove(k));
        this.ensureDefaults();
    }
};
