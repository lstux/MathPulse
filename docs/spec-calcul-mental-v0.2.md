# Calcul Mental — Spécification et conception initiale

> Application web/PWA légère de calcul mental pour enfants, inspirée de l'esprit de Slovingo mais conçue spécifiquement pour l'apprentissage des mathématiques.

**Statut :** document de conception initial  
**Version :** 0.2  
**Public cible initial :** enfants autour de 8 ans, extensible vers 9–10 ans et au-delà.

---

## Vue d'ensemble

Construire une petite expérience d'apprentissage ludique où les notions sont expliquées visuellement, manipulées, pratiquées puis automatisées.

**Principes techniques (inspirés de Slovingo)** :
- HTML/CSS/JavaScript ;
- très peu de dépendances ;
- fonctionnement offline ;
- PWA ;
- données locales ;
- contenu séparé du moteur ;
- déploiement simple.

> **Faire comprendre, pratiquer, mémoriser et automatiser sans donner l'impression de faire une feuille d'exercices scolaire.**

---

## Public cible

**Cible principale** : enfants autour de 8 ans (CE2)  
**Cible secondaire** : 9–10 ans et au-delà  
Le moteur doit être piloté par les compétences et la difficulté plutôt que par un âge fixe.

---

## Expérience utilisateur

L'enfant doit pouvoir :
1. Ouvrir l'application
2. Voir immédiatement où il en est
3. Appuyer sur une action évidente
4. Commencer à jouer
5. Progresser
6. Voir son univers évoluer
7. Terminer naturellement une petite session

**Écran d'accueil** : aucun tutoriel, juste « JOUER » bien visible + lien parent optionnel.

---

## Parcours d'apprentissage

La progression doit être **visuelle** plutôt qu'une liste de chapitres.

**Deux progressions parallèles** :

*Progression visible* (ludique) : 🌱 → 🌿 → 🌳 → 🏡 → 🏰

*Maîtrise interne* (pédagogique) :
```
Addition jusqu'à 20       92 %
Compléments à 10          100 %
×2                         81 %
×5                         64 %
×10                        97 %
```

---

## Cycle d'une compétence

Chaque compétence traverse quatre phases :

```
🌱 Je découvre
     ↓
🌿 Je manipule
     ↓
🌳 Je m'entraîne
     ↓
🏆 Je maîtrise
```

---

## Animations pédagogiques

Les animations **doivent expliquer** le calcul, pas seulement décorer.

**Exemples** :
- **Multiplication** : groupes qui se dupliquent (6 × 4 = 4 groupes de 6)
- **Addition** : blocs Tetris qui s'assemblent (27 + 15 = regroupement de dizaines)
- **Soustraction** : retrait progressif
- **Division** : partage en groupes égaux

---

## Types de jeux

- Réponse numérique (7 × 6 = ?)
- Choix multiple
- Nombre manquant (? × 5 = 25)
- Opération manquante (6 ? 7 = 42)
- Memory (associer opération et résultat)
- Série rapide (5 calculs rapides)
- Classement (du plus petit au plus grand)

---

## Progression & récompenses

**Univers Espace** 🚀 :
- Fusée décolle stage by stage
- Planètes se déverrouillent (10⭐ / 25⭐ / 50⭐)
- Étoiles collectées comme récompense
- Aucun classement entre enfants

**Maîtrise** :
```json
{
  "skill_id": "addition-simple",
  "seen": 12,
  "correct": 11,
  "mastery_level": 3,  // ⭐⭐⭐
  "avg_time_ms": 2800
}
```

Niveaux :
- **Niveau 1** : Vu une fois (⭐☆☆)
- **Niveau 2** : 70% correct + min 3 questions (⭐⭐☆)
- **Niveau 3** : 90% correct + min 5 questions + temps < 3s (⭐⭐⭐)

---

## Erreurs & pédagogie

Une erreur doit devenir une **occasion d'apprendre**.

Au lieu de : ❌ Faux !

On affiche :
```
Hmm, pas cette fois-ci ! 🤔

Regardons ensemble :

7 × 8 = 7 groupes de 8

[Animation]

Il y a 56 !
Réessayons !
```

Les erreurs réapparaissent dans les sessions suivantes (mixing).

---

## Sessions

- **Durée** : ~2–5 minutes
- **Nombre de questions** : 5 (fixe)
- **Auto-stop** : pas de « continuer ? »
- **Feedback** : résumé avec étoiles gagnées et compétences à revoir

---

## Architecture

Séparation nette : **moteur** → **contenu** → **jeux**

```
         MOTEUR
    (engine, progression, sessions)
              ↓
    ┌─────────┴─────────┐
    │                   │
  CONTENU             JEUX
(skills, ops)    (numeric, multiple, missing...)
```

---

## Stockage

- **Aucun compte requis**
- **localStorage** pour profil, progression, statistiques, récompenses
- **Extensible** : prêt pour IndexedDB si besoin

---

## PWA + Offline

- Installable sur Android / desktop
- Fonctionne complètement offline (service worker)
- Démarrage rapide
- Sensation d'app native

---

## MVP — 3 compétences pilotes

1. **Additions simples** (5+3, 7+2, max 15) — blocs Tetris
2. **×2** (doubler objets) — duplication
3. **×5** (groupes de 5) — groupes

Chaque compétence : découverte (animation) → jeu numérique → jeu multiple/missing

---

## Principes UX à préserver

1. Une action principale par écran
2. Feedback immédiat
3. Animations ont un sens pédagogique
4. Une erreur = information, pas punition
5. Difficulté progressive
6. Sessions courtes
7. Le jeu reste léger
8. Anciennes connaissances reviennent (mixing)
9. Vitesse secondaire
10. L'enfant comprend quoi faire sans long texte

---

**Pour plus de détails**, consultez les documents de lancement et planning.
