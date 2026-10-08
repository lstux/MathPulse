# MathPulse — Parcours étendu (proposition)

_Rédigé le 8 octobre 2026. Document de cadrage : rien n'est codé, les points à trancher sont en fin de document. Il complète [`plan-beta-rc.md`](plan-beta-rc.md)._

## 1. Constat : un trou important, les tables et les divisions

Aujourd'hui l'application couvre : additions jusqu'à 9 + 9, soustractions jusqu'à 18, tables de **×2, ×5 et ×10** seulement.

Or la cible principale est le CE2 (spec §« Cible principale »). Les attendus de fin de CE2 ([Eduscol, « Attendus de fin d'année de CE2, mathématiques »](https://eduscol.education.fr/document/13960/download)) sont :

| Domaine | Attendu CE2 | Couvert aujourd'hui ? |
|---|---|---|
| Tables de multiplication | « les tables de 2 à 9 », commutativité (3 × 7 = 7 × 3) | ❌ seulement ×2, ×5, ×10 |
| Division | problèmes de **partage et de groupement** ; quotient et reste d'une division euclidienne par un nombre à 1 chiffre (et par 10, 25, 50, 100) | ❌ rien |
| Multiplier par 10 / 100 | 37 × 100 | ⚠️ ×10 seulement |
| Calcul mental, addition | toute somme de deux termes < 100 ; nombre de 4 chiffres + nombre à 1 chiffre (3 204 + 70) | ❌ s'arrête à 9 + 9 |
| Calcul mental, soustraction | dizaines, centaines, milliers entiers (468 − 30, 8 756 − 5 000) | ❌ s'arrête à 18 − b |
| Nombres | jusqu'à 10 000 | ❌ |
| Calcul posé (colonnes) | additions, soustractions, multiplications | hors périmètre (l'application fait du **calcul mental**) |

> **Pourquoi ce trou ?** Au lancement, trois compétences « pilotes » (additions, ×2, ×5) ont servi à valider la boucle pédagogique ; ×10 et la soustraction ont suivi en bêta. Les autres tables n'ont jamais été planifiées explicitement : ce n'est pas un choix pédagogique, c'est un oubli de cadrage.

**Conséquence sur la priorité** : les tables ×3 à ×9 et les divisions sont le cœur du calcul mental au CE2 ; elles passent **avant** les grands nombres (type 1 375 − 376, qui relève en plus davantage du calcul posé que du calcul mental).

## 2. Principes de conception

- Une **voie** = une suite de compétences qui se débloquent l'une après l'autre (`requires` existe déjà dans `skills.js`).
- Plusieurs voies avancent en parallèle (tables, divisions, additions/soustractions) ; l'enfant n'a pas à choisir : la rotation actuelle (maîtrise la plus basse d'abord, parmi les compétences débloquées) et le mélange 60/40 s'appliquent.
- Chaque compétence garde le cycle **découverte → saisie → choix multiple → nombre manquant**, avec une animation et une astuce de calcul.
- La **série rapide** et les rappels piochent dans toutes les compétences de niveau ≥ 2, sans rien changer.

## 3. Voie A — Tables de multiplication (priorité 1)

Ordre proposé, du plus facile au plus dur, chaque table se débloquant quand la précédente de la même « famille » atteint le niveau 2 :

| Étape | Compétence | Astuce enseignée (animation) | Débloquée par |
|---|---|---|---|
| A1 | **×3** | 3 groupes, « double + 1 fois » (3 × 4 = 4 + 4 + 4 = 8 + 4) | ×2 niveau 2 |
| A2 | **×4** | « double du double » (×2 puis ×2) | ×2 niveau 2 |
| A3 | **×9** | « ×10 moins une fois » (9 × 7 = 70 − 7) et l'astuce des doigts | ×10 niveau 2 |
| A4 | **×6** | « ×5 plus une fois » (6 × 7 = 35 + 7) | ×5 niveau 2 |
| A5 | **×8** | « double de ×4 » | ×4 niveau 2 |
| A6 | **×7** | la plus difficile : il ne reste que 7 × 7, 7 × 8, 7 × 6 (les autres sont acquis par commutativité) | ×6 et ×8 niveau 2 |
| A7 | **Tables mélangées (×2 à ×9)** | commutativité (3 × 7 = 7 × 3), carrés (6 × 6) ; entraînement de fluidité | ≥ 4 tables au niveau 2 |

- **Format** : comme ×5 aujourd'hui : `a × n` avec `a` de 1 à 10, 5 questions (saisie, choix multiples, nombre manquant).
- **Animation** : un **tableau de points** (a lignes × n colonnes), qui montre aussi la commutativité en le faisant pivoter.
- **Effort** : S à M. Les tables sont presque des copies de `multiply-5` ; je propose d'en faire une **fabrique** (`makeTable(n)`) plutôt que 6 copies.
- **Seuil de rapidité** (réflexion jusqu'au premier chiffre) : 4 s pour ×3/×4, 5 s pour ×6/×8/×9, 6 s pour ×7 (valeurs à ajuster avec l'enfant testeur).

## 4. Voie B — Divisions (priorité 2)

Les divisions s'appuient sur les tables : on cherche « combien de fois ? ».

| Étape | Compétence | Format | Débloquée par |
|---|---|---|---|
| B1 | **÷2 et ÷5, ÷10** (partage et groupement) | `12 ÷ 2 = ?`, `? ÷ 5 = 4`, `15 ÷ ? = 3` | ×2 niveau 2 (÷2), ×5 niveau 2 (÷5), ×10 niveau 2 (÷10) |
| B2 | **÷3, ÷4** | idem | table correspondante niveau 2 |
| B3 | **÷6 à ÷9** | idem | table correspondante niveau 2 |
| B4 | **Division avec reste** | « 14 = 3 × ? + ? » : quotient **puis** reste | B2 niveau 2 |

- **Sens** : deux animations, le **partage** (distribuer 12 objets dans 3 paniers) et le **groupement** (combien de paquets de 4 dans 12 ?).
- **B1 à B3** : sans reste (résultats exacts) ; l'astuce : « 12 ÷ 3, c'est le nombre qui, multiplié par 3, donne 12 ».
- **B4** demande une saisie à **deux réponses** (quotient et reste) : c'est le seul chantier d'interface nouveau de cette voie (effort M). À garder pour plus tard.
- **Effort** : B1 à B3 : M (nouvel opérateur `÷`, générateurs inverses des tables, deux animations).

## 5. Voie C — Additions et soustractions étendues (priorité 3)

Paliers alignés sur les attendus CE2, du plus simple au plus difficile :

| Étape | Palier | Exemple | Astuce |
|---|---|---|---|
| C1 | Compléments à 10 et à 100 | 7 + ? = 10 ; 64 + ? = 100 | |
| C2 | Dizaines entières | 30 + 40 ; 80 − 50 | « 3 dizaines + 4 dizaines » |
| C3 | 2 chiffres ± 1 chiffre sans puis avec retenue | 47 + 8 ; 52 − 7 | passer par la dizaine (47 + 3 + 5) |
| C4 | Somme < 100 | 38 + 45 | décomposer (38 + 40 + 5) |
| C5 | Soustraction à 2 chiffres | 83 − 27 | enlever 30 puis rajouter 3 |
| C6 | Centaines / milliers entiers | 468 − 30 ; 8 756 − 5 000 ; 3 204 + 70 | |
| C7 | Grands nombres (3–4 chiffres) | 1 375 − 376 | compensation : 1 375 − 400 + 24 ; **défi** facultatif |

- **Animation** : blocs en base 10 (centaines, dizaines, unités) qui se regroupent / se décomposent.
- **Seuils de rapidité** propres à chaque palier (de 5 s en C1 à 12 s en C7).
- **Effort** : L au total (générateurs paramétrés + animation base 10 + pavé de 4 chiffres).

## 6. Voie D — Multiplier par 10 / 100, doubles et moitiés (priorité 4)

- **×100** (37 × 100) : prolonge ×10 (« deux zéros »), effort S.
- **Doubles et moitiés jusqu'à 100** (attendu CE2), effort S : `double de 35`, `moitié de 70`.

## 7. Ce que ça change dans l'application

| Sujet | Aujourd'hui | À prévoir |
|---|---|---|
| Pavé numérique | 3 chiffres | 4 à 5 chiffres (voie C), saisie quotient + reste (B4) |
| Seuil de rapidité | un seul (5 s) pour toutes | un seuil **par compétence** (`maxAvgMs` dans chaque entrée de `SKILLS`) |
| Catalogue | 5 compétences écrites à la main | générateurs **paramétrés** (fabriques `makeTable(n)`, `makeDivision(n)`, paliers de la voie C) |
| Opérateur | `+ − ×` | `÷` (question, explication, `key`, animation) |
| Animations | blocs, groupes, retrait, paquets de 10 | tableau de points, partage / groupement, base 10 |
| Choix de la compétence | rotation parmi les débloquées | à surveiller : avec 15+ compétences, limiter à **2 ou 3 compétences « en cours »** à la fois (niveau 1) pour éviter l'éparpillement |
| Espace parent | une carte par compétence | cartes **groupées par voie** (Tables, Divisions, Additions/soustractions) |
| Univers | planètes à 10 / 25 / 50 ⭐ | plus de planètes (l'économie d'étoiles doit durer plus longtemps : environ 2 ⭐ par session) |
| Histoire | 8 à 10 chapitres, seuils d'étoiles (`narrative-beta.md`) | associer un chapitre à chaque voie |

## 8. Ordre et calendrier indicatifs

| Lot | Contenu | Taille | Quand |
|---|---|---|---|
| P1 | Voie A : **×3, ×4** (+ générateur par `factor`, seuils par compétence `maxAvgMs`, tableau de points) | M | ✅ **fait** (v0.5.0) |
| P2 | Voie A : ×9, ×6, ×8, ×7, tables mélangées | M | bêta ou 1.0 |
| P3 | Voie B1 : ÷2, ÷5, ÷10 (opérateur `÷`, partage/groupement) | M | 1.0 ou 1.1 |
| P4 | Voie B2–B3 : ÷3 à ÷9 | S | 1.1 |
| P5 | Voie C1–C5 (compléments, dizaines, retenue, < 100) | L | 1.1 |
| P6 | Voie D (×100, doubles/moitiés) | S | 1.1 |
| P7 | Voie C6–C7 (centaines, milliers, grands nombres), division avec reste (B4) | L | 1.2 |

## 9. Questions à trancher

1. **Tables avant la 1.0 ?** Le CE2 attend les tables 2 à 9 : je recommande P1 (×3, ×4) dans la bêta, P2 avant la 1.0.
2. **Ordre des tables** : 3, 4, 9, 6, 8, 7 (astuces) te convient-il, ou l'ordre classique 3, 4, 6, 7, 8, 9 ?
3. **Division avec reste** (B4) : dans le périmètre, ou après la 1.0 ?
4. **Jusqu'où pour les grands nombres** : 1 000 ou 10 000 (attendu CE2) ?
5. **Niveau réel de l'enfant testeur** (Q9) : quelles tables connaît-il déjà ? Cela détermine P1.
6. **Calcul posé** (additions et soustractions en colonnes) : confirmé hors périmètre (l'application reste du calcul mental) ?
7. **Plafond de compétences « en cours »** à la fois (2 ou 3) ?
