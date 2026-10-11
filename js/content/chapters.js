// MathPulse - Chapitres de l'histoire (le renard 🦊 et la lapine 🐰)
// Source : docs/storyboard-narratif.md. Un chapitre se débloque quand le total d'étoiles atteint `unlockAt`.
// Chaque chapitre : titre, seuil, thème de la mission, et (chapitres 1 à 3 pour l'instant) :
//   scene : vignettes { art, cast, lines } jouées au déblocage du chapitre (voir scene.js)
//     art  : décor (forest | clearing | ship | ship-lit), fichiers dans assets/story/scene/
//     cast : personnages affichés { who: 'fox' | 'rabbit', at: 'left' | 'right' | 'center', small? }
//     lines: { who: 'narrator' | 'fox' | 'rabbit', text, mood? } (mood : expression du visage)
//   lines: lignes de la lapine, une au hasard sur l'écran de l'univers avant « C'est parti »
//   end  : message de fin de session { full (3 ⭐), some (1 à 2 ⭐), none (0 ⭐) } ; absent = pas de message
// Règle d'écriture : textes courts (une quarantaine de mots par vignette au plus), lisibles seul en CE2.
// Les émojis de la liste des chapitres sont provisoires, à remplacer par des SVG.

const CHAPTERS = [
    { id: 'lapine',      number: 1,  unlockAt: 0,   emoji: '🌲', title: 'Une drôle de lapine',        mission: 'Le test de la lapine',
        scene: [
            { art: 'forest', cast: [{ who: 'fox', at: 'left', small: true }], lines: [
                { who: 'narrator', text: "Une lueur entre les arbres… Tu t'approches, le cœur un peu rapide." }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Bonsoir ! Je suis exploratrice. Je viens d'une planète autour d'une étoile que tu vois parfois dans le ciel." }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Tu es tombée du ciel ?!" },
                { who: 'rabbit', text: "Posée en urgence. Une micro-météorite a abîmé mon circuit de navigation. Rien de grave !" }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Mon vaisseau est juste derrière. Mais on ne montre pas ses instruments au premier venu : un petit test d'abord." }] },
            { art: 'forest', cast: [{ who: 'rabbit', at: 'center' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Cinq calculs. Prêt ?" }] }
        ],
        lines: [
            "On avance doucement, c'est la bonne méthode.",
            "Mon vaisseau t'attend. Encore un petit effort !",
            "Tu comptes vite. Les scientifiques adorent ça."
        ],
        end: { full: "Parfait ! La 🐰 est impressionnée.", some: "Bien joué ! La 🐰 te fait confiance.", none: "Pas grave, la 🐰 te laisse retenter." }
    },
    { id: 'vaisseau',    number: 2,  unlockAt: 6,   emoji: '🛸', title: 'Le vaisseau en piteux état', mission: 'Dégager les débris',
        scene: [
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Voilà mon vaisseau." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Il est… dans un piteux état." },
                { who: 'rabbit', text: "Il a connu pire. Il est réparable !" }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Avant de réparer, il faut dégager. Sur ce panneau, il y a 18 morceaux, et 9 sont cassés. Combien restent bons ?" }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Neuf !" },
                { who: 'rabbit', mood: 'bravo', text: "Exactement. Tu retires ce qui est cassé, et il reste ce qui marche." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Allons-y. Un morceau après l'autre." }] }
        ],
        lines: [
            "Enlever, c'est aussi une façon de compter.",
            "Moins il y a de débris, plus il y a de place pour réparer.",
            "Ne t'inquiète pas, renard, on avance bien."
        ],
        end: { full: "Le panneau est presque propre !", some: "Tu as aidé la 🐰 à dégager le vaisseau." }
    },
    { id: 'circuits',    number: 3,  unlockAt: 15,  emoji: '🔌', title: 'Les circuits',               mission: 'Doubler et grouper',
        scene: [
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "C'est… plus grand que je pensais." }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Le circuit principal est mort. Mais les circuits de secours peuvent le remplacer, si on les double." }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Chaque module demande 2 piles. Il y a 7 modules : combien de piles ?" }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si je me trompe ?" },
                { who: 'rabbit', text: "On vérifie deux fois. C'est ça, être scientifique." }] },
            { art: 'ship-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'bravo', text: "Quatorze ?" },
                { who: 'rabbit', mood: 'bravo', text: "Quatorze ! Regarde, le premier voyant brille." }] }
        ],
        lines: [
            "Deux par module, cinq par paquet : tout s'allume peu à peu.",
            "Tu vois ? Dès qu'on groupe, c'est plus simple.",
            "Respire, renard. Tu fais ça très bien."
        ],
        end: { some: "Un voyant de plus brille grâce à toi !" }
    },
    { id: 'machines',    number: 4,  unlockAt: 28,  emoji: '⚙️', title: 'La salle des machines',      mission: 'Compter par groupes',
        scene: [
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Voici le cœur du vaisseau : les moteurs." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Pour les relancer, je dois savoir combien il y a de pistons en tout." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Quatre, huit, douze…" },
                { who: 'rabbit', mood: 'bravo', text: "Douze ! Voilà." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si le moteur s'emballe ?" },
                { who: 'rabbit', text: "Alors on le calme. Un moteur se règle par petits pas." }] },
            { art: 'engine-on', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Les moteurs tournent. Mais sans circuit de navigation, impossible de savoir où aller. Il me faudra mes mesures." }] }
        ],
        lines: [
            "Trois par rangée, quatre par rangée : tu verras, ça roule.",
            "Écoute : les moteurs commencent à ronronner.",
            "Compter par groupes, c'est compter malin."
        ],
        end: { some: "Un moteur de plus tourne grâce à toi !" }
    },
    { id: 'energie',     number: 5,  unlockAt: 45,  emoji: '🔋', title: 'Partager l\'énergie',        mission: 'Répartir les cellules',
        scene: [
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Pour démarrer, il faut répartir l'énergie." }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Douze cellules, trois réservoirs, autant dans chacun. Combien ?" },
                { who: 'fox', mood: 'content', text: "Quatre !" }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Chez moi aussi on partage tout. Le soir, tout le village partage la lumière de la veillée." }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Et si je fais des paquets de 5 avec 15 cellules ?" },
                { who: 'fox', mood: 'bravo', text: "Trois paquets !" }] },
            { art: 'tanks-full', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Ils sont pleins. Ton partage était juste." }] }
        ],
        lines: [
            "Partager, c'est un peu l'inverse de multiplier.",
            "Combien de paquets ? Pense à ta table, elle t'aide.",
            "Chez moi, on dit : un partage juste fait des amis."
        ],
        end: { some: "Tu as aidé la 🐰 à répartir l'énergie." }
    },
    { id: 'carnet',      number: 6,  unlockAt: 65,  emoji: '📒', title: 'Le carnet de mesures',       mission: 'Compléter les relevés',
        scene: [
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Voilà ma vraie mission : vérifier que la Terre est comme on l'avait mesurée de loin." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Il manque des chiffres. Pour arriver à 100, il manque combien à 64 ?" },
                { who: 'fox', mood: 'content', text: "36 !" }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si les mesures étaient fausses ?" },
                { who: 'rabbit', text: "Alors je le noterai aussi. Un résultat surprenant, c'est de la science." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Les mesures de loin étaient justes. La Terre accueille bien les voyageurs." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Il me reste à réparer la navigation pour le rapporter chez moi." }] }
        ],
        lines: [
            "Il manque combien ? C'est la question préférée des explorateurs.",
            "Une mesure juste vaut mieux qu'une mesure rapide.",
            "Encore une page, et le carnet sera complet."
        ],
        end: { some: "Tu as aidé la 🐰 à compléter son carnet." }
    },
    { id: 'fenetre',     number: 7,  unlockAt: 90,  emoji: '⏰', title: 'La fenêtre de départ',       mission: 'Trouver le bon moment',
        scene: [
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Pour quitter la Terre, il faut viser une fenêtre de départ : un moment précis." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Mon étoile et la Terre s'alignent toutes les 7 heures. Dans 6 alignements, combien d'heures ?" },
                { who: 'fox', mood: 'think', text: "42 !" }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si on rate la fenêtre ?" },
                { who: 'rabbit', text: "Il y en aura une autre. Mais celle-ci est la meilleure : on ne gaspille pas d'énergie." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "56 minutes en 8 étapes égales : 56 ÷ 8 ?" },
                { who: 'fox', mood: 'bravo', text: "7 minutes !" }] },
            { art: 'cockpit-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Navigation réparée. Alors… c'est l'heure des adieux." }] }
        ],
        lines: [
            "Une bonne table, c'est une bonne carte.",
            "Plus qu'un petit calcul, et on peut décoller.",
            "Tu as vu ? Tous les voyants se rallument."
        ],
        end: { some: "La fenêtre de départ est calculée grâce à toi !" }
    },
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

// Chapitre en cours : le dernier ouvert avec ce total d'étoiles
function currentChapter(stars) {
    const unlocked = chaptersUnlockedAt(stars);
    return unlocked[unlocked.length - 1];
}

// Premier chapitre ouvert qui a une scène pas encore lue (seen : { idDuChapitre: true }), ou null
function pendingScene(stars, seen) {
    return chaptersUnlockedAt(stars).find(c => c.scene && !(seen && seen[c.id])) || null;
}

// Une ligne de la lapine pour le chapitre, au hasard (rnd injectable pour les tests), ou null s'il n'y en a pas
function randomLine(chapter, rnd = Math.random) {
    if (!chapter || !chapter.lines || !chapter.lines.length) return null;
    return chapter.lines[Math.min(chapter.lines.length - 1, Math.floor(rnd() * chapter.lines.length))];
}

// Message de fin de session du chapitre selon les étoiles gagnées (3 → full, 1 à 2 → some, 0 → none), ou null
function chapterEndLine(chapter, starsEarned) {
    if (!chapter || !chapter.end) return null;
    const e = chapter.end;
    if (starsEarned >= 3) return e.full || e.some || null;
    if (starsEarned >= 1) return e.some || null;
    return e.none || null;
}
