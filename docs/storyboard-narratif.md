# MathPulse — Storyboard narratif (chapitres 1 à 10)

_Rédigé le 11 octobre 2026. Complète [`narrative-beta.md`](narrative-beta.md) (décisions de fond). Chapitres 1 à 3 validés, chapitres 4 à 10 **proposés à valider** : textes, seuils d'étoiles et découpage sont provisoires, rien n'est codé. Le code se fera sur la branche `feat/narrative-ux`._

## Règles d'écriture (valables pour tous les chapitres)

- L'enfant est le 🦊 et il est tutoyé. La 🐰 est **sereine** et méthodique ; le 🦊 est **plus inquiet qu'elle**.
- Textes courts, lisibles seul par un enfant de CE2 : 2 phrases maximum par vignette, une vingtaine de mots.
- Une **scène complète** (4 à 5 vignettes) au déblocage du chapitre. Les autres sessions du chapitre n'ont qu'**une ligne** de la 🐰, passable.
- La mission du chapitre est **thématique** : les exercices restent choisis par la rotation habituelle (maîtrise, rappels, erreurs à revoir). Aucun texte ne doit promettre une compétence que l'enfant n'a pas encore débloquée.
- Quand un calcul devient trop compliqué pour l'histoire, on simplifie le problème (on garde de petits nombres) plutôt que de forcer le lien.

## Seuils d'étoiles : proposition

Dans le code actuel, une session rapporte 0 à 3 ⭐ (3 pour 5/5, 2 pour 4/5, 1 pour 3/5) ; une série rapide ajoute jusqu'à 2 ⭐, 2 séries par jour au plus. Avec environ 2,5 ⭐ par session et une série rapide par jour une fois quelques compétences au niveau 2, un enfant régulier gagne de l'ordre de 4 ⭐ par jour.

| Chapitre | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Seuil (⭐) | 0 | 6 | 15 | 28 | 45 | 65 | 90 | 120 | 155 | 195 |

Ce rythme donne 4 à 5 chapitres pendant les 2 semaines de bêta, puis un chapitre toutes les une à deux semaines. Les écarts grandissent pour que l'histoire dure. **Valeurs à ajuster avec les données de la bêta.**

---

## Chapitre 1 — « Une drôle de lapine »

**Seuil** : 0 ⭐, scène jouée juste après l'intro, avant la première session.
**Décor** : bois au soir (verts, bruns, lueur bleue entre les arbres).
**Mission** : la première session est « le test de la 🐰 ».

| # | Vignette | Texte |
|---|---|---|
| 1 | Le 🦊 avance prudemment entre les arbres vers une lueur bleue. | « Une lueur entre les arbres… Tu t'approches, le cœur un peu rapide. » |
| 2 | La 🐰 est assise près de sa petite lampe bleue (la lueur), calme, un carnet à la patte. | « Bonsoir ! Je suis exploratrice. Je viens d'une planète autour d'une étoile que tu vois parfois dans le ciel. » |
| 3 | Le 🦊 recule d'un pas, inquiet. La 🐰 sourit. | « Tu es tombée du ciel ?! » — « Posée en urgence. Une micro-météorite a abîmé mon circuit de navigation. Rien de grave ! » |
| 4 | La 🐰 montre du doigt un coin d'arbres, d'où dépasse une forme métallique. | « Mon vaisseau est juste derrière. Mais on ne montre pas ses instruments au premier venu : un petit test d'abord. » |
| 5 | Gros plan sur la 🐰, bouton « C'est parti ». | « Cinq calculs. Prêt ? » |

**Fin de session** (selon les étoiles) :
- 3 ⭐ : « Parfait ! La 🐰 est impressionnée. »
- 1 ou 2 ⭐ : « Bien joué ! La 🐰 te fait confiance. »
- 0 ⭐ : « Pas grave, la 🐰 te laisse retenter. »

**Lignes pour les sessions suivantes** (une au hasard) :
- « On avance doucement, c'est la bonne méthode. »
- « Mon vaisseau t'attend. Encore un petit effort ! »
- « Tu comptes vite. Les scientifiques adorent ça. »

