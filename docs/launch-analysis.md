# MATHPULSE — Première passe d'analyse de lancement

**Date :** 5 octobre 2026  
**Statut :** Plan d'action pour MVP  
**Univers :** Espace 🚀  
**Storage :** localStorage  
**Scope MVP :** Option B (3 compétences légères)

---

## 1. ANALYSE CRITIQUE DE LA SPEC

### Points forts ✅
- **Vision très claire** : apprendre par le jeu, pas décorer les maths avec du jeu
- **Cycles d'apprentissage bien structurés** : découverte → manipulation → entraînement → maîtrise
- **Séparation moteur/contenu/jeux** : extensible et maintenable
- **Focus sur l'erreur comme apprentissage** : pas de punition, explication visuelle
- **Sessions courtes** : respect du temps attention enfant
- **Offline + PWA + localStorage** : aucune dépendance server

---

## 2. MVP — 3 COMPÉTENCES PILOTES

### Ordre d'implémentation

```
ÉTAPE 1 : Additions simples (5 + 3, 7 + 2, 8 + 4, max 15)
├─ Pourquoi : le plus facile à visualiser (blocs Tetris)
├─ Cycles : découverte (animation) → jeu numérique → jeu missing
└─ Durée estimée : 2-3 jours de dev

ÉTAPE 2 : ×2 (doubler les objets)
├─ Pourquoi : animation très parlante (duplication)
├─ Cycles : découverte (animation) → jeu numérique → jeu missing
└─ Durée estimée : 2 jours (réutilise patterns)

ÉTAPE 3 : ×5 (groupes de 5)
├─ Pourquoi : premier calcul "moins évi" mais visuellement clair
├─ Cycles : découverte (animation) → jeu numérique → jeu multiple → jeu missing
└─ Durée estimée : 2-3 jours
```

---

## 3. SYSTÈME DE PROGRESSION & RÉCOMPENSES

### Univers Espace 🚀

```
AVANT DÉBUT                    APRÈS 10 ÉTOILES
      🚀                              🚀 ↗️
     Pad                             
   (Terre)                      ☆ ☆ ☆ ☆ ☆
                                Planet 1 déverrouillée
                                (première zone)

APRÈS 25 ÉTOILES
     🚀 → → →
    
    ☆ ☆ ☆   ☆ ☆ ☆
   Plan 1  Plan 2 (nouvelle!)
           
           
APRÈS 50 ÉTOILES
     🚀 → → → → → →
     
    ☆ ☆ ☆   ☆ ☆ ☆   ☆ ☆ ☆
   Plan 1  Plan 2  Plan 3 (asteroid!)
```

### Données de maîtrise

```json
{
  "skill_id": "addition-simple",
  "seen": 12,
  "correct": 11,
  "wrong": 1,
  "avg_time_ms": 2800,
  "last_practiced": "2026-10-05T19:30",
  "mastery_level": 3,  // ⭐⭐⭐
  "needs_review": false
}
```

**Mastery Level** :
- 1 : Vu une fois (⭐☆☆)
- 2 : Quelques succès (⭐⭐☆)
- 3 : Bien maîtrisé (⭐⭐⭐)

Passer à niveau 2 : 70% de taux réussite + min 3 questions  
Passer à niveau 3 : 90% de taux réussite + min 5 questions + temps < 3s

---

## 4. ERREURS & PÉDAGOGIE

### Scénario : Erreur sur 7 × 5

```
Enfant répond : 34 (❌ faux)

Au lieu de : ❌ FAUX !!!

On affiche :

"Hmm, pas cette fois-ci ! 🤔

Regardons ensemble :

7 × 5 = 7 groupes de 5

[Animation : 7 groupes de 5 objets]
[Comptage : 1-2-3-4... 35]

Il y a 35 !
Réessayons !"

[Validation : 35]
✅ Oui ! Bien joué !
```

---

## 5. CHECKLIST MVP FINALE

### Must-Have ✅
- [ ] localStorage (aucun compte)
- [ ] PWA + offline
- [ ] 3 compétences (+ simple, ×2, ×5)
- [ ] 3-4 types de jeux min
- [ ] Animations pédagogiques (blocs, groupes, duplication)
- [ ] Progression visible (fusée + étoiles)
- [ ] Erreurs explicatives (pas de punition)
- [ ] Sessions courtes (~5 questions)
- [ ] Responsive mobile + desktop

### Nice-to-Have 🌟
- [ ] Son discret (optionnel)
- [ ] Export progression (parent)
- [ ] Espace parent simple (stats)
- [ ] Animation déblocage zone

### Out-of-Scope 🚫
- [ ] Comptes / sync cloud
- [ ] Leaderboard
- [ ] Full programme CE2
- [ ] Tutoriel long

---

**Voir aussi:** week-1-plan.md, revue-mvp.md, plan-beta-rc.md
