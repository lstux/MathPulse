# MathPulse v2 — Phase 1 : inventaire et architecture du moteur pédagogique

_16 novembre 2026. Base : tag `v1.0.0` et synthèse « Vision et orientations de conception » (16/11). Document de travail : les points marqués **[À trancher]** attendent une décision._

## 1. Ce que dit la vision, en une phrase par exigence

| # | Exigence (réf. synthèse) | Conséquence technique |
|---|---|---|
| E1 | Découvrir avant d'expliquer (§4.1) | Une mission est une **séquence d'étapes** typées (scène → problème → expérience → indice → défi → explication) |
| E2 | L'erreur est un outil (§4.2) | Chaque erreur est **diagnostiquée** (type d'erreur) et déclenche un retour adapté |
| E3 | Plusieurs stratégies (§4.3) | Une opération a plusieurs **stratégies** ; l'enfant en choisit une, le jeu en compare et en propose d'autres |
| E4 | Valider par le réemploi (§4.4, 4.5) | La maîtrise a **3 états** (vu / compris / durable), alimentés par des preuves de formes et de contextes différents, et des rappels espacés |
| E5 | Progression narrative ≠ progression pédagogique (§5.2) | L'histoire avance **indépendamment** de la maîtrise ; le moteur ramène les notions fragiles |
| E6 | Sauvegarde locale, export versionné (§12) | Format de données **v2** + migration depuis v1 |
| E7 | Smartphone d'abord, tactile (§2) | Manipulations **au toucher** (l'objet va seul à sa place quand il n'y en a qu'une), glisser-déposer possible, grandes cibles |

## 2. Inventaire de l'existant (v1.0.0, ~3 600 lignes, aucune dépendance)

### 2.1 À conserver tel quel
- **PWA** : `sw.js`, `manifest.json`, CI + déploiement Pages, tests sans dépendance (`tests/run.js`), smoke Playwright.
- **`storage.js`** : abstraction localStorage, export/import validé (à étendre, pas à réécrire).
- **Scènes d'histoire** : `scene.js` + `chapters.js` (13 chapitres, vignettes, personnages, ambiances), `sound.js` et toute la banque de sons. C'est déjà le moteur de « courte scène narrative » dont E1 a besoin.
- **Animations visuelles** : `animations.js` (blocs, retrait, groupes, tableau de points, dizaines) ; elles deviennent des **composants d'explication**.
- **Espace parent** (graphiques, historique, export/import), thème clair/sombre, animations réduites.

### 2.2 À adapter
| Élément | Aujourd'hui | Évolution |
|---|---|---|
| `skills.js` (34 compétences) | Une compétence = une opération + un plan de 5 types de questions | Devient la couche **« entraînement / consolidation »** ; chaque compétence gagne des `strategies` et un lien vers ses missions |
| `engine.js` | Génère des exercices (a op b), choisit la compétence (maîtrise la plus basse) | Garde la génération ; la **sélection** passe au planificateur de révision (§4.4) |
| `progression.js` | Statistiques par compétence sur 20 réponses, niveaux 1–3 (précision + temps de réflexion) | Ajoute les **états de maîtrise** et les preuves (§4.3) ; les niveaux 1–3 actuels restent comme indicateur de fluence |
| `discovery.js` | Un écran de découverte unique par compétence, sans interaction | Remplacé par les **étapes de mission** pour les compétences migrées ; reste le repli pour les autres |
| `session.js` | Session de 5 questions | Reste valable pour les séries d'entraînement ; une **MissionRun** s'ajoute à côté |

### 2.3 Couplages à défaire (ils contredisent la vision)
1. **L'histoire dépend des performances.** Les chapitres se débloquent par `totalStars`, et les étoiles viennent des sessions. Un enfant qui échoue reste donc bloqué dans l'histoire, ce que E5 interdit. → Les chapitres avancent par **missions jouées** (pas par score) ; les étoiles deviennent un simple retour de satisfaction.
   _Réalisé (17 nov.) : l'avancée de l'histoire (`progression.data.story`) est distincte des étoiles. Une session ou une mission **terminée** vaut +3, une série rapide ou libre +1 (dans la limite quotidienne déjà en place), quel que soit le score ; une session abandonnée ne compte pas. Les seuils des chapitres (`unlockAt`) sont inchangés : le rythme est celui d'un enfant qui gagnait 3 étoiles par session. À la migration, l'avancée reprend le total d'étoiles (personne ne recule). L'écran Univers annonce « Encore N missions pour le chapitre X »._