**Illustrations à produire** : décor de bois au soir, lampe bleue de la 🐰 (reprise au chapitre 10), silhouette du vaisseau entre les arbres. Le 🦊 et la 🐰 en pied existent déjà (`assets/story/fox-full.svg`, `rabbit-full.svg`).

**Lien avec l'intro actuelle** : l'intro (quick draft) montre déjà l'atterrissage et l'arrivée de la 🐰. Proposition : la garder comme courte ouverture muette (atterrissage seul), et laisser le dialogue au chapitre 1. À refaire une fois le storyboard validé.

---

## Chapitre 2 — « Le vaisseau en piteux état »

**Seuil** : 6 ⭐ (environ 2 à 3 sessions).
**Décor** : clairière, vaisseau cabossé sous les branches, un peu de fumée.
**Mission thématique** : **enlever** (retirer les débris, dégager les circuits). Elle correspond aux soustractions, qui se débloquent quand les additions sont en bonne voie. Si elles ne le sont pas encore, rien ne casse : le thème reste valable.

| # | Vignette | Texte |
|---|---|---|
| 1 | La clairière, le vaisseau penché, une aile tordue. | « Voilà mon vaisseau. » |
| 2 | Le 🦊, inquiet, fait le tour de l'épave. | « Il est… dans un piteux état. » — « Il a connu pire. Il est réparable ! » |
| 3 | La 🐰 pointe le circuit de navigation, noirci. | « Avant de réparer, il faut dégager. Sur ce panneau, il y a 18 morceaux, et 9 sont cassés. Combien restent bons ? » |
| 4 | Le 🦊 compte sur ses doigts, la 🐰 attend, souriante. | « Neuf ! » — « Exactement. Tu retires ce qui est cassé, et il reste ce qui marche. » |
| 5 | La 🐰 tend un chiffon au 🦊. | « Allons-y. Un morceau après l'autre. » |

**Fin de session** : « Tu as aidé la 🐰 à dégager le vaisseau. » (variante 3 ⭐ : « Le panneau est presque propre ! »)

**Lignes** :
- « Enlever, c'est aussi une façon de compter. »
- « Moins il y a de débris, plus il y a de place pour réparer. »
- « Ne t'inquiète pas, renard, on avance bien. »

**Illustrations à produire** : décor clairière avec vaisseau cabossé, quelques débris et pièces en icônes réutilisables, légère fumée, **expression « inquiet » pour le 🦊** (les 4 expressions actuelles sont content, bravo, réfléchit, compatissante).

---

## Chapitre 3 — « Les circuits »

**Seuil** : 15 ⭐ (environ 6 sessions).
**Décor** : intérieur du vaisseau (gris métal, bleu nuit, voyants jaunes). Première bascule de palette, de la forêt vers le vaisseau.
**Mission thématique** : **doubler et grouper** (circuits doublés, piles par 5, paquets de 10). Elle correspond à ×2, ×5 et ×10. ×2 et ×5 sont disponibles dès le départ, ×10 se débloque après ×2 niveau 2.

| # | Vignette | Texte |
|---|---|---|
| 1 | Le 🦊 entre dans le vaisseau, les yeux ronds. | « C'est… plus grand que je pensais. » |
| 2 | Un panneau de voyants, la plupart éteints. | « Le circuit principal est mort. Mais les circuits de secours peuvent le remplacer, si on les double. » |
| 3 | La 🐰 pose des piles sur la table, par groupes de 5. | « Chaque module demande 2 piles. Il y a 7 modules : combien de piles ? » |
| 4 | Le 🦊 hésite. La 🐰 reste calme. | « Et si je me trompe ? » — « On vérifie deux fois. C'est ça, être scientifique. » |
| 5 | Un voyant s'allume. | « Quatorze ! Regarde, le premier voyant brille. » |

