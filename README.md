# MathPulse 🚀🦊

Jeu de calcul mental pour enfants (~8 ans, CE2), en HTML/CSS/JS sans dépendance, installable (PWA), qui fonctionne hors ligne. Les données restent dans le navigateur (localStorage) : pas de compte, pas de serveur.

**Statut : prototype jouable (pré-bêta).** Voir [`docs/revue-mvp.md`](docs/revue-mvp.md) pour l'état réel et les questions ouvertes, et [`docs/plan-beta-rc.md`](docs/plan-beta-rc.md) pour la suite.

## Ce qui fonctionne aujourd'hui

- 3 compétences : additions (1–9), ×2, ×5. Sessions de 5 questions : réponse numérique, QCM, nombre manquant.
- Découverte animée la première fois qu'une compétence est jouée.
- Erreur = explication visuelle (blocs / groupes), jamais de punition. Bouton « 💡 coup de pouce » pour voir l'illustration avant de répondre.
- Étoiles de session (0–3) qui font avancer la fusée et débloquent des planètes (10 / 25 / 50 étoiles). Maîtrise par compétence (⭐ à ⭐⭐⭐) affichée dans l'espace parent.
- Espace parent : progression, historique, export JSON, réinitialisation.
- Hors ligne (service worker), thème clair/sombre automatique, animations réduites si demandé par le système.

## Lancer en local

```bash
python3 -m http.server 8000      # puis http://localhost:8000
```
Le service worker n'est pas enregistré sur `localhost` (pour ne pas masquer vos modifications) ; ajoutez `?sw` à l'URL pour le tester.

## Tests

```bash
node tests/run.js                                   # tests unitaires (aucune dépendance)
python3 tests/smoke.py http://localhost:8000/index.html   # parcours complet + hors ligne (Playwright)
```

## Structure

```
index.html · manifest.json · sw.js
css/       main.css (base, composants, écrans) · animations.css · responsive.css
js/
  content/skills.js     catalogue des compétences, seuils de maîtrise, barème d'étoiles, planètes
  core/                 storage · progression · engine (génération/validation) · session
  ui/                   screen (écrans) · universe · discovery · animations (blocs/groupes)
  app.js                démarrage
assets/icons/           icône SVG + PNG (PWA)
tests/                  run.js + engine.test.js (unitaires) · smoke.py (navigateur)
docs/                   revue du MVP, plan bêta / release candidate
```

Ajouter une compétence : une entrée dans `SKILLS` (skills.js), un cas dans `Engine.generateExercise`, un contenu dans `Discovery.content`.

## Déploiement (GitHub Pages)

Les chemins sont relatifs : le dépôt peut être servi tel quel depuis `https://<utilisateur>.github.io/MathPulse/`. Réglage : *Settings → Pages → Deploy from a branch → `main` / root*. Pensez à incrémenter `CACHE_VERSION` dans `sw.js` à chaque livraison. _Le déploiement n'a pas encore été effectué ni testé sur appareils réels._

## Inspirations

[Slovingo](https://github.com/lstux/Slovingo) (architecture légère, offline d'abord) et la spec de conception initiale (v0.2).

_Licence : à définir (aucun fichier LICENSE pour l'instant)._
