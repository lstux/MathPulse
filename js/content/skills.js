// MathPulse - Catalogue des compétences (source unique de vérité)

// Version affichée dans l'espace parent. APP_BUILD est remplacé par le commit lors du déploiement (CI).
const APP_VERSION = '0.8.0';
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
        factor: 2,   // table de multiplication : a × 2, a de 1 à 10
        name: '×2 (doubler)',
        title: 'Doubler',
        operation: '×',
        animation: 'groups',
        plan: ['numeric', 'numeric', 'numeric', 'missing', 'missing']
    },
    'multiply-10': {
        id: 'multiply-10',
        factor: 10,   // table de multiplication : a × 10, a de 1 à 10
        name: '×10 (un zéro de plus)',
        title: 'Les paquets de 10',
        operation: '×',
        animation: 'tens',
        requires: { skill: 'multiply-2', level: 2 },
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-3': {
        id: 'multiply-3',
        factor: 3,
        name: '×3 (paquets de 3)',
        title: 'Les paquets de 3',
        operation: '×',
        animation: 'table',
        requires: { skill: 'multiply-2', level: 2 },
        explain: (a, b, t) => `${a} × 3 : le double de ${a}, c'est ${2 * a}, et encore ${a} de plus, ça fait ${t}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-4': {
        id: 'multiply-4',
        factor: 4,
        name: '×4 (doubler deux fois)',
        title: 'Doubler deux fois',
        operation: '×',
        animation: 'table',
        requires: { skill: 'multiply-2', level: 2 },
        explain: (a, b, t) => `${a} × 4 : le double de ${a}, c'est ${2 * a}, et le double de ${2 * a}, c'est ${t}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-5': {
        id: 'multiply-5',
        factor: 5,   // table de multiplication : a × 5, a de 1 à 10
        name: '×5 (groupes de 5)',
        title: 'Les groupes de 5',
        operation: '×',
        animation: 'groups',
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-6': {
        id: 'multiply-6',
        factor: 6,
        name: '×6 (×5 puis encore une fois)',
        title: 'Les paquets de 6',
        operation: '×',
        animation: 'array',
        requires: { skill: 'multiply-5', level: 2 },
        explain: (a, b, t) => `${a} × 6 : ${a} × 5 = ${5 * a}, et encore ${a}, ça fait ${t}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-7': {
        id: 'multiply-7',
        factor: 7,
        name: '×7 (×5 puis ×2)',
        title: 'Les paquets de 7',
        operation: '×',
        animation: 'array',
        requires: { skill: 'multiply-8', level: 2 },
        maxAvgMs: 6000,   // la table la plus difficile : un peu plus de temps
        explain: (a, b, t) => `${a} × 7 : ${a} × 5 = ${5 * a}, ${a} × 2 = ${2 * a}, et ${5 * a} + ${2 * a} = ${t}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-8': {
        id: 'multiply-8',
        factor: 8,
        name: '×8 (doubler trois fois)',
        title: 'Les paquets de 8',
        operation: '×',
        animation: 'array',
        requires: { skill: 'multiply-4', level: 2 },
        explain: (a, b, t) => `${a} × 8 : le double de ${a} × 4. ${a} × 4 = ${4 * a}, et le double de ${4 * a}, c'est ${t}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'multiply-9': {
        id: 'multiply-9',
        factor: 9,
        name: '×9 (×10 moins une fois)',
        title: 'Les paquets de 9',
        operation: '×',
        animation: 'array',
        requires: { skill: 'multiply-10', level: 2 },
        explain: (a, b, t) => `${a} × 9 : ${a} × 10 = ${10 * a}, moins ${a}, ça fait ${t}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    // Tables mélangées : a × b avec a et b de 2 à 9 (commutativité : 3 × 7 = 7 × 3)
    'multiply-mix': {
        id: 'multiply-mix',
        mixed: [2, 9],
        name: 'Tables mélangées (×2 à ×9)',
        title: 'Toutes les tables',
        operation: '×',
        animation: 'array',
        requires: { skill: 'multiply-7', level: 2 },
        maxAvgMs: 6000,
        explain: (a, b, t) => `${a} × ${b} = ${t}. Et ${b} × ${a} = ${t} aussi : on peut échanger les nombres !`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    // Divisions : a ÷ n avec a = q × n (q de 1 à 10, pas de reste). Se débloquent avec la table correspondante.
    'divide-2': {
        id: 'divide-2',
        divisor: 2,
        name: '÷2 (partager en 2)',
        title: 'Partager en 2',
        operation: '÷',
        animation: 'share',
        requires: { skill: 'multiply-2', level: 2 },
        explain: (a, b, t) => `${a} ÷ 2 : on partage ${a} en 2 parts égales, il y en a ${t} dans chaque part, car ${t} + ${t} = ${a}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'divide-5': {
        id: 'divide-5',
        divisor: 5,
        name: '÷5 (paquets de 5)',
        title: 'Des paquets de 5',
        operation: '÷',
        animation: 'groups',
        requires: { skill: 'multiply-5', level: 2 },
        explain: (a, b, t) => `${a} ÷ 5 : combien de paquets de 5 dans ${a} ? Il y en a ${t}, car ${t} × 5 = ${a}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    },
    'divide-10': {
        id: 'divide-10',
        divisor: 10,
        name: '÷10 (paquets de 10)',
        title: 'Des paquets de 10',
        operation: '÷',
        animation: 'tens',
        requires: { skill: 'multiply-10', level: 2 },
        explain: (a, b, t) => `${a} ÷ 10 : on enlève le zéro de ${a}. Il y a ${t} paquets de 10, car ${t} × 10 = ${a}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    }
};

// Divisions ÷3, ÷4, ÷6, ÷7, ÷8, ÷9 : même principe que ÷2, ÷5, ÷10, débloquées par la table correspondante
[3, 4, 6, 7, 8, 9].forEach(n => {
    SKILLS[`divide-${n}`] = {
        id: `divide-${n}`,
        divisor: n,
        name: `÷${n} (paquets de ${n})`,
        title: `Des paquets de ${n}`,
        operation: '÷',
        animation: n <= 4 ? 'groups' : 'array',
        requires: { skill: `multiply-${n}`, level: 2 },
        explain: (a, b, t) => `${a} ÷ ${n} : combien de paquets de ${n} dans ${a} ? Il y en a ${t}, car ${t} × ${n} = ${a}.`,
        plan: ['numeric', 'numeric', 'multiple', 'multiple', 'missing']
    };
});
SKILLS['divide-7'].maxAvgMs = 6000;   // comme ×7

const SKILL_ORDER = ['addition-simple', 'subtract-simple', 'multiply-2', 'multiply-3', 'multiply-4', 'multiply-5', 'multiply-6', 'multiply-7', 'multiply-8', 'multiply-9', 'multiply-10', 'multiply-mix', 'divide-2', 'divide-3', 'divide-4', 'divide-5', 'divide-6', 'divide-7', 'divide-8', 'divide-9', 'divide-10'];

// Seuils de maîtrise (niveau 1 = vu ; une compétence peut surcharger le temps avec `maxAvgMs` dans SKILLS, 2 = en cours, 3 = maîtrisé ⭐⭐⭐)
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

// Série rapide ⚡ : 5 calculs enchaînés sur des compétences déjà en bonne voie (niveau ≥ minLevel).
// Aucune pénalité : seul un bonus d'étoiles récompense la rapidité (réflexion ≤ fastMs).
// Seules les `maxRewardedPerDay` premières séries de la journée rapportent des étoiles (pas de « farm »).
const RAPID = { length: 5, minLevel: 2, fastMs: 5000, maxRewardedPerDay: 2 };

// Mélange des notions : jusqu'à `recallPerSession` questions sur 5 (40 %) reprennent des compétences déjà
// pratiquées (autres que la compétence du jour). Les calculs à revoir (REVIEW) occupent ces places en priorité.
const MIX = { recallPerSession: 2 };

// Planètes déverrouillées avec le total d'étoiles collectées
const PLANETS = [
    { name: 'Lune', emoji: '🌕', unlockAt: 10 },
    { name: 'Mars', emoji: '🔴', unlockAt: 25 },
    { name: 'Saturne', emoji: '🪐', unlockAt: 50 }
];
