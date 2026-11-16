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
| E7 | Smartphone d'abord, tactile (§2) | Manipulations **« toucher pour déplacer »**, grandes cibles, pas de glisser-déposer obligatoire |

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
Le retour est **gradué** (indice → question → visuel → nouvelle expérience → explication explicite) : on monte d'un cran à chaque nouvelle erreur sur la même question. Aucune erreur n'affiche directement la bonne réponse. Une erreur non reconnue retombe sur un retour générique.

### 3.4 Maîtrise et révision (E4, E5)
États par compétence **et par stratégie** :

| État | Condition (à régler après tests) |
|---|---|
| `vu` | Mission jouée au moins une fois |
| `compris` | Preuves de compréhension (exploration réussie, défis réussis **sans aide**) dans ≥ 2 formes d'exercice |
| `durable` | Réemploi réussi en `transfer` dans ≥ 2 contextes **et** un rappel réussi après ≥ 3 jours, puis un autre après ≥ 14 jours |

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
| 2a | `mission/runner` + étapes `scene/problem/challenge/explain` + format de mission + migration de données v2 | Une mission « factice » tourne de bout en bout, tests unitaires |
| 2b | `diagnosis` + `feedback` gradué + catalogue d'erreurs (additions) | Chaque erreur type testée produit le bon retour |
| 2c | `mastery` + `scheduler` | Simulations de séquences de réponses → états et rappels attendus (tests) |
| 3 | Composant `ten-frame` tactile + mission 8 + 7 complète | Test avec ton fils sur téléphone ; ajustements |
| 4+ | Généralisation (§15 de la synthèse) | — |

## 6. Décisions à prendre **[À trancher]**

1. **Public cible.** La mission 8 + 7 relève du CP/CE1, le jeu actuel vise le CE2. On garde 8 ans comme cœur et on assume que les missions de base servent aussi de rattrapage ? Ou on abaisse le public ?
2. **Lecture.** Sans voix (hors périmètre), une pédagogie de découverte reste très textuelle. Pour un lecteur débutant, accepte-t-on des textes **ultra courts + animations porteuses du sens** (ma proposition), ou la voix est-elle remontée en priorité ?
3. **Manipulation tactile.** « Toucher un objet, puis toucher la destination » plutôt que le glisser-déposer, par défaut sur mobile. D'accord ?
4. **Statut de l'étoile.** Une fois l'histoire découplée, les étoiles deviennent un retour de satisfaction sans rôle de verrou. On les garde (compatibilité, ambiance) ou on les retire de l'interface enfant ?
5. **Seuils de maîtrise** (≥ 2 contextes, rappels à 3 j et 14 j) : bonne base de départ, à régler après les premiers tests avec ton fils.
6. **Versions.** Branche `v2` longue avec 1.x en maintenance sur `main`, ou développement sur `main` derrière un drapeau ?
