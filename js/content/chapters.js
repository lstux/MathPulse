// MathPulse - Chapitres de l'histoire : le renard 🦊 (c'est le joueur : {nom} dans les textes = son prénom, voir player.js) et la hase exploratrice 🐰 ({hase} dans les textes = HARE_NAME ci-dessous)
// (les identifiants « rabbit » et « lapine » sont historiques : ils servent de clés dans les données et les fichiers, on ne les renomme pas)
// Source : docs/storyboard-narratif.md. Un chapitre se débloque quand l'avancée de l'histoire (progression.getStoryPoints()) atteint `unlockAt`.
// v2 : l'histoire avance avec les activités TERMINÉES (STORY ci-dessous), jamais avec le score : un enfant en difficulté n'est pas bloqué.
// Les étoiles restent une récompense, sans rôle de verrou.
// Chaque chapitre : titre, seuil, banner (décor affiché en bannière sur l'écran Univers quand c'est le chapitre en cours), thème de la mission, et :
//   scene : vignettes { art, cast, lines } jouées au déblocage du chapitre (voir scene.js)
//     art  : décor (forest, clearing, ship, ship-lit, engine…, cockpit…, space…, hill…), fichiers dans assets/story/scene/
//     cast : personnages affichés { who: 'fox' | 'rabbit', at: 'left' | 'right' | 'center', small? }
//     lines: { who: 'narrator' | 'fox' | 'rabbit', text, mood? } (mood : expression du visage)
//   lines: lignes d'Andrea, une au hasard sur l'écran de l'univers avant « C'est parti »
//   ambience : ambiance sonore du chapitre (nature | ship | space), jouée pendant la scène et sur l'écran Univers
//   sfx  : son joué à la fin de la scène du chapitre (ici les applaudissements)
//   idea : l'idée de science du chapitre, en une phrase (elle s'écrit dans le carnet de découvertes quand la scène a été lue)
//   end  : message de fin de session { full (3 ⭐), some (1 à 2 ⭐), none (0 ⭐) } ; absent = pas de message
// Règles d'écriture : textes courts (une quarantaine de mots par vignette au plus), lisibles seul en CE2.
// Le renard est le joueur : dans les scènes il pose des questions, il ne donne pas la réponse aux calculs (c'est la session qui y répond).
// Une idée de science par chapitre, en une phrase, jamais un cours (liste dans docs/storyboard-narratif.md).
// Les émojis de la liste des chapitres sont provisoires, à remplacer par des SVG.

// Nom de la hase : À CHANGER ICI SEULEMENT. Dans tous les textes (chapitres, missions), écrire {hase}, jamais le nom en dur.
// Éviter « de {hase} » et « que {hase} » : l'élision (d', qu') dépend de la première lettre du nom.
const HARE_NAME = 'Andrea';

// Avancée de l'histoire par activité terminée, quel que soit le résultat (une session rapportait au mieux 3 étoiles : les seuils gardent leur rythme)
const STORY = { session: 3, mission: 3, rapid: 1, free: 1 };