2. **Une réussite = une compétence validée.** La maîtrise ne dépend que de la précision et du temps sur un même type d'exercice. → E4 : preuves variées et réemploi en mission.
3. **Les erreurs ne sont pas typées.** `errors` mémorise l'opération ratée (`+:8:7`), pas *pourquoi* elle a été ratée. → catalogue d'erreurs (§4.2).
4. **Un seul parcours linéaire de déblocage** (`requires: {skill, level}`). → graphe de compétences par **prérequis de compréhension**, sans bloquer le récit.

### 2.4 Hors périmètre v2 initial
Voix et synthèse vocale, comptes et synchronisation, laboratoire indépendant, profils multiples, paramétrage parental (cf. synthèse §6, 9, 10, 11, 12).

## 3. Architecture cible

```
js/
  core/        (existant) storage · progression · engine · session
  mission/     NOUVEAU
    runner.js        exécute une mission : enchaîne les étapes, collecte les preuves
    steps/           un module par type d'étape : scene · problem · explore · hint · challenge · explain · transfer
    diagnosis.js     reconnaît le type d'erreur à partir de la réponse et de l'exercice
    feedback.js      choisit le retour (indice, question, visuel, nouvelle expérience, explication)
  learning/    NOUVEAU
    mastery.js       états vu / compris / durable, preuves, règles de transition
    scheduler.js     rappels espacés + choix des notions fragiles à réinjecter
  manipulatives/ NOUVEAU (composants tactiles réutilisables)
    objects.js · ten-frame.js (boîte de 10) · number-line.js · groups.js
  content/
    skills.js (existant) · chapters.js (existant)
    missions/        NOUVEAU : une mission = un fichier de données (JSON ou module JS déclaratif)
    errors/          NOUVEAU : catalogue d'erreurs par compétence
```

Principe : **le contenu est de la donnée, le comportement est du code partagé**. Ajouter une mission ne doit pas demander d'écrire un nouvel écran.

### 3.1 Étapes de mission (E1)
| Type | Rôle | Interaction |
|---|---|---|
| `scene` | Courte scène narrative (réutilise `scene.js`) | Suite / Passer |
| `problem` | Pose la situation et la question | Réponse libre ou manipulation |
| `explore` | Expérimentation libre avec un objectif simple | Manipulation (composant) ; fin quand `goal` est atteint |
| `hint` | Andrea propose une piste ou une question | Déclenchée après N secondes d'inactivité **ou** à la demande |
| `challenge` | Défi mobilisant ce qui vient d'être découvert | Exercice |
| `explain` | Explication visuelle courte + dialogue Gab/Andrea | Animation passive ; toujours rejouable (§7) |
| `transfer` | Réutilisation dans une situation **différente** | Exercice ou mini-problème : c'est lui qui produit la preuve de réemploi |

### 3.2 Format d'une mission (aperçu, mission 8 + 7)
```jsonc
{
  "id": "m-pass-ten-8-7",
  "version": 1,
  "skill": "addition-simple",
  "strategy": "pass-through-ten",
  "chapter": "lapine",               // rattachement narratif, pas un verrou
  "steps": [
    { "type": "scene",   "scene": "m-pass-ten/intro" },
    { "type": "problem", "prompt": "Gab doit réunir 8 objets et 7 autres.", "operands": [8, 7] },
    { "type": "explore", "tool": "ten-frame", "start": { "left": 8, "right": 7 },
      "goal": { "frameFull": 10 }, "free": true },
    { "type": "hint",    "after": { "idleMs": 12000 }, "from": "andrea",
      "ladder": ["question", "highlight-gap", "show-move"] },
    { "type": "explain", "animation": "decompose", "args": [8, 2, 5],
      "dialogue": "m-pass-ten/explain" },
    { "type": "transfer", "variants": [[9, 6], [7, 5], [8, 9]], "context": "ship-parts" }
  ],
  "evidence": { "understood": ["explore.goal", "challenge.correct"], "reused": ["transfer.correct"] }
}
```

