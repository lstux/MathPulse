// MathPulse - Catalogue des compétences (source unique de vérité)

// Version affichée dans l'espace parent. APP_BUILD est remplacé par le commit lors du déploiement (CI).
const APP_VERSION = '0.5.0';
const APP_BUILD = 'dev';
// Pour ajouter une compétence : une entrée ici + un générateur dans engine.js.

const SKILLS = {
    'addition-simple': {
        id: 'addition-simple',
        name: 'Additions',
        title: 'Les additions',
        operation: '+',
        animation: 'blocks',
        // 5 questions par session : types d'exercice dans l'ordre
        plan: ['numeric', 'numeric', 'numeric', 'missing', 'missing']
    },
    'subtract-simple': {
        id: 'subtract-simple',
        name: 'Soustractions',
        title: 'Les soustractions',
        operation: '−',
        animation: 'takeaway',
        requires: { skill: 'addition-simple', level: 2 },   // se débloque quand les additions sont en bonne voie
        plan: ['numeric', 'numeric', 'numeric', 'missing', 'missing']
    },
    'multiply-2': {
        id: 'multiply-2',
        name: '×2 (doubler)',
        title: 'Doubler',
        operation: '×',
        animation: 'groups',
        plan: ['numeric', 'numeric', 'numeric', 'missing', 'missing']
    },
    'multiply-10': {
        id: 'multiply-10',
        name: '×10 (un zéro de plus)',
        title: 'Les paquets de 10',
        operation: '×',
        animation: 'tens',
        requires: { skill: 'multiply-2', level: 2 },
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-5': {
        id: 'multiply-5',
        name: '×5 (groupes de 5)',
        title: 'Les groupes de 5',
        operation: '×',
        animation: 'groups',
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    }
};

const SKILL_ORDER = ['addition-simple', 'subtract-simple', 'multiply-2', 'multiply-5', 'multiply-10'];

// Seuils de maîtrise (niveau 1 = vu, 2 = en cours, 3 = maîtrisé ⭐⭐⭐)
const MASTERY = {
    level2: { minSeen: 3, minAccuracy: 70 },
    level3: { minSeen: 5, minAccuracy: 90, maxAvgMs: 5000 },  // temps de réflexion moyen (jusqu'au premier chiffre tapé),
    maxCountedMs: 15000,  // un temps de réponse est plafonné (enfant parti en pause)
    window: 20            // la maîtrise se calcule sur les 20 dernières réponses de la compétence (elle peut remonter ET redescendre)
};

// Récompenses de session : étoiles gagnées selon le nombre de bonnes réponses
function starsForScore(correct) {
    if (correct >= 5) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
    return 0;
}

// Coups de pouce (💡) : gratuits dans la limite du quota par session.
// Au-delà : la session rapporte au plus `maxStarsOverQuota` étoiles et les réponses aidées
// ne comptent plus dans la maîtrise (elles restent visibles dans l'historique de session).
const HINTS = { freePerSession: 2, maxStarsOverQuota: 2 };

// Réapparition des erreurs : un calcul raté revient dans les sessions suivantes (quelle que soit la
// compétence du jour) jusqu'à `clearAfter` réussites consécutives sans coup de pouce.
const REVIEW = { maxPerSession: 2, clearAfter: 2, maxStored: 30 };

// Mélange des notions : jusqu'à `recallPerSession` questions sur 5 (40 %) reprennent des compétences déjà
// pratiquées (autres que la compétence du jour). Les calculs à revoir (REVIEW) occupent ces places en priorité.
const MIX = { recallPerSession: 2 };

// Planètes déverrouillées avec le total d'étoiles collectées
const PLANETS = [
    { name: 'Lune', emoji: '🌕', unlockAt: 10 },
    { name: 'Mars', emoji: '🔴', unlockAt: 25 },
    { name: 'Saturne', emoji: '🪐', unlockAt: 50 }
];
