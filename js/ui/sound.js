// MathPulse - Sons (Web Audio : démarrage rapide, pas de latence, volumes réglés par son)
// Les navigateurs interdisent le son avant un premier geste : le contexte audio est créé au premier contact.
// Réglage « sons activés » mémorisé dans les préférences (activé par défaut).

const Sound = {
    FILES: { good: 'good', wrong: 'wrong', hint: 'hint', start: 'start', stars: 'stars', stars3: 'stars3', planet: 'planet', cleared: 'cleared', fast: 'fast', countdown: 'countdown', crash: 'crash', 'amb-nature': 'amb-nature', 'amb-ship': 'amb-ship', 'amb-space': 'amb-space', applause: 'applause' },
    // Volumes relatifs (0..1) : discrets, et encore plus bas pour l'erreur (doux, comme l'expression du renard)
    VOLUME: { good: 0.7, wrong: 0.35, hint: 0.6, start: 0.6, stars: 0.7, stars3: 0.7, planet: 0.7, cleared: 0.6, fast: 0.5, countdown: 0.6, crash: 0.35, 'amb-nature': 0.5, 'amb-ship': 0.5, 'amb-space': 0.5, applause: 0.8 },
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
        this.updateAmbience();
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
                .then(audio => { this.buffers[name] = audio; this.updateAmbience(); })
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

    // ---------- Ambiances : boucles avec fondu, une seule à la fois (décor de l'histoire) ----------
    AMB_FADE: 1.2,      // secondes de fondu entre deux ambiances
    amb: null,          // { name, src, gain } : ambiance en cours
    wantAmb: null,      // ambiance demandée par l'écran (peut attendre le chargement ou le premier geste)

    // Demande une ambiance ('nature' | 'ship' | 'space') ; null = silence
    ambience(name) {
        this.wantAmb = name ? `amb-${name}` : null;
        this.updateAmbience();
    },

    updateAmbience() {
        const want = this.isOn() ? this.wantAmb : null;
        if (this.amb && this.amb.name === want) return;
        if (this.amb) this.fadeOutAmb(this.amb);
        this.amb = null;
        if (!want || !this.ctx || !this.buffers[want]) return;
        try {
            const src = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            src.buffer = this.buffers[want];
            src.loop = true;
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(this.VOLUME[want] ?? 0.5, t + this.AMB_FADE);
            src.connect(gain).connect(this.ctx.destination);
            src.start();
            this.amb = { name: want, src, gain };
            this.log.push(want);
        } catch (e) { /* l'ambiance est un plus : jamais bloquante */ }
    },

    fadeOutAmb(amb) {
        if (!this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            amb.gain.gain.cancelScheduledValues(t);
            amb.gain.gain.setValueAtTime(Math.max(amb.gain.gain.value, 0.0001), t);
            amb.gain.gain.exponentialRampToValueAtTime(0.0001, t + this.AMB_FADE);
            setTimeout(() => { try { amb.src.stop(); } catch (e) { /* déjà arrêtée */ } }, this.AMB_FADE * 1000 + 100);
        } catch (e) { /* ignoré */ }
    },

    // Bouton 🔊 / 🔇 : même comportement partout (scènes, univers, réglages)
    bindButton(btn) {
        if (!btn) return;
        const refresh = () => {
            const on = this.isOn();
            btn.setAttribute('aria-pressed', String(on));
            btn.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
            btn.textContent = on ? '🔊' : '🔇';
        };
        refresh();
        btn.addEventListener('click', () => { this.toggle(); refresh(); });
    },

    init() {
        const go = () => this.unlock();
        ['pointerdown', 'keydown', 'touchend'].forEach(ev => document.addEventListener(ev, go, { passive: true }));
    }
};