### 3.3 Diagnostic et retour (E2)
Catalogue par compétence : chaque entrée associe un **motif d'erreur** à un **retour**.
```jsonc
{ "skill": "addition-simple", "errors": [
  { "id": "count-off-by-one", "match": "answer == total ± 1",        "feedback": ["question:count-again", "visual:groups"] },
  { "id": "tens-units-mixup", "match": "answer == (a + b) % 10  (retenue oubliée ou dizaine perdue)", "feedback": ["visual:ten-frame"] },
  { "id": "operation-swap",   "match": "answer == |a - b|",           "feedback": ["question:which-operation"] }
]}
```
_Réalisé (phase 2b, 17 nov.) : `js/content/errors.js` (les motifs sont des fonctions JS `match(a, b, réponse, total)`, pas des chaînes) et `js/mission/diagnosis.js`. Additions : chiffres collés (47 + 8 = 415), dizaine oubliée (45), unités seules (5), soustraction à la place (39), écart de 1, écart de 10. Soustractions : chiffres inversés (52 − 7 = 55), dizaine oubliée, addition à la place, écart de 1, écart de 10. Multiplications (17 nov.) : zéros mal comptés (×10, ×100), addition à la place, chiffres inversés (6 × 7 = 24), un paquet de trop ou de moins, table d'à côté, autre résultat de la même table, écart de 1. Divisions : zéros mal comptés, multiplication à la place, une seule soustraction (42 ÷ 7 = 35), taille du paquet donnée à la place du nombre de paquets, un paquet de trop ou de moins. Au 2e essai : des paquets à compter pour les petites tables, sinon un conseil de méthode (`ERROR_TIPS`, « Compte de 7 en 7, 6 fois. »). Un test parcourt tous les calculs et vérifie qu'aucune piste ne contient le résultat. **Sessions d'entraînement (17 nov.)** : première erreur → piste de la hase (au-dessus du pavé) et deuxième essai ; deuxième erreur → réponse et explication comme en v1. Seule la première réponse compte (maîtrise, étoiles, calculs à revoir, rappels) ; les types d'erreurs sont comptés par compétence. Pour « a + ? = c » et les questions formulées autrement (double de…), piste générale. Série rapide inchangée. Les types d'erreurs rencontrés sont comptés par compétence (`errorTypes`)._

Le retour est **gradué** (indice → question → visuel → nouvelle expérience → explication explicite) : on monte d'un cran à chaque nouvelle erreur sur la même question. Aucune erreur n'affiche directement la bonne réponse. Une erreur non reconnue retombe sur un retour générique.

### 3.4 Maîtrise et révision (E4, E5)
États par compétence **et par stratégie** :

| État | Condition (à régler après tests) |
|---|---|
| `vu` | Mission jouée au moins une fois |
| `compris` | Preuves de compréhension (exploration réussie, défis réussis **sans aide**) dans ≥ 2 formes d'exercice |
| `durable` | Réemploi réussi en `transfer` dans ≥ 2 contextes **et** un rappel réussi après ≥ 3 jours, puis un autre après ≥ 14 jours |

_Réalisé (phase 2c, 17 nov.) : `js/learning/mastery.js` (`Mastery`, `Scheduler`, seuils dans `MASTERY_RULES`). « Compris » = au moins 2 réussites sans aide dans au moins 2 formes (réponse à taper, nombre manquant, choix, défi de mission). « Durable » = compris + 2 contextes de réemploi (rappel dans une autre session, série rapide, série libre, réemploi en mission) + un rappel réussi après ≥ 3 j et un autre après ≥ 14 j. Les rappels à échéance passent en premier dans les 2 places de rappel de chaque session, sous une forme tirée au hasard. À la migration v1, les premiers rappels sont étalés (1, 3 ou 7 j selon le niveau). L'espace parent affiche l'état et le prochain rappel._

Un échec ne fait jamais « perdre » un état d'un coup : il programme un rappel plus proche. Le temps de réponse n'est qu'un signal secondaire, jamais décisif (§5.3).

`scheduler.js` : une file de rappels datés (type Leitner : 1 j → 3 j → 7 j → 14 j → 30 j). À chaque session, il propose en priorité les notions fragiles, en **variant la forme** de l'exercice (E4, §5.4). L'histoire, elle, avance sans condition de maîtrise.

