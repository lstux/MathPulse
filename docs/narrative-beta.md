# MathPulse — Fil narratif (chapitres) pour la bêta

_Document d'orientation, mis à jour le 11 octobre 2026. Il dit à l'équipe technique ce qui est décidé pour l'histoire. Les calendriers restent ceux de [`plan-beta-rc.md`](plan-beta-rc.md), et le parcours des compétences est décrit dans [`parcours-etendu.md`](parcours-etendu.md)._

## 1. Pourquoi une histoire

Aujourd'hui la progression est abstraite : des étoiles font avancer une fusée vers trois planètes (`PLANETS` dans `js/content/skills.js`, affichées par `js/ui/universe.js`). L'histoire remplace ce décor par une suite de **chapitres** :

- chaque palier d'étoiles atteint **débloque le chapitre suivant** ;
- les maths deviennent des **missions** pour aider un personnage, pas des exercices isolés ;
- l'enfant joue pour **savoir la suite**, et la fin reste ouverte.

## 2. Le scénario

**Le 🦊 est l'enfant.** Il est tutoyé dans le texte.

**La 🐰 vient d'une planète qui tourne autour d'une étoile visible depuis la Terre, dans la même galaxie.** Elle est exploratrice scientifique. Sa mission : explorer le système solaire, vérifier que les mesures faites depuis sa planète étaient bonnes, et que la Terre était potentiellement habitable. Une micro-météorite a détruit un circuit de navigation, et elle a dû se poser en urgence sur Terre. La Terre n'était pas prévue au programme.

**Son ton** : elle est sereine, méthodique, un peu rassurante. C'est le 🦊 qui s'inquiète, ce qui donne un contraste utile.

**Les maths** : elles sont le vrai problème de l'histoire, pas un prétexte. Réparer le vaisseau et vérifier des mesures demandent des calculs. Quand un calcul est trop compliqué pour l'histoire, on simplifie le problème plutôt que de l'abandonner.

**La fin** est ouverte : une suite reste possible.

**La 🐰 est un compagnon visuel**, présent à la fin de chaque session.

## 3. Cadrage

| Sujet | Décision |
|---|---|
| Échéance | Contenu prêt pour la **bêta v0.9** (19 oct. – 6 nov. dans le plan actuel) |
| Longueur | **10 chapitres**, la durée de vie du jeu compte ; pas besoin de tout livrer d'un coup |
| Mécanique | Palier d'étoiles atteint → chapitre débloqué ; les seuils sont croissants et seront calculés à partir de l'économie réelle d'étoiles |
| Rythme des scènes | Une **scène complète** seulement au déblocage d'un chapitre, soit une fois toutes les quelques sessions. Les autres sessions ont une **ligne de texte** de la 🐰, qu'on peut passer |
| Visuels | SVG simples. Renard et lapine existent déjà en SVG (4 expressions chacun) |
| Palette | Forêt (vert mousse, brun) au début, puis vaisseau (gris métal, bleu nuit), puis espace (indigo, violet, touches d'or) |
| Intro | Le quick draft actuel (`assets/story/intro*.svg`, `js/ui/animations.js`) est provisoire ; il sera refait une fois les chapitres écrits |

## 4. Les 10 chapitres (ébauche)

Chaque chapitre est rattaché à une voie du parcours. Les titres et les seuils sont provisoires.

| # | Chapitre | Voie et compétences | Enjeu narratif |
|---|---|---|---|
| 1 | Rencontre | Additions (test d'entrée) | Le 🦊 trouve la 🐰 dans les bois |
| 2 | Le vaisseau | Premières réparations | Découverte de la panne |
| 3 | Les circuits | ×2, ×5, ×10 | Remettre les circuits en route |
| 4 | Les tables qui s'allument | ×3, ×4 | Réparer les moteurs |
| 5 | Partager et grouper | ÷2, ÷5, ÷10 | Répartir l'énergie entre les réservoirs |
| 6 | Les mesures | Compléments, dizaines | Vérifier les relevés de la 🐰 |
| 7 | Le décollage | Tables ×6 à ×9, ÷3 à ÷9 | Calculer le meilleur moment de départ |
| 8 | L'embarquement | Soustractions à deux chiffres | Le 🦊 monte à bord par accident |
| 9 | Le voyage | Tables mélangées, additions étendues | Un vrai problème de navigation dans l'espace |
| 10 | Le retour | Doubles, moitiés, ×100 | Adieux et signaux de lampe de poche |

## 5. Ce qui reste ouvert

- Affiner les titres, les seuils d'étoiles et le contenu de chaque chapitre (storyboard).
- Les textes de la 🐰, à écrire avec le storyboard.
- La palette exacte, à valider sur les SVG.

## 6. Impact technique prévu

Pas de refonte du moteur (`engine.js`, `session.js`, `progression.js` restent tels quels) : les étoiles (`totalStars`) et les compétences existent déjà. Ce qui changerait :

- **`js/content/`** : un nouveau fichier de données décrivant les chapitres (identifiant, titre, palier d'étoiles, texte, illustration), sur le modèle de `PLANETS`. Les paliers actuels (10, 25 et 50 ⭐) seraient remplacés par ceux du découpage ci-dessus.
- **`js/ui/universe.js`** : afficher les chapitres débloqués ou verrouillés à la place des planètes.
- **Stockage** : retenir quels chapitres ont été lus, comme `discovered` pour les compétences. Toute modification du format passe par la `version` de `progression.js`.
- **Scènes** : une scène complète au déblocage, une ligne de texte sinon. Les deux doivent pouvoir être passées, et respecter les animations réduites et les lecteurs d'écran.

## 7. Suite

1. Écrire le storyboard : pour chaque chapitre, titre, enjeu, compétence, seuil, illustration.
2. Refaire l'intro une fois le storyboard prêt.
3. Ensuite seulement : fichier de données des chapitres, adaptation de l'univers, illustrations SVG.