const CHAPTERS = [
    { id: 'lapine',      number: 1,  unlockAt: 0, ambience: 'nature', banner: 'forest',   emoji: '🌲', title: 'Une drôle de hase',          mission: 'Le test de la hase',
        idea: "Les étoiles sont des soleils très lointains.",
        scene: [
            { art: 'forest', cast: [{ who: 'fox', at: 'left', small: true }], lines: [
                { who: 'narrator', text: "Une lueur entre les arbres… Tu t'approches, le cœur un peu rapide." }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Bonsoir ! Je m'appelle {hase}. Je suis exploratrice, et je viens de très loin." }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Une lapine… tombée du ciel ?!" },
                { who: 'rabbit', text: "Une hase ! Et je ne suis pas tombée : je me suis posée. Un peu vite, c'est vrai." }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Tu vois cette étoile ? C'est un soleil, comme le tien, mais très, très loin. Ma planète tourne autour." }] },
            { art: 'forest', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Et tu repars quand ?" },
                { who: 'rabbit', text: "Dès que mon vaisseau sera réparé. Pour ça, il me faut quelqu'un qui sait compter." }] },
            { art: 'forest', cast: [{ who: 'rabbit', at: 'center' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Un petit test d'abord. Prêt ?" }] }
        ],
        lines: [
            "On avance doucement, c'est la bonne méthode.",
            "Chaque étoile est un soleil lointain. Ça en fait, des voisins !",
            "Tu comptes bien. Les explorateurs adorent ça."
        ],
        end: { full: "Parfait ! {hase} est impressionnée.", some: "Bien joué ! {hase} te fait confiance.", none: "Pas grave, {hase} te laisse retenter." }
    },
    { id: 'vaisseau',    number: 2,  unlockAt: 6, ambience: 'nature', banner: 'clearing',   emoji: '🛸', title: 'Le vaisseau en piteux état', mission: 'Dégager les débris',
        idea: "Une étoile filante est un caillou qui chauffe en frottant l'air.",
        scene: [
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Voilà mon vaisseau." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Il est… tout cabossé." },
                { who: 'rabbit', text: "Il a connu pire. Il est réparable !" }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Qu'est-ce qui lui est arrivé ?" },
                { who: 'rabbit', text: "Un caillou de l'espace, pas plus gros qu'une noisette. Mais il filait très vite." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Quand un caillou comme ça traverse l'air, il frotte, il chauffe et il brille. Vous appelez ça une étoile filante." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'content', text: "Alors une étoile filante, ce n'est pas une étoile ?" },
                { who: 'rabbit', mood: 'content', text: "Pas du tout ! Dis, tu poses toujours autant de questions ?" }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Avant de réparer, il faut trier. On enlève les morceaux cassés et on compte ce qui reste." }] },
            { art: 'clearing', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Un panneau après l'autre. Tu m'aides ?" }] }
        ],
        lines: [
            "Enlever, c'est aussi une façon de compter.",
            "Moins il y a de débris, plus il y a de place pour réparer.",
            "Ne t'inquiète pas, {nom}, on avance bien."
        ],
        end: { full: "Le panneau est presque propre !", some: "Tu as aidé {hase} à dégager le vaisseau." }
    },
    { id: 'circuits',    number: 3,  unlockAt: 15, ambience: 'ship', banner: 'ship-lit',  emoji: '🔌', title: 'Les circuits',               mission: 'Doubler et grouper',
        idea: "L'électricité ne passe que si le circuit forme une boucle fermée.",
        scene: [
            { sfx: 'power-on', art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "C'est… plus grand que je pensais." }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Le circuit principal est grillé. Il reste les circuits de secours." }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "L'électricité, c'est comme une ronde : elle ne passe que si la boucle est fermée. Un seul trou, et tout s'arrête." }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Alors il faut boucher les trous ?" },
                { who: 'rabbit', mood: 'bravo', text: "Exactement ! Avec des piles : 2 par module." }] },
            { art: 'ship', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Il y a beaucoup de modules. Si on compte les piles une par une, on y sera encore demain." }] },
            { art: 'ship-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Regarde ! Un premier voyant s'allume. Compte par 2, et les autres suivront." }] }
        ],
        lines: [
            "Deux par module, cinq par paquet : tout s'allume peu à peu.",
            "Une boucle fermée, et le courant passe.",
            "Respire, {nom}. Tu fais ça très bien."
        ],
        end: { some: "Un voyant de plus brille grâce à toi !" }
    },
    { id: 'machines',    number: 4,  unlockAt: 28, ambience: 'ship', banner: 'engine-on',  emoji: '⚙️', title: 'La salle des machines',      mission: 'Compter par groupes',
        idea: "Une fusée avance en poussant du gaz vers l'arrière.",
        scene: [
            { sfx: 'engine-start', art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Voici le cœur du vaisseau : les moteurs." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Comment ça avance, un vaisseau ? Il n'y a pas de roues." },
                { who: 'rabbit', text: "Il crache du gaz vers l'arrière, très fort. Et ça le pousse vers l'avant." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Comme un ballon qu'on lâche sans le nouer : l'air sort d'un côté, le ballon file de l'autre." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Pour les régler, je dois compter les pistons. Ils sont rangés par 3 et par 4." }] },
            { art: 'engine', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "On ne devrait pas vérifier avant d'allumer ?" },
                { who: 'rabbit', text: "Pas la peine. Je connais ce moteur par cœur." }] },
            { art: 'engine-on', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Tu vois ? Il tourne. Bon… il chauffe un peu. Ce n'est sûrement rien." }] }
        ],
        lines: [
            "Trois par rangée, quatre par rangée : compte par groupes.",
            "Écoute : les moteurs commencent à ronronner.",
            "Compter par groupes, c'est compter malin."
        ],
        end: { some: "Un moteur de plus tourne grâce à toi !" }
    },
    { id: 'nuit', number: 5, unlockAt: 38, ambience: 'ship', banner: 'cockpit-night', emoji: '🌙', title: 'La nuit à bord', mission: 'Un jeu pour patienter',
        idea: "La Terre tourne sur elle-même : c'est ce qui fait le jour et la nuit.",
        scene: [
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'narrator', text: "Le moteur a trop chauffé. Il s'est arrêté tout seul, dans un grand soupir." }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'comfort', text: "J'ai voulu aller trop vite. Tu avais raison : il fallait vérifier." },
                { who: 'fox', mood: 'comfort', text: "Ça arrive. On recommencera." }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Il doit refroidir toute la nuit. Regarde dehors, en attendant." }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Les étoiles ont bougé depuis tout à l'heure !" },
                { who: 'rabbit', mood: 'content', text: "Non. C'est la Terre qui tourne, comme une toupie. Un tour complet, et c'est un jour." }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Chut… Tu as entendu ? Un tout petit bip, sur la console." },
                { who: 'fox', mood: 'worried', text: "Un bip ? Où ça ?" }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Plus rien. Bon. Un jeu de chez moi pour patienter : je dis un nombre, tu trouves ce qui manque pour faire 10." }] },
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Et tes questions, {nom}… continue. Elles me font vérifier." }] }
        ],
        lines: [
            "La nuit, c'est juste la Terre qui tourne le dos au Soleil.",
            "Chut… écoute, le vaisseau respire.",
            "Pose tes questions. La prochaine fois, je t'écouterai."
        ],
        end: { some: "La nuit passe plus vite avec toi !" }
    },
    { id: 'energie',     number: 6,  unlockAt: 50, ambience: 'ship', banner: 'tanks-full',  emoji: '🔋', title: 'Partager l\'énergie',        mission: 'Répartir les cellules',
        idea: "L'énergie ne se fabrique pas : on la capte, on la stocke, on la transforme.",
        scene: [
            { sfx: 'tank-fill', art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Le moteur est froid. Cette fois, on fait les choses dans l'ordre : d'abord l'énergie." }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Elle vient d'où, ton énergie ?" },
                { who: 'rabbit', text: "De la lumière de ton Soleil. Mes panneaux l'attrapent et la rangent dans des cellules." }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "L'énergie, on ne la fabrique pas. On la prend quelque part, on la garde, puis on la change en mouvement ou en lumière." }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Il faut la partager entre les réservoirs : autant dans chacun, sinon le vaisseau penche." }] },
            { art: 'tanks', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'content', text: "On vérifie le partage avant de remplir ?" },
                { who: 'rabbit', mood: 'bravo', text: "On vérifie. Deux fois, même !" }] },
            { art: 'tanks-full', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Pleins, et bien équilibrés. Ton partage était juste." }] }
        ],
        lines: [
            "Partager, c'est un peu l'inverse de multiplier.",
            "Combien de paquets ? Pense à ta table, elle t'aide.",
            "Chez moi, on dit : un partage juste fait des amis."
        ],
        end: { some: "Tu as aidé {hase} à répartir l'énergie." }
    },
    { id: 'carnet',      number: 7,  unlockAt: 68, ambience: 'ship', banner: 'cockpit',  emoji: '📒', title: 'Le carnet de mesures',       mission: 'Compléter les relevés',
        idea: "La Terre a de l'eau liquide parce qu'elle est à la bonne distance du Soleil.",
        scene: [
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Je ne t'ai pas dit pourquoi je suis venue. Voilà mon carnet de mesures." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "De chez moi, on a mesuré ta planète de très loin. On pense qu'elle a de l'eau liquide. C'est rare !" }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Pourquoi c'est rare ?" },
                { who: 'rabbit', text: "Trop près de son soleil, l'eau s'évapore. Trop loin, elle gèle. La Terre est juste à la bonne distance." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Je dois tout vérifier sur place. Mais il manque des chiffres dans mes relevés : il faut compléter jusqu'à 100." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si vos mesures de loin étaient fausses ?" },
                { who: 'rabbit', mood: 'content', text: "Alors je le noterai. Une surprise, c'est aussi de la science." }] },
            { art: 'cockpit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Une rivière, la pluie, la rosée du matin… Tout est là. Il me reste à rapporter ça chez moi." }] }
        ],
        lines: [
            "Il manque combien ? C'est la question préférée des explorateurs.",
            "Une mesure juste vaut mieux qu'une mesure rapide.",
            "Encore une page, et le carnet sera complet."
        ],
        end: { some: "Tu as aidé {hase} à compléter son carnet." }
    },
    { id: 'carte', number: 8, unlockAt: 88, ambience: 'ship', banner: 'cockpit-chart', emoji: '🗺️', title: 'La carte du ciel', mission: 'Lire la carte',
        idea: "Les constellations et l'étoile Polaire servent à se repérer.",
        scene: [
            { art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Pour rentrer, il me faut une carte. Et la carte, elle est là-haut." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Vous reliez les étoiles par des traits pour dessiner des figures. Vous appelez ça des constellations." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'content', text: "Celle-là, c'est la Grande Ourse ! On dirait une casserole." },
                { who: 'rabbit', mood: 'bravo', text: "Suis son bord : il montre une étoile qui ne bouge presque pas. L'étoile Polaire. Elle indique le nord." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Sur ma carte, les distances vont par paquets de 6, 7, 8 ou 9. Il faut bien connaître ses tables pour ne pas se perdre." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si on se trompe de chemin ?" },
                { who: 'rabbit', text: "On reprend un repère sûr et on recalcule. Une carte, ça se vérifie." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "La route est tracée. Il reste à savoir quand partir." }] }
        ],
        lines: [
            "Une bonne table, c'est une bonne carte.",
            "Cherche la casserole : elle te montre le nord.",
            "Regarde, la route se dessine presque toute seule."
        ],
        end: { some: "La carte du ciel est tracée grâce à toi !" }
    },
    { id: 'fenetre', number: 9, unlockAt: 108, ambience: 'ship', banner: 'cockpit-lit', emoji: '⏰', title: 'La fenêtre de départ', mission: 'Trouver le bon moment',
        idea: "La Terre tourne autour du Soleil en un an : il faut partir au bon moment.",
        scene: [
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "On ne part pas quand on veut. La Terre file autour du Soleil : un tour complet, c'est une année." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Si je décolle au mauvais moment, elle m'emmène du mauvais côté. Il faut attendre qu'elle soit bien placée." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Comme sauter d'un manège qui tourne ?" },
                { who: 'rabbit', mood: 'bravo', text: "Exactement comme ça ! On saute quand on est en face de la sortie." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Le bon moment arrive bientôt. Je dois découper le temps qui reste en étapes égales." }] },
            { art: 'cockpit-chart', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Et si on rate ce moment ?" },
                { who: 'rabbit', text: "Il y en aura un autre, plus tard. Mais celui-ci demande moins d'énergie." }] },
            { art: 'cockpit-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Regarde : tous les voyants sont allumés. La navigation est réparée !" }] },
            { art: 'cockpit-lit', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'comfort', text: "Alors… tu vas partir." },
                { who: 'rabbit', mood: 'comfort', text: "Pas ce soir. Demain." }] }
        ],
        lines: [
            "Plus qu'un petit calcul, et on peut décoller.",
            "Partager le temps en étapes égales : c'est ça, diviser.",
            "Un tour de Soleil, une année. Tu en as déjà fait combien ?"
        ],
        end: { some: "La fenêtre de départ est calculée grâce à toi !" }
    },
    { id: 'message', number: 10, unlockAt: 130, ambience: 'ship', banner: 'cockpit-radio', emoji: '📡', title: 'Un message de chez elle', mission: 'Décoder le signal',
        idea: "Un message met du temps à voyager, même à la vitesse de la lumière.",
        scene: [
            { sfx: 'radio-signal', art: 'cockpit-night', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Attends. Le récepteur capte quelque chose… Un signal. De chez moi !" },
                { who: 'fox', mood: 'content', text: "Le bip de l'autre nuit !" }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Il est très faible. Chez moi, on envoie chaque nombre en double, pour être sûr qu'il arrive entier." }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Ils viennent de l'envoyer ?" },
                { who: 'rabbit', mood: 'think', text: "Oh non. Un message file aussi vite que la lumière, mais c'est si loin… Il voyage depuis des années." }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "Quand ils l'ont écrit, j'étais déjà en route. Aide-moi à le décoder : des doubles, et des nombres fois 100." }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'comfort', text: "« …on pense à toi. Reviens quand tu pourras. » C'est ma famille, {nom}." }] },
            { art: 'cockpit-radio', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'comfort', text: "Ils t'attendent depuis longtemps. Il faut que tu rentres." },
                { who: 'rabbit', mood: 'content', text: "Oui. Merci pour toutes tes questions." }] }
        ],
        lines: [
            "Même de loin, les nombres se comprennent.",
            "Doubler, c'est dire deux fois : chez moi, on le fait pour être sûr.",
            "La lumière des étoiles aussi a voyagé longtemps avant d'arriver à tes yeux."
        ],
        end: { some: "Tu as aidé {hase} à décoder le message de chez elle." }
    },
    { id: 'embarquement', number: 11, unlockAt: 155, ambience: 'space', banner: 'porthole-earth', emoji: '🚪', title: 'Embarquement surprise',      mission: 'Vérifier le carburant',
        idea: "En orbite on flotte ; la Terre est ronde, entourée d'une fine couche d'air.",
        scene: [
            { art: 'airlock', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "C'est l'heure. Merci pour tout, {nom}. Sans toi, je serais encore dans la clairière." }] },
            { sfx: 'airlock-close', art: 'airlock-closed', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Euh… la porte vient de se fermer. Et je suis du mauvais côté !" }] },
            { sfx: 'launch', art: 'porthole-earth', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'surprise', text: "Le décollage est automatique ! Accroche-toi !" }] },
            { art: 'porthole-earth', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'moved', text: "Je… je flotte ! Et la Terre… elle est toute ronde." },
                { who: 'rabbit', mood: 'content', text: "Tu vois le fin trait bleu, au bord ? C'est tout l'air que vous respirez." }] },
            { art: 'fuel', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "C'est très beau. Mais comment je rentre, moi ?" },
                { who: 'rabbit', mood: 'comfort', text: "Respire. Je compte le carburant : ce qu'on a, moins ce qu'il faut pour ma route." }] },
            { art: 'fuel', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "S'il en reste assez, je te ramène. Mais d'abord, une escale : mon rapport doit partir par la balise relais." }] }
        ],
        lines: [
            "Il en reste assez. Je te le promets, {nom}.",
            "Calculer le retour, c'est la meilleure façon de se rassurer.",
            "Regarde par le hublot : on n'est jamais perdu quand on sait compter."
        ],
        end: { some: "Tu as aidé {hase} à vérifier le carburant." }
    },
    { id: 'voyage',      number: 12,  unlockAt: 185, ambience: 'space', banner: 'space-beacon-on', emoji: '☄️', title: 'Le voyage',                  mission: 'Naviguer entre les astéroïdes',
        idea: "Dans le vide, rien ne freine et aucun son ne voyage.",
        scene: [
            { art: 'space-beacon', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', text: "La balise relais est là-bas. J'ai coupé les moteurs : ici, rien ne nous freine, on continue tout droit." }] },
            { art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "Mais il y a ces rochers. Le chemin sûr fait des détours : il faut additionner chaque tronçon." }] },
            { sfx: 'asteroid-pass', art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'narrator', text: "Un énorme rocher frôle le hublot. Tu serres les pattes." }] },
            { art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'think', text: "Dehors, il n'a fait aucun bruit !" },
                { who: 'rabbit', text: "Dans l'espace, il n'y a pas d'air pour porter les sons. Tout est silencieux." }] },
            { art: 'space-asteroids', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Tu as encore peur ?" },
                { who: 'fox', mood: 'worried', text: "Oui. Mais je compte quand même." }] },
            { sfx: 'beacon-ping', art: 'space-beacon-on', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'bravo', text: "Rapport envoyé ! Regarde la petite étoile jaune, là-bas : c'est chez moi." }] },
            { art: 'space-home', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Maintenant, {nom}, on te ramène." }] }
        ],
        lines: [
            "Droit devant, puis à gauche : tu navigues comme un pro.",
            "Chaque tronçon compte. Additionne, et on passe.",
            "Ta peur est une bonne alliée : elle te rend prudent."
        ],
        end: { some: "Tu as aidé {hase} à guider le vaisseau jusqu'à la balise." }
    },
    { id: 'retour',      number: 13, unlockAt: 225, ambience: 'nature', sfx: 'applause', banner: 'hill', emoji: '🔦', title: 'Le retour',                  mission: 'Atterrir en douceur',
        idea: "À la rentrée, l'air freine le vaisseau et le fait chauffer, comme une étoile filante.",
        scene: [
            { art: 'earth-top', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'think', text: "On arrive trop vite pour se poser. Il faut ralentir : la moitié, puis encore la moitié." }] },
            { art: 'earth-top', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'worried', text: "Le hublot devient tout orange !" },
                { who: 'rabbit', mood: 'content', text: "C'est l'air qui nous freine. On frotte, alors on chauffe. Tu te souviens du caillou ?" }] },
            { art: 'earth-top', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'bravo', text: "On est une étoile filante !" },
                { who: 'rabbit', mood: 'bravo', text: "Une étoile filante qui sait freiner." }] },
            { sfx: 'landing', art: 'hill', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'fox', mood: 'comfort', text: "Tu vas me manquer." },
                { who: 'rabbit', mood: 'comfort', text: "Et toi à moi. Continue de poser des questions, {nom}." }] },
            { sfx: 'flashlight-click', art: 'hill', cast: [{ who: 'fox', at: 'left' }, { who: 'rabbit', at: 'right' }], lines: [
                { who: 'rabbit', mood: 'content', text: "Garde ma lampe. Un éclair pour dire bonne nuit, deux pour dire je pense à toi." }] },
            { art: 'hill-reply', cast: [{ who: 'fox', at: 'center' }], lines: [
                { who: 'fox', mood: 'moved', text: "Deux éclairs… Et là-haut, une petite lueur me répond." },
                { who: 'narrator', text: "Dans le carnet de la hase : « Prochaine mission : à suivre. »" }] }
        ],
        lines: [
            "Chaque soir, une lumière dans le ciel : c'est moi.",
            "Doubler, partager en deux : deux gestes pour atterrir en douceur.",
            "Tu sais, {nom}, tu es un excellent copilote."
        ],
        end: { some: "Te voilà de retour chez toi. Et {hase} rentre enfin chez elle." }
    }
];

// Chapitres débloqués avec cette avancée de l'histoire (paramètre nommé `stars` pour des raisons historiques)
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

// Nombre de sessions (ou missions) à terminer pour ouvrir ce chapitre
function sessionsUntil(chapter, points) {
    return Math.max(0, Math.ceil((chapter.unlockAt - points) / STORY.session));
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
