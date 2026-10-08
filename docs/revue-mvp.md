# MathPulse — Revue du MVP

_Revue du 6 octobre 2026, réalisée en exécutant l'application (Chromium headless, 390 px, thèmes clair et sombre) et en relisant tout le code._

## 1. Verdict

**Avant la revue, l'application ne fonctionnait pas** : le bouton « Jouer » menait à un écran cassé (erreur JavaScript au chargement). Les commits et messages précédents annonçaient « production ready », « Lighthouse > 90 », « WCAG 2.1 AA » : **ces affirmations n'avaient jamais été vérifiées** et ont été retirées de la documentation.

**Après correction**, le parcours complet fonctionne et est couvert par des tests automatiques : accueil → univers → découverte → 5 questions → résultat → étoiles → univers → espace parent → rechargement hors ligne. C'est un **prototype jouable**, pas un produit fini : le jeu tourne, mais la pédagogie, le rythme et l'ergonomie n'ont pas encore été testés avec un enfant (c'est le but de la bêta).

## 2. Problèmes trouvés et corrigés

| # | Gravité | Problème | Correction |
|---|---|---|---|
| 1 | Bloquant | `js/games/series.js` contenait du code collé par erreur (une classe `Universe` factice + des résidus de commande shell) : le chargement plantait, `Universe` n'existait pas, le jeu était injouable. | Fichiers vides ou parasites supprimés ; scripts chargés dans `index.html` revus. |
| 2 | Bloquant | **Économie d'étoiles cassée** : le total était calculé à partir de la maîtrise (3 compétences × 2 = 6 étoiles maximum), donc les planètes à 10/25/50 étoiles étaient inatteignables. Les « +2 étoiles » du résultat n'étaient jamais enregistrées. | Séparation nette : *étoiles de récompense* (cumulées à chaque session, barème 0–3) et *maîtrise* (niveau 1–3 par compétence). Crédit unique à la fin de session, déblocage de planète annoncé. |
| 3 | Majeur | Le chrono mesurait le temps **depuis le début de la session** : le temps moyen gonflait, le niveau ⭐⭐⭐ (< 3 s) était inatteignable. | Chrono par question, démarré à l'affichage de la question (pas pendant la découverte), plafonné à 15 s. |
| 4 | Majeur | Les QCM et « nombre manquant » étaient affichés comme une saisie libre ; la compétence ×5 ne proposait jamais « nombre manquant » (erreur d'index) ; tirage de distracteurs biaisé, parfois moins de 4 choix ; doublons fréquents dans une session. | Vrais boutons de choix (✓/✗ en plus de la couleur), 4 choix distincts garantis, plan de session explicite par compétence, anti-doublons. |
| 5 | Majeur | Explications **en anglais** dans une interface française, et fausses pour « nombre manquant » (elles utilisaient l'opérande caché comme total). Le passage à la question suivante était automatique après 2 s : trop court pour lire. Les temporisateurs continuaient après un changement d'écran. | Explications en français, calculées depuis le total. Bonne réponse : avance seule après ~1 s. Erreur : bouton « Continuer ». Temporisateurs liés à l'écran courant. |
| 6 | Majeur | **PWA non installable** : icônes du manifeste en `data:` URI, `apple-touch-icon` inexistant, chemins absolus (`/`) incompatibles avec GitHub Pages en sous-dossier, `discovery.js` absent du pré-cache. | Vraies icônes PNG/SVG (dont maskable), chemins relatifs, pré-cache complet et versionné, repli hors ligne vérifié. |
| 7 | Majeur | L'illustration animée (7 groupes de 5 pommes sous « 7 × 5 = ? ») **donnait la réponse** : l'enfant comptait au lieu de calculer. | Illustration masquée par défaut, accessible via « 💡 Un coup de pouce » et affichée après une erreur (spec §14). Voir question Q1. |
| 8 | Moyen | Une dizaine de classes CSS utilisées mais jamais définies ; feuilles de style qui se contredisaient (doublons, boutons en colonne sur mobile) ; contrastes insuffisants (blanc sur rose ≈ 2,6:1, vert/rose clairs en texte). | CSS réécrit et réduit ; bouton secondaire en contour ; couleurs de texte dédiées claires/sombres ; cibles tactiles ≥ 48 px. |
| 9 | Moyen | Symboles astrologiques (☿ ♀ ♂) utilisés comme « planètes » ; noms en anglais ; le renard 🦊 décidé pour l'univers était absent. | Lune 🌕 / Mars 🔴 / Saturne 🪐 ; renard présent à l'accueil, dans l'univers, à la découverte et dans les retours. |
| 10 | Moyen | État de la découverte écrit directement dans `localStorage` (hors couche `storage`) ; l'ancienne page de test **écrivait dans les vraies données** ; `storage.clear()` aurait effacé tout le domaine. | Tout passe par `storage` ; reset limité aux clés MathPulse ; ancienne page de test remplacée par des tests Node isolés. |
| 11 | Mineur | Docs invérifiables (Lighthouse, WCAG, RGPD, « licence MIT » sans fichier LICENSE) ; README listant des fichiers inexistants ; code mort (`Session.renderCurrentGame`, stubs). | README et docs réécrits sur ce qui est réellement fait ; code mort supprimé. |

## 3. Ce qui est vérifié, et ce qui ne l'est pas

**Vérifié** : 12 tests unitaires (`node tests/run.js` : exercices corrects sur 500 tirages par compétence, QCM valides, validation des réponses, maîtrise, étoiles, planètes, persistance, reset) ; test de fumée navigateur (`tests/smoke.py` : parcours de 3 sessions, étoiles créditées, rechargement hors ligne, aucune erreur console) ; contrôle visuel des captures en 390 px, clair et sombre.

**Non vérifié** : appareils réels (Android, iPhone/iPad), installation de la PWA, comportement du service worker lors d'une mise à jour, score Lighthouse, lecteurs d'écran, navigation clavier complète, usage réel par un enfant, déploiement GitHub Pages.

## 4. Écarts avec la spec v0.2

| Prévu dans la spec | État |
|---|---|
| Réapparition des erreurs plus tard (§12, §14, §27) | ✅ **Fait** (7 oct.) : un calcul raté revient en question 2 et/ou 4 des sessions suivantes (2 max par session, même si la compétence du jour est autre) jusqu'à 2 réussites consécutives sans coup de pouce ; liste « Calculs à revoir » côté parent. Réglages : `REVIEW` dans `skills.js`. |
| Mélange et rappel des anciennes notions (§13) | **Non implémenté** : une session = une compétence (celle de maîtrise la plus basse, en rotation). |
| Série rapide (jeu MVP, §27) ; opération manquante, memory, classement (§9) | Non implémenté (hors périmètre « 3 compétences » choisi). |
| Contenu MVP : soustraction, ×10, nombres jusqu'à 100 (§27) | Non implémenté : seules additions, ×2, ×5 (choix « option B »). |
| Première session de calibration (§4) | Non implémentée ; une découverte animée par compétence à la place. |
| Contenu « data-driven » en JSON, prérequis entre compétences (§22) | Catalogue en JS (`skills.js`), sans prérequis ni déblocage de compétences. |
| Son optionnel | Non implémenté (préférence `sound: false` prévue dans le stockage). |
| Espace parent (§19) | Version minimale : progression, historique, export, reset ; sans protection d'accès. |

## 5. Questions à trancher

Classées par échéance. La recommandation est une proposition, pas une décision.

### Avant la bêta

_Mise à jour du 6 octobre : Q1, Q2, Q4, Q5 et Q6 sont tranchées._

**Q1 — Aide visuelle : quand l'enfant peut-il la voir, et que vaut une réponse aidée ?**
_✅ Décidé le 6 oct. : **2 coups de pouce gratuits par session** (pas par jour). Au-delà : la session rapporte **2 étoiles au maximum** (étoiles de récompense, pas la maîtrise) et les réponses aidées hors quota **ne comptent plus dans la maîtrise**. **Fait** (voir `HINTS` dans `skills.js`, tests `coups de pouce`)._
Aujourd'hui : masquée, accessible par « 💡 », automatique après une erreur. Une réponse correcte après aide compte comme une réussite normale, ce qui permet de gonfler la maîtrise en cliquant systématiquement sur l'aide.
_Recommandation :_ garder l'aide opt-in ; une réponse aidée donne les étoiles de session mais ne compte pas pour passer au niveau ⭐⭐⭐. À implémenter avant la bêta (petit).

**Q2 — Vitesse requise pour ⭐⭐⭐ (moyenne ≤ 3 s, que vous avez validée).**
_✅ Décidé le 6 oct. : les temps seront ajustés après les premiers tests. Seuils inchangés d'ici là (réglables dans `MASTERY`, `skills.js`)._
Sur téléphone, taper un nombre prend déjà 1,5 à 2,5 s pour un enfant de 8 ans. La spec précise aussi que « la vitesse reste secondaire ». Le risque : un enfant précis mais jamais ⭐⭐⭐, donc démotivé.
_Recommandation :_ conserver 3 s pour les QCM, 5 s pour la saisie, et décider définitivement avec les temps réels mesurés pendant la bêta (ils sont dans l'export).

**Q3 — Maîtrise cumulative ou fenêtre glissante.**
Aujourd'hui la précision est calculée sur toute la vie de la compétence : une mauvaise première semaine pèse très longtemps et la maîtrise ne redescend jamais.
_Recommandation :_ fenêtre des 20 dernières réponses (la maîtrise peut monter et redescendre, ce qui alimente aussi le rappel des notions anciennes).
_Décision / réalisation (8 oct.) :_ ✅ fait, fenêtre de 20 réponses ; les totaux restent conservés pour l'historique.

**Q4 — Accès à l'espace parent.**
_✅ Décidé le 6 oct. : espace parent non protégé (la réinitialisation garde sa confirmation)._
Il est actuellement accessible depuis l'accueil, avec un bouton « Réinitialiser » : un enfant peut effacer sa progression en deux clics.
_Recommandation :_ une barrière simple, par exemple appui long de 2 s ou une opération hors de portée d'un enfant de 8 ans (« 17 × 6 »). Pas de code PIN à retenir.

**Q5 — Un ou plusieurs enfants sur le même appareil ?**
_✅ Décidé le 6 oct. : un seul profil (le champ `version` des données permettra une migration si besoin)._
Le stockage est pour un seul profil. Ajouter des profils après coup oblige à migrer les données ; le faire maintenant coûte peu.
_Recommandation :_ si une fratrie utilise le même appareil, ajouter les profils avant la bêta ; sinon, rester sur un profil et conserver le champ `version` des données pour migrer plus tard.

**Q6 — Saisie des réponses.**
_✅ Décidé le 6 oct. : pavé numérique intégré — **fait** (3 chiffres max, ⌫, ✓, clavier physique sur ordinateur)._
Le clavier du téléphone occupe la moitié de l'écran et varie selon l'appareil.
_Recommandation :_ un pavé numérique intégré, grandes touches, dans le jeu.

### Avant la release candidate

**Q7 — Rythme de progression.** Avec 0 à 3 étoiles par session et des planètes à 10 / 25 / 50 étoiles, Saturne demande environ 17 à 25 sessions. Est-ce le bon rythme (une session par jour ≈ 3 à 4 semaines) ? _Recommandation :_ ajouter des paliers plus rapprochés au début (5, 12, 25, 40, 60) et régler avec les données de la bêta.

**Q8 — Mélange des notions.** Faut-il, dès la v1, mélanger les compétences dans une même session (spec §13) ? _Recommandation :_ oui, 60 % de la compétence ciblée et 40 % de rappels, dès que la réapparition des erreurs existe.
_Décision / réalisation (8 oct.) :_ ✅ fait : 3 questions du jour + 2 rappels (calculs ratés d'abord, puis autres compétences déjà pratiquées, les moins maîtrisées en premier).

**Q9 — Niveau réel de l'enfant testeur.** Les additions vont de 1+1 à 9+9 ; la spec vise « jusqu'à 20 ». Quelles compétences manquent pour qu'un CE2 s'y retrouve (soustractions, ×10, compléments à 10) ? _Recommandation :_ ajouter soustraction simple et ×10 pendant la bêta, d'après le niveau constaté.

**Q10 — Illustrations.** Les emojis s'affichent différemment selon Android, iOS et Windows. _Recommandation :_ dessiner en SVG la fusée, le renard et les planètes pour une identité visuelle stable (et un renard qui peut évoluer).

**Q11 — Son.** Souhaité « discret et optionnel » : à brancher avant la RC ou après la 1.0 ? _Recommandation :_ après la 1.0, désactivé par défaut.

**Q12 — Perte de données sur iPhone/iPad.** Safari peut effacer le stockage d'un site après environ 7 jours sans visite, sauf s'il est installé sur l'écran d'accueil. L'application demande le stockage persistant, sans garantie. _Recommandation :_ expliquer l'installation sur l'écran d'accueil dans l'espace parent, proposer un export régulier, et tester sur un vrai iPhone pendant la bêta.

**Q13 — Licence et visibilité du dépôt.** Aucun fichier LICENSE. Dépôt public ou privé, et sous quelle licence (MIT, GPL, tous droits réservés) ? Le projet pourrait être diffusé, comme Slovingo.

## 6. Dette technique connue

- Le service worker est « réseau d'abord » : simple et sûr, mais sans notification de mise à jour pour l'utilisateur.
- Pas d'intégration continue : les tests ne tournent qu'à la demande.
- Les émojis sont à la fois illustrations et pictogrammes (voir Q10).
- Pas de journal des abandons (bouton ✕) : utile à mesurer pendant la bêta.
