# MathPulse — Storyboard narratif (chapitres 1 à 3)

_Rédigé le 11 octobre 2026. Complète [`narrative-beta.md`](narrative-beta.md) (décisions de fond). **Proposition à valider** : textes, seuils d'étoiles et découpage sont provisoires, rien n'est codé. Le code se fera sur la branche `feat/narrative-ux`._

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
| 2 | La 🐰 est assise près de la lueur, calme, un carnet à la patte. | « Bonsoir ! Je suis exploratrice. Je viens d'une planète autour d'une étoile que tu vois parfois dans le ciel. » |
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

**Illustrations à produire** : décor de bois au soir, lueur bleue, silhouette du vaisseau entre les arbres. Le 🦊 et la 🐰 en pied existent déjà (`assets/story/fox-full.svg`, `rabbit-full.svg`).

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

## Étapes suivantes proposées

1. **Valider** les chapitres 1 à 3 (textes, seuils, lien avec l'intro).
2. **Écrire les chapitres 4 à 10** dans ce même format, puis relire l'ensemble pour la cohérence de l'arc.
3. **Branche `feat/narrative-ux`**, en trois lots :
   - Lot 1, structure : fichier de données des chapitres, remplacement de `PLANETS`, écran des chapitres débloqués ou verrouillés dans `universe.js`, déblocage au passage d'un seuil (le résultat de session fournit déjà `newPlanets`), chapitres lus mémorisés (`version` de `progression.js`).
   - Lot 2, scènes : visionneuse de vignettes avec bouton « passer » et ligne de la 🐰 en début de session, accessible (lecteur d'écran, animations réduites), chapitres 1 à 3.
   - Lot 3, la suite : chapitres 4 à 10 et refonte de l'intro.
4. **Illustrations** en parallèle : décors (bois, clairière, intérieur du vaisseau), expression « inquiet » du 🦊, pièces et voyants. Émojis et SVG existants en attendant.
5. **Ajuster les seuils** avec les données de la bêta.