**Fin de session** : « Un voyant de plus brille grâce à toi ! » (la progression du chapitre pourrait se voir en voyants allumés, à étudier au moment du code)

**Lignes** :
- « Deux par module, cinq par paquet : tout s'allume peu à peu. »
- « Tu vois ? Dès qu'on groupe, c'est plus simple. »
- « Respire, renard. Tu fais ça très bien. »

**Illustrations à produire** : intérieur du vaisseau, panneau de voyants (états éteint, allumé), piles et modules en icônes.

---

## Chapitre 4 — « La salle des machines »

**Seuil** : 28 ⭐.
**Décor** : salle des machines (cuivre, bleu nuit, un peu de vapeur).
**Mission thématique** : **compter par groupes** (trois rangées de quatre pistons). Correspond à ×3 et ×4.

| # | Vignette | Texte |
|---|---|---|
| 1 | Le 🦊 et la 🐰 descendent une échelle vers une salle silencieuse. | « Voici le cœur du vaisseau : les moteurs. » |
| 2 | Trois rangées de pistons, quatre par rangée. | « Pour les relancer, je dois savoir combien il y en a en tout. » |
| 3 | Le 🦊 compte du doigt, la 🐰 souffle les nombres. | « Quatre, huit, douze… » — « Douze ! » — « Voilà. » |
| 4 | Le 🦊 regarde les pistons, les oreilles basses. | « Et si le moteur s'emballe ? » — « Alors on le calme. Un moteur se règle par petits pas. » |
| 5 | Un piston tourne doucement, voyant vert. La 🐰 regarde le tableau de bord, pensive. | « Les moteurs tournent. Mais sans circuit de navigation, impossible de savoir où aller. Il me faudra mes mesures. » |

**Fin de session** : « Un moteur de plus tourne grâce à toi ! »

**Lignes** :
- « Trois par rangée, quatre par rangée : tu verras, ça roule. »
- « Écoute : les moteurs commencent à ronronner. »
- « Compter par groupes, c'est compter malin. »

**Illustrations à produire** : salle des machines, pistons et rotors en icônes (arrêté, en marche), vapeur légère.

---

## Chapitre 5 — « Partager l'énergie »

