// MathPulse - Chapitres de l'histoire (le renard 🦊 et la lapine 🐰)
// Source : docs/storyboard-narratif.md. Un chapitre se débloque quand le total d'étoiles atteint `unlockAt`.
// Pour l'instant : titre, seuil et thème de la mission. Les scènes (vignettes) viennent ensuite.
// Les émojis sont des illustrations provisoires, à remplacer par des SVG.

const CHAPTERS = [
    { id: 'lapine',      number: 1,  unlockAt: 0,   emoji: '🌲', title: 'Une drôle de lapine',        mission: 'Le test de la lapine' },
    { id: 'vaisseau',    number: 2,  unlockAt: 6,   emoji: '🛸', title: 'Le vaisseau en piteux état', mission: 'Dégager les débris' },
    { id: 'circuits',    number: 3,  unlockAt: 15,  emoji: '🔌', title: 'Les circuits',               mission: 'Doubler et grouper' },
    { id: 'machines',    number: 4,  unlockAt: 28,  emoji: '⚙️', title: 'La salle des machines',      mission: 'Compter par groupes' },
    { id: 'energie',     number: 5,  unlockAt: 45,  emoji: '🔋', title: 'Partager l\'énergie',        mission: 'Répartir les cellules' },
    { id: 'carnet',      number: 6,  unlockAt: 65,  emoji: '📒', title: 'Le carnet de mesures',       mission: 'Compléter les relevés' },
    { id: 'fenetre',     number: 7,  unlockAt: 90,  emoji: '⏰', title: 'La fenêtre de départ',       mission: 'Trouver le bon moment' },
    { id: 'embarquement', number: 8, unlockAt: 120, emoji: '🚪', title: 'Embarquement surprise',      mission: 'Vérifier le carburant' },
    { id: 'voyage',      number: 9,  unlockAt: 155, emoji: '☄️', title: 'Le voyage',                  mission: 'Naviguer entre les astéroïdes' },
    { id: 'retour',      number: 10, unlockAt: 195, emoji: '🔦', title: 'Le retour',                  mission: 'Atterrir en douceur' }
];

// Chapitres débloqués avec ce total d'étoiles
function chaptersUnlockedAt(stars) {
    return CHAPTERS.filter(c => stars >= c.unlockAt);
}

// Chapitres franchis quand le total passe de `before` à `after` (plusieurs possibles d'un coup)
function newChaptersBetween(before, after) {
    return CHAPTERS.filter(c => before < c.unlockAt && after >= c.unlockAt);
}

// Prochain chapitre à débloquer, ou null une fois toute l'histoire ouverte
function nextChapter(stars) {
    return CHAPTERS.find(c => stars < c.unlockAt) || null;
}