### 3.5 Données v2 (E6)
```jsonc
{ "app": "mathpulse", "version": 2,
  "progression": { "skills": {…v1…}, "missions": { "m-pass-ten-8-7": { "runs": 2, "lastAt": "…", "evidence": […] } },
                   "mastery": { "addition-simple": { "state": "compris", "strategies": { "pass-through-ten": "vu" } } },
                   "reviews": [ { "skill": "…", "dueAt": "…", "box": 2 } ],
                   "chaptersSeen": {…} },
  "history": […], "prefs": {…} }
```
**Migration v1 → v2** : `skills`, `errors`, `chaptersSeen`, `discovered`, historique et préférences sont conservés ; `missions`, `mastery`, `reviews` sont créés vides ; l'état initial de `mastery` se déduit prudemment des niveaux v1 (niveau 3 → `compris`, jamais `durable`). L'import v1 reste accepté (déjà versionné) ; un fichier v2 est refusé par une appli v1 (garde-fou déjà en place).

## 4. Stratégie de migration (pas de réécriture)

1. **Branche longue `v2`** ; `main` reste en 1.x (correctifs seulement).
2. **Étranglement progressif** : le moteur de missions s'ajoute à côté de `Session` ; les 34 compétences continuent de fonctionner telles quelles comme entraînement.
3. **Découplage de l'histoire** (§2.3-1) en premier : c'est le changement le plus structurant et le plus visible.
4. Une compétence est « migrée » quand elle a au moins une mission, des stratégies et un catalogue d'erreurs ; les autres gardent l'écran de découverte actuel.

## 5. Plan de travail proposé

| Phase | Livrable | Critère de fin |
|---|---|---|
| 1 (ici) | Ce document validé ; décisions §6 prises | Décisions consignées |
| 2a ✅ | `mission/runner` + étapes `scene/problem/challenge/explain` + format de mission + migration de données v2 | Une mission « factice » tourne de bout en bout, tests unitaires |
| 2b ✅ | `diagnosis` + `feedback` gradué + catalogue d'erreurs (additions) | Chaque erreur type testée produit le bon retour |
| 2c ✅ | `mastery` + `scheduler` | Simulations de séquences de réponses → états et rappels attendus (tests) |
| 3 ✅ (code) | Composant tactile (frise / boîte de 10) + mission pilote 47 + 8 complète | Test avec ton fils sur téléphone ; ajustements |
| 4 ✅ (code, 1re vague) | Trois missions de plus (52 − 7, 6 × 4, 15 ÷ 5) et leurs manipulations | Tests ; essai réel |
| 5+ | Généralisation (§15 de la synthèse) | — |

### Phase 3 — réalisé le 17 novembre (reste : le test réel)

