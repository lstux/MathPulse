# MathPulse 🚀

Une application web légère et ludique pour apprendre le calcul mental — conçue pour les enfants autour de 8 ans (CE2), inspirée par l'esprit de [Slovingo](https://github.com/lstux/Slovingo).

## Vision

> **Un petit jeu de calcul mental que l'enfant a envie d'utiliser, mais dont chaque élément de jeu sert réellement l'apprentissage.**

- 🎮 **Jeu d'abord** : expérience fluide et amusante
- 📚 **Pédagogie au cœur** : chaque animation explique, pas seulement décore
- 🚀 **Univers spatial** : fusée + personnage 🦊 qui décolle, planètes se déverrouillent
- ⭐ **Progression visible** : étoiles collectées, pas de badges/pression
- 📊 **Espace parent** : suivi simple de la progression et des stats
- 🌐 **Offline d'abord** : PWA, localStorage, zéro compte nécessaire

## Tech Stack

- **Vanilla JS** : HTML/CSS/JavaScript pur
- **PWA** : fonctionne hors ligne, installable
- **localStorage** : données locales, aucune dépendance serveur
- **Animations SVG/CSS** : pédagogiques et fluides

## MVP — 3 compétences pilotes

1. **Additions simples** (5+3, 7+2... max ~15) → blocs Tetris
2. **×2** (doubler objets) → duplication animée
3. **×5** (groupes) → groupes visuels

Chacune traverse : découverte → jeux variés → progression univers

## Structure

```
mathpulse/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline)
├── css/
│   ├── main.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── app.js              # Bootstrap
│   ├── core/
│   │   ├── engine.js       # Moteur central
│   │   ├── session.js
│   │   ├── progression.js
│   │   └── storage.js
│   ├── content/
│   │   ├── skills.js
│   │   ├── exercises.js
│   │   └── operations.js
│   ├── games/
│   │   ├── baseGame.js
│   │   ├── numeric.js
│   │   ├── multiple.js
│   │   ├── missing.js
│   │   └── series.js
│   ├── ui/
│   │   ├── screen.js
│   │   ├── components.js
│   │   ├── animations.js
│   │   └── universe.js
│   └── utils/
│       ├── random.js
│       ├── math.js
│       └── dom.js
├── assets/
│   ├── svg/                # Fusée, planètes, étoiles, animations
│   ├── icons/              # PWA icons
│   └── sounds/             # Optionnel & discret
└── data/
    ├── skills.json
    ├── operations.json
    └── curriculum.json
```

## Décisions MVP (06/10/2026)

- ✅ **Univers** : Espace classique (bleus/violets/orangés)
- ✅ **Personnage** : Fusée + renard 🦊
- ✅ **Stats** : Espace parent avec suivi progression
- ✅ **Son** : Optionnel, à implémenter après MVP
- ✅ **Temps réponse** : < 3s pour "rapide"

## Roadmap

### Week 1 (06–10 oct) — Fondations
- [ ] Archi + Setup (HTML/CSS/PWA)
- [ ] Storage.js + localStorage API
- [ ] Engine.js (moteur central)
- [ ] Universe.js (fusée, planètes, étoiles)
- [ ] Compétence 1 : Additions (découverte + jeux + feedback)

### Week 2 (13–17 oct) — Compétences & Polish
- [ ] Compétence 2 : ×2 (duplication)
- [ ] Compétence 3 : ×5 (groupes)
- [ ] QA + offline test
- [ ] Mobile polish + accessibilité
- [ ] Déploiement + README

## Installation & Dev

```bash
git clone https://github.com/lstux/mathpulse
cd mathpulse

# Dev local
python3 -m http.server 8000
# Ouvre http://localhost:8000

# PWA test
# Install depuis le menu du navigateur
# Test offline (DevTools → Network → Offline)
```

## Inspirations

- [Slovingo](https://github.com/lstux/Slovingo) — architecture légère, offline-first
- Pédagogie Singapour — représentations visuelles des calculs
- Jeux d'apprentissage modernes — sessions courtes, feedback positif

## License

MIT

---

**Mainteneur** : @lstux  
**Démarrage** : 6 octobre 2026
