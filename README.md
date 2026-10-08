# MathPulse 🦊

🚀 **https://lstux.github.io/MathPulse/**

Jeu de calcul mental pour enfants (~8 ans, CE2), en HTML/CSS/JS sans dépendance, installable (PWA), qui fonctionne hors ligne. Les données restent dans le navigateur (localStorage) : pas de compte, pas de serveur.

**Statut : prototype jouable (pré-bêta).** Voir [`docs/revue-mvp.md`](docs/revue-mvp.md) pour l'état réel et les questions ouvertes, et [`docs/plan-beta-rc.md`](docs/plan-beta-rc.md) pour la suite.

## Ce qui fonctionne aujourd'hui

- 3 compétences : additions (1–9), ×2, ×5. Sessions de 5 questions : réponse numérique, QCM, nombre manquant.
- Découverte animée la première fois qu'une compétence est jouée.
- Erreur = explication visuelle (blocs / groupes), jamais de punition. Bouton « 💡 coup de pouce » pour voir l'illustration avant de répondre : **2 gratuits par session** ; au-delà, la session rapporte 2 étoiles au maximum et les réponses aidées ne comptent plus dans la maîtrise.
- Saisie par pavé numérique intégré (clavier physique accepté sur ordinateur).
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
python3 tests/smoke.py                              # parcours complet + hors ligne (Playwright ; démarre son propre serveur)
python3 tests/smoke.py https://lstux.github.io/MathPulse/   # même test sur la version en ligne
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

À chaque push sur `main`, le workflow `.github/workflows/ci-pages.yml` lance les tests (unitaires + navigateur) puis publie le site sur **https://lstux.github.io/MathPulse/**. Seuls les fichiers de l'application sont publiés (pas `tests/` ni `docs/`), et l'étiquette du cache hors ligne (`CACHE_VERSION` dans `sw.js`) est remplacée automatiquement par l'identifiant du commit : pas besoin de l'incrémenter à la main.

Réglage à faire **une seule fois** : *Settings → Pages → Build and deployment → Source : GitHub Actions*. Les chemins sont relatifs, l'application fonctionne telle quelle dans le sous-dossier `/MathPulse/`.

Sur téléphone : ouvrir l'adresse dans Chrome (Android) puis « Installer l'application », ou dans Safari (iPhone/iPad) « Partager → Sur l'écran d'accueil ».

## Inspirations

[Slovingo](https://github.com/lstux/Slovingo) (architecture légère, offline d'abord) et la spec de conception initiale (v0.2).

_Licence : à définir (aucun fichier LICENSE pour l'instant)._

## Sons

Effets sonores Mixkit (voir `assets/sounds/CREDITS.md`). `assets/sounds/bank/` contient tous les sons réencodés ; les sons utilisés sont copiés dans `assets/sounds/` sous un nom court (`./assets/sounds/encode.sh pick <nom-dans-bank> <nom-court>`). Activés par défaut, coupables via le bouton 🔊/🔇 (jeu et espace parent) ; le réglage est mémorisé.
