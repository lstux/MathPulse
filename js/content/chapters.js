// MathPulse - Chapitres de l'histoire (le renard 🦊 et la lapine 🐰)
// Source : docs/storyboard-narratif.md. Un chapitre se débloque quand le total d'étoiles atteint `unlockAt`.
// Chaque chapitre : titre, seuil, banner (décor affiché en bannière sur l'écran Univers quand c'est le chapitre en cours), thème de la mission, et :
//   scene : vignettes { art, cast, lines } jouées au déblocage du chapitre (voir scene.js)
//     art  : décor (forest, clearing, ship, ship-lit, engine…, cockpit…, space…, hill…), fichiers dans assets/story/scene/
//     cast : personnages affichés { who: 'fox' | 'rabbit', at: 'left' | 'right' | 'center', small? }
//     lines: { who: 'narrator' | 'fox' | 'rabbit', text, mood? } (mood : expression du visage)
//   lines: lignes de la lapine, une au hasard sur l'écran de l'univers avant « C'est parti »
//   ambience : ambiance sonore du chapitre (nature | ship | space), jouée pendant la scène et sur l'écran Univers
//   sfx  : son joué à la fin de la scène du chapitre (ici les applaudissements)
//   end  : message de fin de session { full (3 ⭐), some (1 à 2 ⭐), none (0 ⭐) } ; absent = pas de message
// Règle d'écriture : textes courts (une quarantaine de mots par vignette au plus), lisibles seul en CE2.
// Les émojis de la liste des chapitres sont provisoires, à remplacer par des SVG.

