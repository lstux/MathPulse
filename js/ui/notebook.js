// MathPulse v2 - Le carnet de découvertes : ce que l'enfant a découvert, sans score ni classement.
// Quatre pages : mes astuces (stratégies vues en mission), ce que je sais faire (notions, par parcours),
// ce que la hase m'a appris (une idée de science par chapitre lu), mes missions (à rejouer).
// Notebook.data(progression) : contenu du carnet (logique pure, testée). Notebook.create(ui) : l'écran.

const Notebook = {
    STATES: { vu: { icon: '👀', label: 'découvert' }, compris: { icon: '💡', label: 'compris' }, durable: { icon: '🌳', label: 'bien ancré' } },

    data(progression) {
        const d = progression.data;
        // une notion est « découverte » dès qu'elle a été présentée, pratiquée ou vue en mission
        const known = id => !!(d.discovered[id] || d.skills[id] || d.mastery[id]);
        const state = id => (d.mastery[id] && d.mastery[id].state) || 'vu';
        const missions = Object.values(MISSIONS).filter(m => d.missions[m.id]);
        const strategies = [];
        missions.forEach(m => {
            if (!m.strategy || strategies.some(s => s.id === m.strategy)) return;
            const explain = m.steps.find(s => s.type === 'explain');
            const st = (d.mastery[m.skill] && d.mastery[m.skill].strategies[m.strategy]) || 'vu';
            strategies.push({ id: m.strategy, name: (STRATEGIES[m.strategy] || {}).name || m.strategy, mission: m.id, state: st, formula: explain ? explain.formula : '' });
        });
        return {
            strategies,
            paths: PATHS.map(p => ({ id: p.id, name: p.name, emoji: p.emoji, total: p.skills.length,
                skills: p.skills.filter(known).map(id => ({ id, name: SKILLS[id].name, state: state(id) })) })).filter(p => p.skills.length),
            science: CHAPTERS.filter(c => c.idea && d.chaptersSeen[c.id]).map(c => ({ chapter: c.id, number: c.number, title: c.title, idea: c.idea })),
            missions: missions.map(m => ({ id: m.id, title: m.title, runs: d.missions[m.id].runs })),
            empty: !missions.length && !PATHS.some(p => p.skills.some(known)) && !CHAPTERS.some(c => c.idea && d.chaptersSeen[c.id])
        };
    },

    // ui : { progression, back(), replaySkill(id), replayStrategy(missionId), replayMission(id) }
    create(ui) {
        const n = this.data(ui.progression), S = this.STATES;
        const badge = st => `<span class="nb-state" title="${S[st].label}" aria-label="${S[st].label}">${S[st].icon}</span>`;
        const screen = document.createElement('main');
        screen.className = 'screen active flex flex-col gap-lg p-lg notebook-screen';
        const name = Player.name();
        const section = (title, body) => body ? `<section class="nb-section"><h2 class="text-lg font-bold mb-md">${title}</h2>${body}</section>` : '';
        screen.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold">📒 ${name ? `Le carnet de ${name}` : 'Mon carnet de découvertes'}</h1>
                <p class="muted text-sm">${n.empty ? '' : `${S.vu.icon} ${S.vu.label} · ${S.compris.icon} ${S.compris.label} · ${S.durable.icon} ${S.durable.label}`}</p>
            </div>
            ${n.empty ? `<div class="scene-line scene-line-rabbit mission-says"><img class="face" src="assets/story/expr/rabbit-content.svg" alt="" width="56" height="56">
                <p class="speech">${Scenes.fr("Ton carnet est encore vide. Joue une première mission : tout ce que tu découvriras viendra s'écrire ici !")}</p></div>` : ''}
            ${section('✨ Mes astuces', n.strategies.map(s => `
                <button class="nb-card" data-strategy="${s.mission}">${badge(s.state)}<span class="nb-card-body"><strong>${s.name}</strong><span class="nb-formula">${s.formula}</span></span><span class="nb-go" aria-hidden="true">›</span></button>`).join(''))}
            ${section('🧮 Ce que je sais faire', n.paths.map(p => `
                <h3 class="nb-path">${p.emoji} ${p.name} <span class="muted text-sm nb-count">${p.skills.length} sur ${p.total}</span></h3>
                <div class="nb-chips">${p.skills.map(k => `<button class="nb-chip" data-skill="${k.id}">${badge(k.state)} ${k.name}</button>`).join('')}</div>`).join(''))}
            ${section('🔭 Ce que la hase m\'a appris', n.science.map(c => `
                <div class="nb-idea"><img src="assets/story/icons/${c.chapter}.svg" alt="" width="36" height="36"><p>${Scenes.fr(c.idea)}</p></div>`).join(''))}
            ${section('🚀 Mes missions', n.missions.map(m => `
                <button class="nb-card" data-mission="${m.id}"><span class="nb-card-body"><strong>${m.title}</strong><span class="muted text-sm">jouée ${m.runs} fois · rejouer</span></span><span class="nb-go" aria-hidden="true">›</span></button>`).join(''))}
            <button class="btn-primary" id="btn-notebook-back">Retour</button>`;
        screen.querySelector('#btn-notebook-back').addEventListener('click', ui.back);
        screen.querySelectorAll('[data-skill]').forEach(b => b.addEventListener('click', () => ui.replaySkill(b.dataset.skill)));
        screen.querySelectorAll('[data-strategy]').forEach(b => b.addEventListener('click', () => ui.replayStrategy(b.dataset.strategy)));
        screen.querySelectorAll('[data-mission]').forEach(b => b.addEventListener('click', () => ui.replayMission(b.dataset.mission)));
        return screen;
    },

    // Revoir une astuce : l'explication de sa mission, seule
    strategyScreen(missionId, back) {
        const m = MISSIONS[missionId], step = m.steps.find(s => s.type === 'explain');
        const screen = document.createElement('main');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        screen.innerHTML = `${MissionUI.explainHtml(step)}<button class="btn-primary btn-large" id="btn-strategy-back">Retour au carnet</button>`;
        screen.querySelector('#btn-strategy-back').addEventListener('click', back);
        return screen;
    }
};
