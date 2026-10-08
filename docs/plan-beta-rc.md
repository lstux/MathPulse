# MathPulse — Plan vers la bêta puis la release candidate

_Rédigé le 6 octobre 2026. Les dates sont indicatives et supposent quelques soirées de travail par semaine ; elles se décalent si le rythme change. Les questions Q1 à Q13 renvoient à [`revue-mvp.md`](revue-mvp.md)._

## Vue d'ensemble

| Étape | Version | Objectif | Durée estimée | Dates indicatives |
|---|---|---|---|---|
| 0. Stabilisation | 0.1 | App qui tourne, testée, docs honnêtes | **fait** | 6 oct. |
| 1. Alpha | 0.5 | Combler les trous pédagogiques majeurs et mettre en ligne | ~1 semaine | 7 – 16 oct. |
| 2. Bêta | 0.9 | Un enfant joue réellement ; on mesure et on ajuste | ~3 semaines (dont 2 d'usage) | 19 oct. – 6 nov. |
| 3. Release candidate | 1.0-rc.1 | Gel des fonctionnalités, uniquement des correctifs | ~1,5 semaine | 9 – 20 nov. |
| 4. Version 1.0 | 1.0.0 | Publication | — | fin nov. si la RC est propre |

Règle de passage d'une étape à la suivante : **tous les critères de sortie sont cochés**, sinon on reste dans l'étape.

---

## Étape 1 — Alpha (v0.5)

**But :** une application qu'on peut mettre entre les mains d'un enfant sans que la pédagogie soit « à trous ». Décisions du 6 octobre : Q2 (temps ajustés après les premiers tests), Q4 (espace parent non protégé), Q5 (un seul profil), Q6 (pavé numérique) ; Q1 (2 coups de pouce gratuits par session, au-delà 2⭐ max et hors maîtrise).

| Chantier | Détail | Taille |
|---|---|---|
| Mise en ligne | ✅ Workflow Pages écrit (déploie après les tests) ; reste à activer *Settings → Pages → Source : GitHub Actions*, tester l'adresse réelle sur téléphone, afficher la version dans l'espace parent | S |
| Intégration continue | ✅ Écrit (`ci-pages.yml` : tests unitaires + smoke à chaque push et PR) ; à valider au premier passage | S |
| Réapparition des erreurs | ✅ **Fait** (7 oct.) : opérations ratées mémorisées, 2 max réinjectées par session (questions 2 et 4) jusqu'à 2 réussites consécutives ; 8 tests unitaires + parcours navigateur | — |
| Mélange des notions | ✅ **Fait** (8 oct.) : sessions à 60 % compétence ciblée / 40 % rappels (calculs ratés d'abord, puis autres compétences déjà pratiquées), questions 2 et 4 | — |
| Maîtrise plus juste | ✅ **Fait** : fenêtre glissante de 20 réponses (Q3, 8 oct., anciennes données migrées) ; coups de pouce (Q1) | — |
| Pavé numérique | ✅ **Fait** (le 6 oct.) : grandes touches, ⌫, ✓, clavier physique | — |
| Journal d'usage local | Enregistrer abandons (✕), usage de l'aide, temps par question dans l'historique | S |

**Critères de sortie :**
- [ ] Tests unitaires et smoke verts en CI sur chaque push.
- [x] Une erreur réapparaît bien dans la session suivante (test automatique : unitaire + navigateur).
- [ ] Application accessible en ligne et installable sur au moins un Android.
- [x] Q1, Q2, Q4, Q5, Q6 tranchées (6 oct.) et consignées dans `revue-mvp.md`.

---

## Étape 2 — Bêta (v0.9)

**But :** apprendre de l'usage réel. On élargit un peu le contenu, on soigne l'apparence, on mesure.

### Chantiers

| Chantier | Détail | Taille |
|---|---|---|
| Contenu | Soustraction simple (animation de retrait) et ×10, ajustés au niveau réel de l'enfant testeur (Q9) | M |
| Mini-jeu « série rapide » | 5 calculs enchaînés, sans pression visible (spec §9, §27) | M |
| Identité visuelle | Fusée, renard et planètes en SVG, états du renard (content, encourageant) (Q10) | L |
| Accessibilité | Passage axe/Lighthouse mesuré, navigation clavier complète, annonces lecteur d'écran, test avec animations réduites | M |
| Appareils réels | Android Chrome (installation), iPhone/iPad Safari (écran d'accueil), PC ; vérifier la persistance des données (Q12) | M |
| Mise à jour de la PWA | Message « nouvelle version disponible » quand le service worker se met à jour | S |
| Parent | Guide d'installation sur l'écran d'accueil, rappel d'export, lecture simple des tendances | S |

### Protocole de test (2 semaines)

1. **Testeur(s)** : 1 à 3 enfants de 7–9 ans, 1 session de 5 à 10 minutes par jour, un adulte à côté la première fois, ensuite en autonomie.
2. **Observation** (une fois par semaine, 10 minutes) : l'enfant comprend-il quoi faire sans lire ? Où hésite-t-il ? Que dit-il du renard, des planètes, de l'aide ?
3. **Données** (export JSON en fin de semaine) : sessions par jour, précision et temps par compétence, usage de l'aide, abandons, erreurs récurrentes.
4. **Retours** : un carnet simple (tableau partagé ou fichier `docs/retours-beta.md`) avec la date, ce qui s'est passé, la gravité (P0 bloquant / P1 gênant / P2 confort).

### Critères de sortie
- [ ] Au moins 10 sessions complétées par enfant testeur, sans bug bloquant (P0).
- [ ] Aucune perte de données constatée (Android, iOS, PC), y compris après 7 jours sans usage.
- [ ] Installation réussie sur Android **et** iOS ; fonctionnement hors ligne vérifié sur appareil.
- [ ] Scores Lighthouse (PWA, accessibilité) **mesurés et consignés**, objectif ≥ 90.
- [ ] Les enfants relancent l'application spontanément (au moins 1 session non sollicitée par semaine).
- [ ] Seuils de maîtrise et rythme de progression (Q2, Q7) réglés d'après les données.
- [ ] Q9, Q10 tranchées ; liste des P1 restants priorisée.

---

## Étape 3 — Release candidate (1.0-rc.1)

**But :** une version qu'on aurait envie de publier telle quelle. **Gel des fonctionnalités** : à partir d'ici, uniquement des corrections.

### Chantiers

| Chantier | Détail |
|---|---|
| Triage de la bêta | Tous les P0 et P1 corrigés ; P2 reportés dans une liste « après 1.0 » |
| Données | Version du format de données (`version: 1`) + migration testée sur les données des testeurs de la bêta |
| Mise à jour | Parcours de mise à jour du service worker testé de bout en bout (ancienne version → nouvelle, sans perte) |
| Documentation | `LICENSE` (Q13), README final, `CHANGELOG.md`, note de confidentialité (« aucune donnée ne quitte l'appareil ») |
| Finitions | Captures d'écran dans le manifeste, titres/descriptions finaux, page 404 propre, vérification des textes (orthographe, ton) |
| Publication | Étiquette Git `v1.0.0-rc.1`, déploiement sur l'adresse définitive |

### Période d'observation de la RC (1 semaine)
Utilisation normale par les enfants testeurs, sans aucune nouvelle fonctionnalité. Tout bug trouvé donne une `rc.2`, et la semaine d'observation repart.

### Critères de sortie (→ 1.0)
- [ ] Zéro P0 et zéro P1 ouverts ; une semaine complète sans nouveau bug P0/P1.
- [ ] Tests unitaires, smoke et Lighthouse verts sur la version déployée.
- [ ] Migration de données et mise à jour du service worker validées.
- [ ] Licence, changelog et note de confidentialité publiés.
- [ ] Sauvegarde/export vérifié : une progression exportée se restaure (ajouter un bouton d'import si absent).

---

## Risques principaux

| Risque | Impact | Parade |
|---|---|---|
| La pédagogie ne « prend » pas (trop facile, trop dur, lassant) | Fort | Bêta courte et mesurée ; seuils réglables dans `skills.js` ; discussion directe avec l'enfant |
| Perte de données sur iOS/Safari | Fort | Installation sur l'écran d'accueil, stockage persistant, export régulier, test réel dès la bêta |
| Rendu des émojis différent selon les appareils | Moyen | Illustrations SVG (étape 2) |
| Trop de fonctionnalités avant d'avoir des retours | Moyen | Le périmètre de l'alpha est volontairement limité ; contenu étendu seulement en bêta |
| Charge de travail irrégulière | Moyen | Les dates sont indicatives ; les critères de sortie priment sur le calendrier |

## Premières actions (dès validation du plan)

1. Activer GitHub Pages (*Source : GitHub Actions*) et vérifier l'adresse sur un téléphone.
2. ✅ Réapparition des erreurs (fait).
3. ✅ Maîtrise sur les 20 dernières réponses, puis mélange des notions (faits le 8 oct.).
