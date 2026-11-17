// MathPulse v2 - Missions (données déclaratives, exécutées par mission/runner.js)
// Une mission = une suite d'étapes typées. Voir docs/v2-inventaire-architecture.md (§3).
//   scene     : vignettes d'histoire (même format que chapters.js : art, cast, lines)
//   problem   : la situation est posée, l'enfant propose une réponse AVANT toute explication (une erreur ne bloque pas)
//   explore   : manipulation libre avec un but simple (tool : voir manipulatives/registry.js) ; hint : piste d'Andrea après un moment sans geste ;
//               done : réplique quand le but est atteint ; say : répliques propres à l'outil, par événement (facultatif)
//   explain   : explication visuelle courte (visual : { fn, args } = fonction de Animations), texte, formule
//   challenge : défi sur la notion qui vient d'être découverte (preuve de compréhension)
//   transfer  : la même stratégie dans une situation différente (preuve de réemploi)
// Étapes à réponse : operands [a, b] et op ('+' par défaut) ; la réponse attendue est calculée, jamais écrite ici.
// evidence : ids des étapes qui prouvent la compréhension (understood) et le réemploi (reused).
// Règle d'écriture : textes très courts, lisibles seul en CE2 ; le sens passe d'abord par l'image.

// Stratégies (les « astuces » du carnet de découvertes)
const STRATEGIES = {
    'pass-through-ten': { name: 'Passer par la dizaine' },
    'back-to-ten': { name: 'Redescendre à la dizaine' },
    'double-double': { name: 'Fois 4 : le double du double' },
    'share-with-table': { name: 'Partager avec la table' }
};

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
            { id: 'explore', type: 'explore', tool: 'ten-frame', who: 'rabbit', item: '💧', operands: [47, 8],
              prompt: "Remplis la boîte de 10 avec mes 8 litres.",
              hint: "Touche une goutte : elle file dans la boîte.",
              done: "La boîte est pleine ! Regarde ce qui reste." },
            { id: 'explain', type: 'explain', who: 'rabbit', title: 'On passe par la dizaine !',
              visual: { fn: 'jumps', args: [[47, 50, 55], ['+3', '+5']] },
              text: "De 47, on va d'abord jusqu'à 50 : il faut 3. Il reste 5 à ajouter.", formula: '47 + 3 + 5 = 55' },
            { id: 'challenge', type: 'challenge', who: 'rabbit', prompt: "À toi ! Passe par la dizaine.", operands: [36, 7] },
            { id: 'transfer', type: 'transfer', who: 'fox', prompt: "J'ai compté 58 étoiles, puis 6 autres. Combien d'étoiles ?", operands: [58, 6] }
        ],
        evidence: { understood: ['challenge'], reused: ['transfer'] }
    },

    'back-ten-52-7': {
        id: 'back-ten-52-7',
        version: 1,
        skill: 'sub-units',
        strategy: 'back-to-ten',
        title: 'Les débris',
        steps: [
            { id: 'intro', type: 'scene', vignettes: [
                { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                    { who: 'rabbit', text: "Il y a 52 débris devant la porte du vaisseau. On doit en dégager 7." },
                    { who: 'fox', mood: 'think', text: "Et après, il en restera combien ?" }] }
            ] },
            { id: 'problem', type: 'problem', who: 'fox', prompt: "52 débris, on en enlève 7. Combien en reste-t-il ?", op: '−', operands: [52, 7] },
            { id: 'explore', type: 'explore', tool: 'break-ten', who: 'rabbit', item: '🪨', operands: [52, 7],
              prompt: "Enlève 7 débris. Commence par les débris tout seuls.",
              hint: "Touche un débris seul pour l'enlever. Il n'y en a plus ? Touche un paquet de 10 pour l'ouvrir.",
              say: { 'not-yet': "Attends ! Enlève d'abord les débris tout seuls.", ten: "Pile 50 ! Il faut ouvrir un paquet de 10 pour continuer." },
              done: "Et voilà ! Tu es passé par 50, puis tu as continué." },
            { id: 'explain', type: 'explain', who: 'rabbit', title: 'On redescend à la dizaine !',
              visual: { fn: 'jumps', args: [[52, 50, 45], ['−2', '−5']] },
              text: "De 52, on enlève d'abord 2 pour tomber sur 50. Il reste 5 à enlever : on arrive à 45.", formula: '52 − 2 − 5 = 45' },
            { id: 'challenge', type: 'challenge', who: 'rabbit', prompt: "À toi ! Redescends à la dizaine.", op: '−', operands: [43, 6] },
            { id: 'transfer', type: 'transfer', who: 'fox', prompt: "Le décollage est dans 61 minutes. 4 minutes passent. Combien de minutes reste-t-il ?", op: '−', operands: [61, 4] }
        ],
        evidence: { understood: ['challenge'], reused: ['transfer'] }
    },

    'double-double-6x4': {
        id: 'double-double-6x4',
        version: 1,
        skill: 'multiply-4',
        strategy: 'double-double',
        title: 'Les boulons des moteurs',
        steps: [
            { id: 'intro', type: 'scene', vignettes: [
                { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                    { who: 'rabbit', text: "Le vaisseau a 6 moteurs. Chacun doit être fixé avec 4 boulons." },
                    { who: 'fox', mood: 'think', text: "Il nous faut combien de boulons en tout ?" }] }
            ] },
            { id: 'problem', type: 'problem', who: 'fox', prompt: "6 moteurs, 4 boulons chacun. Combien de boulons ?", op: '×', operands: [6, 4] },
            { id: 'explore', type: 'explore', tool: 'groups', who: 'rabbit', item: '🔩', container: '⚙️', operands: [6, 4],
              prompt: "Fixe les 4 boulons de chaque moteur.",
              hint: "Touche un moteur : ses 4 boulons se vissent d'un coup.",
              say: { already: "Celui-là est déjà fixé. Choisis un autre moteur." },
              done: "Tous les moteurs sont fixés ! Regarde : tu as compté de 4 en 4." },
            { id: 'explain', type: 'explain', who: 'rabbit', title: 'Fois 4, c\'est le double du double !',
              visual: { fn: 'jumps', args: [[6, 12, 24], ['×2', '×2']] },
              text: "Compter de 4 en 4, c'est long. Plus rapide : 6 fois 2, c'est 12. Et le double de 12, c'est 24.", formula: '6 × 4 = 12 × 2 = 24' },
            { id: 'challenge', type: 'challenge', who: 'rabbit', prompt: "À toi ! Double, puis double encore.", op: '×', operands: [7, 4] },
            { id: 'transfer', type: 'transfer', who: 'fox', prompt: "Il y a 8 tables. Chaque table a 4 pieds. Combien de pieds en tout ?", op: '×', operands: [8, 4] }
        ],
        evidence: { understood: ['challenge'], reused: ['transfer'] }
    },

    'share-15-5': {
        id: 'share-15-5',
        version: 1,
        skill: 'divide-5',
        strategy: 'share-with-table',
        title: 'Les cellules d\'énergie',
        steps: [
            { id: 'intro', type: 'scene', vignettes: [
                { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                    { who: 'rabbit', text: "J'ai 15 cellules d'énergie pour 5 réservoirs. Chaque réservoir doit en avoir autant." },
                    { who: 'fox', mood: 'think', text: "Alors, combien dans chaque réservoir ?" }] }
            ] },
            { id: 'problem', type: 'problem', who: 'fox', prompt: "15 cellules, 5 réservoirs, autant dans chacun. Combien par réservoir ?", op: '÷', operands: [15, 5] },
            { id: 'explore', type: 'explore', tool: 'share', who: 'rabbit', item: '🔋', container: '🛢️', operands: [15, 5],
              prompt: "Range les 15 cellules dans les 5 réservoirs. Chacun son tour !",
              hint: "Touche une cellule : elle va dans un réservoir.",
              say: { unfair: "Ce n'est pas juste ! Touche une cellule rangée pour la reprendre." },
              done: "Tous les réservoirs en ont autant. C'est juste !" },
            { id: 'explain', type: 'explain', who: 'rabbit', title: 'Partager, c\'est chercher dans la table',
              visual: { fn: 'share', args: [15, 5, '🔋'] },
              text: "5 réservoirs de 3 cellules, ça fait 15 : 5 fois 3 = 15. Donc 15 partagé en 5, c'est 3.", formula: '15 ÷ 5 = 3' },
            { id: 'challenge', type: 'challenge', who: 'rabbit', prompt: "À toi ! Cherche dans la table de 5.", op: '÷', operands: [20, 5] },
            { id: 'transfer', type: 'transfer', who: 'fox', prompt: "35 enfants font 5 équipes pareilles. Combien d'enfants par équipe ?", op: '÷', operands: [35, 5] }
        ],
        evidence: { understood: ['challenge'], reused: ['transfer'] }
    }
};

// Mission qui fait découvrir une compétence (jouée à la place de l'écran de découverte), ou null
function missionForSkill(skillId) {
    return Object.values(MISSIONS).find(m => m.skill === skillId) || null;
}

const MISSION_RULES = {
    exploreHintMs: 12000,   // manipulation : la piste d'Andrea arrive après 12 s sans geste
    maxAttempts: 3   // défi / réemploi : après 3 essais, on revoit l'explication et on continue (jamais de blocage)
};
