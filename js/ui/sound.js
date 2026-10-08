// MathPulse - Sons (Web Audio : démarrage rapide, pas de latence, volumes réglés par son)
// Les navigateurs interdisent le son avant un premier geste : le contexte audio est créé au premier contact.
// Réglage « sons activés » mémorisé dans les préférences (activé par défaut).

const Sound = {
    FILES: { good: 'good', wrong: 'wrong', hint: 'hint', start: 'start', stars: 'stars', stars3: 'stars3', planet: 'planet', cleared: 'cleared', fast: 'fast' },
    // Volumes relatifs (0..1) : discrets, et encore plus bas pour l'erreur (doux, comme l'expression du renard)
    VOLUME: { good: 0.7, wrong: 0.35, hint: 0.6, start: 0.6, stars: 0.7, stars3: 0.7, planet: 0.7, cleared: 0.6, fast: 0.5 },
    ctx: null,
    buffers: {},
    log: [],            // noms des sons demandés (sert aux tests)

    isOn() {
        const prefs = storage.get(storage.KEYS.USER_PREFS) || {};
        return prefs.soundChosen ? prefs.sound !== false : true;   // jamais choisi → activé
    },

    setOn(on) {
        const prefs = storage.get(storage.KEYS.USER_PREFS) || {};
        storage.set(storage.KEYS.USER_PREFS, { ...prefs, sound: !!on, soundChosen: true });
    },

    toggle() { this.setOn(!this.isOn()); return this.isOn(); },

    // À appeler au premier geste de l'utilisateur : crée le contexte et charge les sons
    unlock() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            try { this.ctx = new AC(); } catch (e) { return; }
            this.preload();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },

    preload() {
        Object.values(this.FILES).forEach(name => {
            fetch(`assets/sounds/${name}.mp3`)
                .then(r => r.arrayBuffer())
                .then(buf => new Promise((ok, ko) => this.ctx.decodeAudioData(buf, ok, ko)))
                .then(audio => { this.buffers[name] = audio; })
                .catch(() => {});
        });
    },

    play(name) {
        if (!this.isOn()) return;
        this.log.push(name);
        if (!this.ctx || !this.buffers[name]) return;
        try {
            const src = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            gain.gain.value = this.VOLUME[name] ?? 0.6;
            src.buffer = this.buffers[name];
            src.connect(gain).connect(this.ctx.destination);
            src.start();
        } catch (e) { /* le son est un plus : jamais bloquant */ }
    },

    init() {
        const go = () => this.unlock();
        ['pointerdown', 'keydown', 'touchend'].forEach(ev => document.addEventListener(ev, go, { passive: true }));
    }
};