**Seuil** : 45 ⭐.
**Décor** : soute aux réservoirs (bleu nuit, cellules d'énergie vert doux).
**Mission thématique** : **partager et grouper**. Correspond à ÷2, ÷5 et ÷10.

| # | Vignette | Texte |
|---|---|---|
| 1 | Trois réservoirs vides, une caisse de cellules lumineuses. | « Pour démarrer, il faut répartir l'énergie. » |
| 2 | La 🐰 distribue les cellules. | « Douze cellules, trois réservoirs, autant dans chacun. Combien ? » — « Quatre ! » |
| 3 | La 🐰, un peu rêveuse, regarde une cellule briller. | « Chez moi aussi on partage tout. Le soir, tout le village partage la lumière de la veillée. » |
| 4 | La 🐰 aligne des paquets de cellules. | « Et si je fais des paquets de 5 avec 15 cellules ? » — « Trois paquets ! » |
| 5 | Les trois réservoirs brillent d'une lueur douce. | « Ils sont pleins. Ton partage était juste. » |

**Fin de session** : « Tu as aidé la 🐰 à répartir l'énergie. »

**Lignes** :
- « Partager, c'est un peu l'inverse de multiplier. »
- « Combien de paquets ? Pense à ta table, elle t'aide. »
- « Chez moi, on dit : un partage juste fait des amis. »

**Illustrations à produire** : réservoirs (vide, plein), cellules d'énergie, caisse.

---

## Chapitre 6 — « Le carnet de mesures »

**Seuil** : 65 ⭐.
**Décor** : poste de pilotage (bleu nuit, voyants jaunes, grande vitre sur la forêt).
**Mission thématique** : **compléter**. Correspond aux compléments à 10 et à 100, aux dizaines.

| # | Vignette | Texte |
|---|---|---|
| 1 | La 🐰 ouvre son carnet. | « Voilà ma vraie mission : vérifier que la Terre est comme on l'avait mesurée de loin. » |
| 2 | Une page de relevés (température, eau, air) avec des trous. | « Il manque des chiffres. Pour arriver à 100, il manque combien à 64 ? » — « 36 ! » |
| 3 | Le 🦊 hésite, le stylo en l'air. | « Et si les mesures étaient fausses ? » — « Alors je le noterai aussi. Un résultat surprenant, c'est de la science. » |
| 4 | Page après page, le carnet se remplit. | « Les mesures de loin étaient justes. La Terre accueille bien les voyageurs. » |
| 5 | La 🐰 referme le carnet, le voyant principal clignote. | « Il me reste à réparer la navigation pour le rapporter chez moi. » |

**Fin de session** : « Tu as aidé la 🐰 à compléter son carnet. »

**Lignes** :
- « Il manque combien ? C'est la question préférée des explorateurs. »
- « Une mesure juste vaut mieux qu'une mesure rapide. »
- « Encore une page, et le carnet sera complet. »

**Illustrations à produire** : poste de pilotage avec vitre, carnet ouvert (page à trous, page remplie), icônes thermomètre, goutte, vent.

---

## Chapitre 7 — « La fenêtre de départ »

**Seuil** : 90 ⭐.
**Décor** : poste de pilotage, nuit étoilée à travers la vitre.
**Mission thématique** : **calculer le bon moment**. Correspond aux tables ×6 à ×9 et aux divisions ÷3 à ÷9.

| # | Vignette | Texte |
|---|---|---|
| 1 | La nuit étoilée dans la vitre. | « Pour quitter la Terre, il faut viser une fenêtre de départ : un moment précis. » |
| 2 | La 🐰 trace des arcs sur une carte du ciel. | « Mon étoile et la Terre s'alignent toutes les 7 heures. Dans 6 alignements, combien d'heures ? » — « 42 ! » |
| 3 | Le 🦊 serre les pattes. | « Et si on rate la fenêtre ? » — « Il y en aura une autre. Mais celle-ci est la meilleure : on ne gaspille pas d'énergie. » |
| 4 | La 🐰 découpe le compte à rebours. | « 56 minutes en 8 étapes égales : 56 ÷ 8 ? » — « 7 minutes ! » |
| 5 | Tous les voyants brillent. Le 🦊 sourit, un peu ému. | « Navigation réparée. Alors… c'est l'heure des adieux. » |

**Fin de session** : « La fenêtre de départ est calculée grâce à toi ! »

**Lignes** :
- « Une bonne table, c'est une bonne carte. »
- « Plus qu'un petit calcul, et on peut décoller. »
- « Tu as vu ? Tous les voyants se rallument. »

**Illustrations à produire** : carte du ciel avec arcs et horloge d'alignement, tous les voyants allumés (aboutissement du chapitre 3).

---

## Chapitre 8 — « Embarquement surprise »

**Seuil** : 120 ⭐.
**Décor** : sas, puis hublot sur l'espace (indigo, violet, étoiles). Deuxième bascule de palette.
**Mission thématique** : **soustraire pour vérifier**. Correspond aux soustractions à deux chiffres.

| # | Vignette | Texte |
|---|---|---|
| 1 | Adieux devant le sas. | « Merci pour tout, renard. Sans toi, je serais encore là. » |
| 2 | Le 🦊 recule, sa patte accroche un levier, le sas se ferme. | « Euh… la porte ? » |
| 3 | Le vaisseau décolle, la Terre rapetisse dans le hublot. La 🐰 lève les sourcils pour la première fois. | « Je n'avais pas prévu ça. » — « Comment je rentre ?! » |
| 4 | La 🐰 retrouve son calme et montre la jauge de carburant. | « Respire. S'il reste assez pour revenir, je te ramène. 83 moins 27 ? » — « 56 ! » |
| 5 | La jauge montre la réserve, la 🐰 sourit. | « Assez pour le retour. Mais d'abord une escale : mon rapport doit partir par la balise relais. » |

**Fin de session** : « Tu as aidé la 🐰 à vérifier le carburant. »

**Lignes** :
- « Il en reste assez. Je te le promets, renard. »
- « Calculer le retour, c'est la meilleure façon de se rassurer. »
- « Regarde par le hublot : on n'est jamais perdu quand on sait compter. »

**Illustrations à produire** : sas et porte qui se ferme, hublot avec la Terre qui s'éloigne, jauge de carburant, **expression « surprise » de la 🐰** (une seule fois dans l'histoire).

