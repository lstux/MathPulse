// MathPulse v2 - Missions (données déclaratives, exécutées par mission/runner.js)
// Une mission = une suite d'étapes typées. Voir docs/v2-inventaire-architecture.md (§3).
//   scene     : vignettes d'histoire (même format que chapters.js : art, cast, lines)
//   problem   : la situation est posée, l'enfant propose une réponse AVANT toute explication (une erreur ne bloque pas)
//   explain   : explication visuelle courte (visual : { fn, args } = fonction de Animations), texte, formule
//   challenge : défi sur la notion qui vient d'être découverte (preuve de compréhension)
//   transfer  : la même stratégie dans une situation différente (preuve de réemploi)
// Étapes à réponse : operands [a, b] et op ('+' par défaut) ; la réponse attendue est calculée, jamais écrite ici.
// evidence : ids des étapes qui prouvent la compréhension (understood) et le réemploi (reused).
// Règle d'écriture : textes très courts, lisibles seul en CE2 ; le sens passe d'abord par l'image.

const MISSIONS = {
    'pass-ten-47-8': {
        id: 'pass-ten-47-8',
        version: 1,
        skill: 'add-units',
        strategy: 'pass-through-ten',
        title: 'Le plein du réservoir',
        steps: [
            { id: 'intro', type: 'scene', vignettes: [
                { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                    { who: 'rabbit', text: "Le réservoir contient 47 litres. J'en verse encore 8." },
                    { who: 'fox', mood: 'worried', text: "Ça fait combien, en tout ? Je ne veux pas que ça déborde !" }] }
            ] },
            { id: 'problem', type: 'problem', who: 'fox', prompt: "47 litres, et encore 8. Combien en tout ?", operands: [47, 8] },
            { id: 'explain', type: 'explain', who: 'rabbit', title: 'On passe par la dizaine !',
              visual: { fn: 'jumps', args: [[47, 50, 55], ['+3', '+5']] },
              text: "De 47, on va d'abord jusqu'à 50 : il faut 3. Il reste 5 à ajouter.", formula: '47 + 3 + 5 = 55' },
            { id: 'challenge', type: 'challenge', who: 'rabbit', prompt: "À toi ! Passe par la dizaine.", operands: [36, 7] },
            { id: 'transfer', type: 'transfer', who: 'fox', prompt: "J'ai compté 58 étoiles, puis 6 autres. Combien d'étoiles ?", operands: [58, 6] }
        ],
        evidence: { understood: ['challenge'], reused: ['transfer'] }
    }
};

const MISSION_RULES = {
    maxAttempts: 3   // défi / réemploi : après 3 essais, on revoit l'explication et on continue (jamais de blocage)
};
