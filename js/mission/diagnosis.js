// MathPulse v2 - Diagnostic d'une erreur et retour gradué (logique pure, sans DOM)
// Dépend de : content/errors.js (ERROR_CATALOG)
// Échelle du retour, un cran de plus à chaque nouvelle erreur sur la même question :
//   1. question : la piste d'Andrea (liée au type d'erreur reconnu, sinon un encouragement)
//   2. visual   : la même piste + une image du chemin, sans le résultat
//   3. explain  : on revoit l'explication complète et on continue (géré par MissionRun)
// La bonne réponse n'est jamais affichée directement.

const Diagnosis = {
    // Type d'erreur reconnu (entrée du catalogue) ou null
    find(op, a, b, answer) {
        const total = op === '+' ? a + b : op === '−' ? a - b : null;
        if (total === null || !Number.isFinite(answer) || answer === total) return null;
        return (ERROR_CATALOG[op] || []).find(e => e.match(a, b, answer, total)) || null;
    },

    // Retour pour une réponse fausse : { error, level, text, visual }
    feedback(op, a, b, answer, attempts) {
        const entry = this.find(op, a, b, answer);
        const level = attempts >= 2 ? 'visual' : 'question';
        const fallback = op === '+' ? ErrorHelpers.addPath(a, b) : op === '−' ? ErrorHelpers.subPath(a, b) : null;
        return {
            error: entry ? entry.id : null,
            level,
            text: entry ? entry.say(a, b) : (level === 'visual' ? `Regarde le chemin, et essaie encore.` : `Presque ! Essaie encore.`),
            visual: level === 'visual' ? ((entry && entry.visual && entry.visual(a, b)) || fallback) : null
        };
    }
};