- `js/manipulatives/ten-frame.js` : boîte de 10. `TenFrameModel` (logique testée) et `TenFrame.create` (rendu tactile : toucher un objet le fait filer dans la prochaine case vide ; on peut aussi le glisser jusqu'à la boîte, lâché ailleurs il revient ; boîte pleine : les objets restants ne bougent plus et la boîte tremble ; toucher un objet ajouté le fait ressortir ; cibles de 48 à 56 px, tout tient sur un écran de 375 × 667).
- Étape `explore` dans la mission 47 + 8, entre le problème et l'explication : but « remplir la boîte », piste d'Andrea après 12 s sans geste ou sur un geste à vide, « Continuer » seulement quand le but est atteint.
- **Parcours de l'enfant** : quand la compétence du jour a une mission pas encore jouée, la mission est proposée à la place de l'écran de découverte (`missionForSkill`), puis retour à l'univers. Elle compte comme une activité terminée (+3 pour l'histoire).
- À faire avec un vrai enfant : observer la manipulation (comprend-il qu'il suffit de toucher les gouttes ?), le temps passé, les pistes déclenchées ; ajuster textes et délais.

### Phase 4, première vague — réalisée le 17 novembre (reste : l'essai réel)

Une mission par grande opération, chacune avec sa manipulation et son astuce (carnet). Même déroulé que la mission pilote : scène, problème, manipulation, explication, défi, réemploi.

| Mission | Compétence | Manipulation | Astuce | Défi / réemploi |
|---|---|---|---|---|
| `back-ten-52-7` Les débris | `sub-units` | **casser une dizaine** (`break-ten.js`) : enlever d'abord les objets seuls (on tombe sur 50), puis ouvrir un paquet de 10 ; ouvrir trop tôt est refusé | Redescendre à la dizaine : 52 − 2 − 5 | 43 − 6 ; 61 − 4 (minutes avant le décollage) |
| `double-double-6x4` Les boulons des moteurs | `multiply-4` | **paquets égaux** (`groups.js`) : toucher un moteur pose ses 4 boulons ; le compte avance de 4 en 4 | Fois 4 : le double du double (6 × 2 = 12, 12 × 2 = 24) | 7 × 4 ; 8 × 4 (pieds de tables) |
| `share-15-5` Les cellules d'énergie | `divide-5` | **partager** (`share.js`) : toucher une cellule l'envoie dans le réservoir qui en a le moins ; glisser = choisir le réservoir ; un partage injuste est signalé, on reprend une cellule en la touchant | Partager avec la table : 5 × 3 = 15, donc 15 ÷ 5 = 3 | 20 ÷ 5 ; 35 ÷ 5 (équipes) |

- Socle commun `js/manipulatives/common.js` (vol d'un objet, secousse, toucher et glisser au pointeur) et registre `registry.js` (outil d'une étape `explore` → modèle + rendu). L'écran `explore` est générique ; répliques propres à un outil dans `say` (par événement).
- Un clic qui suit un toucher ne déclenche un bouton que s'il a commencé sur lui (sinon, après un toucher qui réorganise l'écran, il tombait sur un autre objet).
- Les scènes se passent dans le vaisseau sans dépendre d'un chapitre : une mission se lance la première fois que sa compétence tombe en séance, à n'importe quel moment de l'histoire.
- Tests : chaque modèle (règles, rien ne se perd), chaque mission jouée de bout en bout, formules cohérentes avec le problème, une seule mission par compétence.

### Carnet de découvertes — réalisé le 17 novembre

`js/ui/notebook.js`, bouton « 📒 Mon carnet » sur l'accueil. Quatre pages, sans score ni pourcentage : **mes astuces** (stratégies vues en mission, avec leur formule ; toucher = revoir l'explication), **ce que je sais faire** (notions découvertes par parcours, avec l'état 👀 découvert / 💡 compris / 🌳 bien ancré ; toucher = revoir la découverte), **ce que la hase m'a appris** (l'idée de science de chaque chapitre lu, champ `idea` de `chapters.js`), **mes missions** (à rejouer ; rejouer ne fait pas avancer l'histoire une seconde fois).

## 6. Décisions (16 novembre 2026)

1. **Public cible : 8 ans (CE2) reste le cœur.** 8 + 7 n'était qu'un exemple ; la mission pilote devient **47 + 8** (même stratégie de passage par la dizaine, au niveau CE2, compétence existante `add-units`).
2. **Lecture : textes très courts, animations porteuses du sens.** Pas de voix dans le périmètre initial.
3. **Manipulation : toucher pour placer, glisser possible.** Révisé le 17 novembre après essai : « toucher l'objet, puis toucher la destination » n'était pas intuitif. Quand il n'y a qu'une destination (boîte de 10), toucher l'objet suffit ; le glisser-déposer marche aussi. Une manipulation à plusieurs destinations pourra demander de glisser.
4. **Étoiles : conservées comme récompense de satisfaction**, sans rôle de verrou une fois l'histoire découplée (compatibilité des données v1, repère familier pour l'enfant).
5. **Seuils de maîtrise : valeurs du §3.4 comme point de départ** (≥ 2 formes, ≥ 2 contextes, rappels à 3 j et 14 j), regroupés dans une constante réglable et ajustés après les premiers tests réels.
6. **Branche `v2` longue** ; `main` reste en 1.x (correctifs uniquement).

7. **Personnages (17 nov.).** Le renard **est le joueur** : son prénom est demandé une fois (écran dédié avant le premier accueil, modifiable dans l'espace parent, facultatif) et remplace `{nom}` dans les textes (« renard » par défaut). La « lapine » est en réalité une **hase** et s'appelle **Andrea**. « Gab » (nom venu de la synthèse) n'est pas retenu. Les identifiants techniques `rabbit` / `lapine` restent inchangés (clés de données et noms de fichiers).