const CHAPTERS = [
    { id: 'lapine',      number: 1,  unlockAt: 0, ambience: 'nature', banner: 'forest',   emoji: '🌲', title: 'Une drôle de lapine',        mission: 'Le test de la lapine',
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
    { id: 'vaisseau',    number: 2,  unlockAt: 6, ambience: 'nature', banner: 'clearing',   emoji: '🛸', title: 'Le vaisseau en piteux état', mission: 'Dégager les débris',
        scene: [
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Voilà mon vaisseau." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Il est… dans un piteux état." },
                { who: 'rabbit', text: "Il a connu pire. Il est réparable !" }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'content', text: "Ça sent le métal chaud. Et un peu la myrtille, non ?" },
                { who: 'rabbit', text: "Décidément, vous les renards, vous êtes de vrais extraterrestres !" }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Euh… T'es un extraterrestre, toi, non ?" },
                { who: 'rabbit', mood: 'think', text: "Pfff, je ne comprendrai jamais les renards !" }] },
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
    { id: 'circuits',    number: 3,  unlockAt: 15, ambience: 'ship', banner: 'ship-lit',  emoji: '🔌', title: 'Les circuits',               mission: 'Doubler et grouper',
        scene: [
            { sfx: 'power-on', art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
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
    { id: 'machines',    number: 4,  unlockAt: 28, ambience: 'ship', banner: 'engine-on',  emoji: '⚙️', title: 'La salle des machines',      mission: 'Compter par groupes',
        scene: [
            { sfx: 'engine-start', art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
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
    { id: 'nuit', number: 5, unlockAt: 38, ambience: 'ship', banner: 'cockpit-night', emoji: '🌙', title: 'La nuit à bord', mission: 'Un jeu pour patienter',
        scene: [
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Le premier essai a fait chauffer les moteurs. Il faut les laisser refroidir avant le prochain réglage." }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'narrator', text: "Depuis dix minutes, le 🦊 raconte tout ce qui lui passe par la tête." },
                { who: 'rabbit', mood: 'content', text: "Comme tous les renards, tu parles beaucoup ! Mais ça va, je t'aime bien quand même !" }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'content', text: "Ah ben ça tombe bien, parce qu'on est coincés au moins 1 h ici !" }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'bravo', text: "Mais finalement, j'aime bien les lapins, surtout s'ils sont extraterrestres. C'est plus original, on en voit pas souvent et…" },
                { who: 'rabbit', mood: 'think', text: "Chut !!!" }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Tu as entendu ? Un tout petit bip, sur la console." },
                { who: 'fox', mood: 'worried', text: "Un bip ? Où ça ?" }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Rien. Le moteur qui refroidit, sûrement. Un jeu de chez moi pour patienter : je dis un nombre, tu dis ce qui manque pour aller à 10. 7 ?" },
                { who: 'fox', mood: 'think', text: "3 !" }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Tu vois, une heure passe vite quand on compte." }] }
        ],
        lines: [
            "Une bonne veillée commence par un petit jeu de chiffres.",
            "Chut… écoute, le vaisseau respire.",
            "Tu parles beaucoup, mais tu comptes bien."
        ],
        end: { some: "La nuit passe plus vite avec toi !" }
    },
    { id: 'energie',     number: 6,  unlockAt: 50, ambience: 'ship', banner: 'tanks-full',  emoji: '🔋', title: 'Partager l\'énergie',        mission: 'Répartir les cellules',
        scene: [
            { sfx: 'tank-fill', art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
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
    { id: 'carnet',      number: 7,  unlockAt: 68, ambience: 'ship', banner: 'cockpit',  emoji: '📒', title: 'Le carnet de mesures',       mission: 'Compléter les relevés',
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
    { id: 'carte', number: 8, unlockAt: 88, ambience: 'ship', banner: 'cockpit-chart', emoji: '🗺️', title: 'La carte du ciel', mission: 'Lire la carte',
        scene: [
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Pour quitter la Terre, il faut viser une fenêtre de départ : un moment précis." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Mon étoile et la Terre s'alignent toutes les 7 heures. Dans 6 alignements, combien d'heures ?" },
                { who: 'fox', mood: 'think', text: "42 !" }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Exactement. Une bonne table, c'est une bonne carte." },
                { who: 'fox', mood: 'content', text: "Et pour 8 alignements ? 7 fois 8 ?" }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si on se trompe d'arc ?" },
                { who: 'rabbit', text: "On vérifie sur la carte. Toujours deux fois." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Ma carte est prête. Il reste à calculer le compte à rebours." }] }
        ],
        lines: [
            "Une bonne table, c'est une bonne carte.",
            "Chaque alignement compte : multiplie, et tu trouves.",
            "Regarde, les arcs se rejoignent presque."
        ],
        end: { some: "La carte du ciel est tracée grâce à toi !" }
    },
    { id: 'fenetre', number: 9, unlockAt: 108, ambience: 'ship', banner: 'cockpit-lit', emoji: '⏰', title: 'La fenêtre de départ', mission: 'Trouver le bon moment',
        scene: [
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Sept fois huit, cinquante-six : voilà notre compte à rebours. Il faut le découper." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "56 minutes, en 8 étapes égales. Chaque étape dure combien : 56 ÷ 8 ?" },
                { who: 'fox', mood: 'bravo', text: "7 minutes !" }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si on rate la fenêtre ?" },
                { who: 'rabbit', text: "Il y en aura une autre. Mais celle-ci est la meilleure : on ne gaspille pas d'énergie." }] },
            { art: 'cockpit-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Regarde : tous les voyants se rallument !" },
                { who: 'fox', mood: 'content', text: "Comme au début, en mieux." }] },
            { art: 'cockpit-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Navigation réparée. Alors… c'est l'heure des adieux." },
                { who: 'fox', mood: 'comfort', text: "Déjà…" }] }
        ],
        lines: [
            "Plus qu'un petit calcul, et on peut décoller.",
            "Partager le temps en étapes égales : c'est ça, diviser.",
            "Tu as vu ? Tous les voyants se rallument."
        ],
        end: { some: "La fenêtre de départ est calculée grâce à toi !" }
    },
    { id: 'message', number: 10, unlockAt: 130, ambience: 'ship', banner: 'cockpit-radio', emoji: '📡', title: 'Un message de chez elle', mission: 'Décoder le signal',
        scene: [
            { sfx: 'radio-signal', art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Attends. Mon récepteur capte quelque chose… Un signal. De chez moi !" },
                { who: 'fox', mood: 'content', text: "Le bip de l'autre nuit !" }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Chez moi, on double chaque nombre pour être sûr de ne pas se tromper. Le double de 45 ?" },
                { who: 'fox', mood: 'think', text: "90 !" }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Et celui-ci est multiplié par 100. 6 fois 100 ?" },
                { who: 'fox', mood: 'bravo', text: "600 !" }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'comfort', text: "« …on pense à toi. Reviens quand tu pourras. » C'est ma famille, renard." }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'comfort', text: "Ils t'attendent. Alors on va te ramener." },
                { who: 'rabbit', mood: 'content', text: "Merci, renard. Même si tu parles beaucoup." }] },
            { art: 'cockpit-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Cette fois, vraiment, c'est l'heure des adieux." }] }
        ],
        lines: [
            "Même de loin, les nombres se comprennent.",
            "Doubler, c'est répéter deux fois : chez moi, on le fait pour être sûr.",
            "Chez moi, on dit : un message juste arrive toujours."
        ],
        end: { some: "Tu as aidé la 🐰 à décoder le message de chez elle." }
    },
    { id: 'embarquement', number: 11, unlockAt: 155, ambience: 'space', banner: 'porthole-earth', emoji: '🚪', title: 'Embarquement surprise',      mission: 'Vérifier le carburant',
        scene: [
            { art: 'airlock', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Merci pour tout, renard. Sans toi, je serais encore là." }] },
            { sfx: 'airlock-close', art: 'airlock-closed', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Euh… la porte ?" }] },
            { sfx: 'launch', art: 'porthole-earth', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'surprise', text: "Je n'avais pas prévu ça. Comment je rentre ?!" }] },
            { art: 'fuel', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'comfort', text: "Respire. S'il reste assez pour revenir, je te ramène. 83 moins 27 ?" },
                { who: 'fox', mood: 'think', text: "56 !" }] },
            { art: 'fuel', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Assez pour le retour !" },
                { who: 'fox', mood: 'content', text: "Dis donc, l'extraterrestre, tu as eu peur !" }] },
            { art: 'fuel', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Chut. Les renards n'ont pas à tout répéter. Mais d'abord une escale : mon rapport doit partir par la balise relais." }] }
        ],
        lines: [
            "Il en reste assez. Je te le promets, renard.",
            "Calculer le retour, c'est la meilleure façon de se rassurer.",
            "Regarde par le hublot : on n'est jamais perdu quand on sait compter."
        ],
        end: { some: "Tu as aidé la 🐰 à vérifier le carburant." }
    },
    { id: 'voyage',      number: 12,  unlockAt: 185, ambience: 'space', banner: 'space-beacon-on', emoji: '☄️', title: 'Le voyage',                  mission: 'Naviguer entre les astéroïdes',
        scene: [
            { art: 'space-beacon', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "La balise relais est là-bas. Un chemin sûr passe entre ces rochers." }] },
            { art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Chaque tronçon ajoute sa distance : 38 plus 45 ?" },
                { who: 'fox', mood: 'content', text: "83 !" }] },
            { sfx: 'asteroid-pass', art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'narrator', text: "Un astéroïde frôle le hublot. Le 🦊 serre les pattes, mais continue de compter." }] },
            { art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Tu n'as plus peur ?" },
                { who: 'fox', mood: 'worried', text: "Si. Mais je calcule quand même : 6 fois 7, quarante-deux !" }] },
            { sfx: 'beacon-ping', art: 'space-beacon-on', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Mission accomplie. Regarde, la petite étoile jaune, là-bas : c'est chez moi." }] },
            { art: 'space-home', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Maintenant, on te ramène." }] }
        ],
        lines: [
            "Droit devant, puis à gauche : tu navigues comme un pro.",
            "Chaque tronçon compte. Additionne, et on passe.",
            "Ta peur est une bonne alliée : elle te rend prudent."
        ],
        end: { some: "Tu as aidé la 🐰 à guider le vaisseau jusqu'à la balise." }
    },
    { id: 'retour',      number: 13, unlockAt: 225, ambience: 'nature', sfx: 'applause', banner: 'hill', emoji: '🔦', title: 'Le retour',                  mission: 'Atterrir en douceur',
        scene: [
            { art: 'earth-top', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Pour se poser doucement, on divise la vitesse par deux. La moitié de 80 ?" },
                { who: 'fox', mood: 'content', text: "40 !" }] },
            { art: 'earth-top', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Et le double de 35 ? Pour les freins, 7 fois 100 ?" },
                { who: 'fox', mood: 'bravo', text: "70 ! Et 700 !" }] },
            { sfx: 'landing', art: 'hill', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'comfort', text: "Tu vas me manquer." },
                { who: 'rabbit', mood: 'content', text: "Et toi à moi." }] },
            { sfx: 'flashlight-click', art: 'hill', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Garde ma petite lampe. Un éclair pour dire bonne nuit, deux pour dire je pense à toi. Chaque soir, regarde le ciel." }] },
            { art: 'hill-reply', cast: [{ who: 'fox', at: 'center' }], lines: [
                { who: 'fox', mood: 'moved', text: "Deux éclairs… Et là-haut, une petite lueur me répond." },
                { who: 'narrator', text: "Dans le carnet de la 🐰 : « Prochaine mission : à suivre. »" }] }
        ],
        lines: [
            "Chaque soir, une lumière dans le ciel : c'est moi.",
            "Doubler, partager en deux : deux gestes pour atterrir en douceur.",
            "Tu sais, renard, tu es un excellent copilote."
        ],
        end: { some: "Tu as aidé la 🐰 à rentrer… et à te ramener." }
    }
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
