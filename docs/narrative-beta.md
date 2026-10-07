# MathPulse — Fil narratif (chapitres) pour la bêta

_Rédigé le 7 octobre 2026. Document d'orientation : il explique la direction prise pour que l'équipe technique sache à quoi s'attendre. **Aucun chapitre n'est encore écrit** et rien n'est à développer avant que le scénario soit verrouillé. Les calendriers restent ceux de [`plan-beta-rc.md`](plan-beta-rc.md)._

## 1. Pourquoi une histoire

Aujourd'hui la progression est abstraite : des étoiles qui font avancer une fusée vers trois planètes (`PLANETS` dans `js/content/skills.js`, affichées par `js/ui/universe.js`). L'idée est de remplacer ce décor par **une vraie histoire en chapitres** :

- chaque palier d'étoiles atteint **débloque le chapitre suivant** ;
- les maths deviennent des **quêtes pour aider un personnage**, pas des exercices isolés ;
- la motivation passe de « je dois progresser » à « je veux savoir la suite ».

C'est cohérent avec la ligne du projet (pédagogique **et** ludique) et avec le chantier « Identité visuelle » de la bêta (fusée et renard en SVG).

## 2. Idée de départ (provisoire)

Le 🦊 (l'enfant) rencontre dans les bois une 🐰 qui prétend être une lapine extraterrestre. Son vaisseau est en panne : elle veut bien le montrer à qui prouve qu'il est assez malin pour réussir son test de maths. Ensuite : réparation du vaisseau, calcul du meilleur moment de départ, 🦊 embarqué par accident, retour sur Terre, promesse de s'envoyer des signaux de lampe de poche à travers la galaxie.

Ce n'est qu'une première esquisse. Les grandes lignes (origine de la 🐰, ton, fin, enchaînement exact) restent à définir.

## 3. Cadrage décidé

| Sujet | Décision |
|---|---|
| Échéance | Contenu prêt pour la **bêta v0.9** (19 oct. – 6 nov. dans le plan actuel) |
| Longueur | **8 chapitres minimum, une dizaine en objectif** ; la durée de vie du jeu compte, pas besoin de tout livrer d'un coup |
| Visuels | SVG simples, plus les émojis 🦊 et 🐰 dans un premier temps |
| Mécanique | Palier d'étoiles atteint → chapitre débloqué |
| Lien avec les maths | Chaque chapitre est rattaché à une ou plusieurs compétences ; le détail est à écrire avec le scénario |

## 4. Impact technique prévu

Pas de refonte du moteur (`engine.js`, `session.js`, `progression.js` restent tels quels) : les étoiles (`totalStars`) et les compétences existent déjà. Ce qui changerait :

- **`js/content/`** : un nouveau fichier de données décrivant les chapitres (identifiant, titre, palier d'étoiles, texte, illustration), sur le modèle de `PLANETS` ; les paliers actuels (10, 25 et 50 ⭐) seraient redéfinis à partir de ce découpage ;
- **`js/ui/universe.js`** : afficher les chapitres débloqués ou verrouillés à la place des planètes ;
- **stockage** : retenir quels chapitres ont déjà été lus (comme `discovered` pour les compétences). Toute modification du format de données doit passer par la `version` déjà présente dans `progression.js` ;
- **styles** : vignettes ou panneaux d'histoire, à intégrer au thème clair/sombre existant.

Côté accessibilité, le texte de l'histoire doit rester lisible par un lecteur d'écran et respecter les animations réduites, comme le reste de l'interface.

## 5. Questions ouvertes (à trancher avant d'écrire les chapitres)

1. D'où vient la 🐰, pourquoi est-elle sur Terre, quel est son but ?
2. Sa personnalité : joyeuse, curieuse, stressée par la panne ?
3. Le 🦊 est-il l'enfant lui-même ou un personnage incarné (« tu » ou « il ») ?
4. Fin fermée, ou ouverte avec une suite possible ?
5. Nombre exact de chapitres, donc paliers d'étoiles intermédiaires (à relier au rythme visé, voir Q7 de [`revue-mvp.md`](revue-mvp.md)).
6. Chaque compétence résout-elle un vrai problème de l'histoire, ou sert-elle de prétexte ?
7. La 🐰 est-elle un compagnon visuel présent après chaque session ?
8. Palette : forêt, puis vaisseau, puis espace ?
9. Faut-il une courte scène d'histoire avant les 5 questions, et jusqu'à quelle durée ?
10. Retour de fin de session : « tu as aidé la 🐰 à… » plutôt qu'un simple « +2 ⭐ » ?

## 6. Suite

1. Verrouiller les questions ci-dessus (travail de scénario, pas de code).
2. Écrire un storyboard détaillé : un chapitre = titre, enjeu, compétence travaillée, palier, illustration.
3. Seulement ensuite : fichier de données des chapitres, adaptation de l'univers, illustrations SVG.
