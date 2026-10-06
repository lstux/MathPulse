// MathPulse - Local Storage Abstraction

const storage = {
    // Keys
    KEYS: {
        PROGRESSION: 'mathpulse_progression',
        SESSION_HISTORY: 'mathpulse_history',
        USER_PREFS: 'mathpulse_prefs'
    },

    // Initialize storage
    init() {
        console.log('✓ Storage initialized');
        this.ensureDefaults();
    },

    // Ensure default data exists
    ensureDefaults() {
        if (!this.get(this.KEYS.PROGRESSION)) {
            this.set(this.KEYS.PROGRESSION, { skills: {} });
        }
        if (!this.get(this.KEYS.SESSION_HISTORY)) {
            this.set(this.KEYS.SESSION_HISTORY, []);
        }
        if (!this.get(this.KEYS.USER_PREFS)) {
            this.set(this.KEYS.USER_PREFS, { theme: 'auto', sound: true });
        }
    },

    // Get from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Storage.get error for key "${key}":`, error);
            return null;
        }
    },

    // Set to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Storage.set error for key "${key}":`, error);
            return false;
        }
    },

    // Append to array
    append(key, item) {
        try {
            const data = this.get(key) || [];
            if (Array.isArray(data)) {
                data.push(item);
                this.set(key, data);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Storage.append error for key "${key}":`, error);
            return false;
        }
    },

    // Remove from storage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Storage.remove error for key "${key}":`, error);
            return false;
        }
    },

    // Clear all
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage.clear error:', error);
            return false;
        }
    },

    // Export all data
    exportData() {
        return {
            progression: this.get(this.KEYS.PROGRESSION),
            history: this.get(this.KEYS.SESSION_HISTORY),
            prefs: this.get(this.KEYS.USER_PREFS)
        };
    },

    // Import data
    importData(data) {
        try {
            if (data.progression) this.set(this.KEYS.PROGRESSION, data.progression);
            if (data.history) this.set(this.KEYS.SESSION_HISTORY, data.history);
            if (data.prefs) this.set(this.KEYS.USER_PREFS, data.prefs);
            return true;
        } catch (error) {
            console.error('Storage.importData error:', error);
            return false;
        }
    }
};