---

## Chapitre 9 — « Le voyage »

**Seuil** : 155 ⭐.
**Décor** : espace profond (indigo, violet, touches d'or), astéroïdes, balise relais.
**Mission thématique** : **naviguer en additionnant**. Correspond aux tables mélangées et aux additions étendues. C'est le « vrai problème » le plus ambitieux : un trajet fait de plusieurs tronçons.

| # | Vignette | Texte |
|---|---|---|
| 1 | Le vaisseau glisse entre des astéroïdes dorés. | « La balise relais est là-bas. Un chemin sûr passe entre ces rochers. » |
| 2 | La 🐰 note les distances de deux tronçons. | « Chaque tronçon ajoute sa distance : 38 plus 45 ? » — « 83 ! » |
| 3 | Un astéroïde frôle le hublot. Le 🦊 serre les pattes mais continue. | « 6 fois 7 ? Quarante-deux ! » — « Tu n'as plus peur ? » — « Si. Mais je calcule quand même. » |
| 4 | La balise s'allume, le rapport s'envole. | « Mission accomplie. Regarde, la petite étoile jaune, là-bas : c'est chez moi. » |
| 5 | Le vaisseau vire vers une petite lumière bleue. | « Maintenant, on te ramène. » |

**Fin de session** : « Tu as aidé la 🐰 à guider le vaisseau jusqu'à la balise. »

**Lignes** :
- « Droit devant, puis à gauche : tu navigues comme un pro. »
- « Chaque tronçon compte. Additionne, et on passe. »
- « Ta peur est une bonne alliée : elle te rend prudent. »

**Illustrations à produire** : espace profond avec astéroïdes, balise relais (éteinte, allumée), carte de route, étoile jaune lointaine.

---

## Chapitre 10 — « Le retour »

**Seuil** : 195 ⭐.
**Décor** : la Terre vue de haut, puis une colline la nuit (le vert et le brun du début reviennent, sous les étoiles).
**Mission thématique** : **atterrir en douceur**. Correspond aux doubles, aux moitiés et à ×100.

| # | Vignette | Texte |
|---|---|---|
| 1 | La Terre grossit dans le hublot. | « Pour se poser doucement, on divise la vitesse par deux. La moitié de 80 ? » — « 40 ! » |
| 2 | La 🐰 règle les freins. | « Et le double de 35 ? » — « 70 ! » — « Pour les freins, 7 fois 100 ? » — « 700 ! » |
| 3 | Le vaisseau se pose sur la colline, devant la porte. | « Tu vas me manquer. » — « Et toi à moi. » |
| 4 | La 🐰 tend une petite lampe de poche, comme la sienne dans les bois. | « Un éclair pour dire bonne nuit, deux pour dire je pense à toi. Chaque soir, regarde le ciel. » |
| 5 | Le vaisseau s'éloigne. Le 🦊, seul sur la colline, allume sa lampe. Une petite lueur lui répond au loin. | Deux éclairs. Puis le carnet de la 🐰 : « Prochaine mission : à suivre. » |

**Fin de session** : « Tu as aidé la 🐰 à rentrer… et à te ramener. »

**Lignes** :
- « Chaque soir, une lumière dans le ciel : c'est moi. »
- « Doubler, partager en deux : deux gestes pour atterrir en douceur. »
- « Tu sais, renard, tu es un excellent copilote. »

**Illustrations à produire** : Terre vue de haut, colline de nuit, faisceau de lampe de poche, lueur qui répond, expression « ému » du 🦊.

---

## Relecture de l'arc

- **Le 🦊** : inquiet (chapitres 1 à 3), s'implique (4 à 6), panique à l'embarquement (8), « je calcule quand même » (9), serein au retour (10). C'est la progression de l'enfant : la peur de se tromper devient de la confiance.
- **La 🐰** : sereine partout, avec **une seule fissure** au chapitre 8 (« Je n'avais pas prévu ça »). Cela la rend attachante sans casser son rôle rassurant.
- **Motifs qui se répondent** : la lampe bleue du chapitre 1 revient au chapitre 10 ; les voyants du chapitre 3 sont tous allumés au chapitre 7 ; le carnet du chapitre 6 se clôt sur « à suivre ». À ajuster en conséquence au chapitre 1 (la lueur est la lampe de la 🐰).
- **Palette** : forêt (1 et 2), vaisseau (3 à 7), espace (8 et 9), retour sur la colline (10).
- **Fin ouverte** : après le chapitre 10, les sessions continuent. Idée à trancher plus tard : un court signal de la 🐰 à chaque nouveau palier d'étoiles, et des chapitres supplémentaires (division avec reste, grands nombres) comme « saison 2 ».
- **Point de vigilance** : les chapitres sont débloqués par les **étoiles**, pas par la maîtrise. Un enfant peut donc atteindre le chapitre 7 sans avoir encore débloqué toutes les tables de ×6 à ×9. Les textes évitent de promettre une compétence précise, donc rien ne casse. À reconsidérer au moment du code : seuil d'étoiles seul (simple), ou double condition étoiles et compétence.

---

## Étapes suivantes

1. ✅ Chapitres 1 à 3 validés (11 oct.).
2. **Valider les chapitres 4 à 10** ci-dessus et l'arc d'ensemble.
3. **Branche `feat/narrative-ux`**, en trois lots :
   - Lot 1, structure (✅ fait sur `feat/narrative-ux`, à relire) : fichier de données des chapitres (`js/content/chapters.js`), remplacement de `PLANETS`, écran des chapitres débloqués ou verrouillés dans `universe.js`, déblocage au passage d'un seuil (le résultat de session fournit `newChapters`). Reporté au lot 2 : mémoriser les chapitres lus (`version` de `progression.js`), car il n'y a rien à lire avant les scènes.
   - Lot 2, scènes (✅ fait sur `feat/narrative-ux`, à relire) : visionneuse de vignettes avec bouton « Passer » (`js/ui/scene.js`), accessible (texte lu par les lecteurs d'écran, animations réduites), chapitres 1 à 3. Une scène non lue passe avant la session suivante ; le résultat de session propose « Lire le chapitre N » ; « Revoir » dans la liste des chapitres rejoue la scène. Chapitres lus mémorisés (`chaptersSeen` dans la progression, sans changement de version : champ ajouté avec valeur par défaut). Décors SVG dans `assets/story/scene/` (bois, clairière, intérieur du vaisseau éteint et avec un voyant allumé) et expression « inquiet » du 🦊.
     - **Écart avec le storyboard** : la ligne de la 🐰 s'affiche sur l'écran de l'univers, au-dessus de « C'est parti ! », et non pendant la session. Ainsi elle ne retarde aucune réponse (le temps de réflexion compte pour la maîtrise). Le message de fin de session du chapitre s'affiche sur l'écran de résultat, d'après le chapitre en cours avant la session.
   - Lot 3a ✅ : scènes, lignes et fins des chapitres 4 à 7, avec leurs 8 décors (salle des machines, soute, poste de pilotage).
   - Lot 3b, la suite : chapitres 8 à 10 (sas, espace) et refonte de l'intro.
4. **Illustrations** en parallèle : décors (bois, clairière, intérieur du vaisseau), expression « inquiet » du 🦊, pièces et voyants. Émojis et SVG existants en attendant.
5. **Ajuster les seuils** avec les données de la bêta.
