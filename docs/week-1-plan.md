# MathPulse — Week 1 Development Plan

**Dates** : 6–10 octobre 2026  
**Status** : In Progress  
**Goal** : MVP Foundation + Compétence Pilote (Additions)

---

## Daily Breakdown

### **MON 06/10 — Archi + Setup** ✅ DONE
- [x] Repo initialized
- [x] PWA setup (manifest.json, sw.js)
- [x] CSS framework (main.css, animations.css, responsive.css)
- [x] Storage.js API (localStorage abstraction)
- [x] Progression.js (mastery tracking)
- [x] Engine.js (exercise generator)
- [x] Session.js (session management)
- [x] Initial commit pushed

### **TUE 07/10 — Engine Core** 
**Objectives** :
- [ ] Complete Engine.generateExercise() for all 3 skills
- [ ] Implement Progression.updateMastery() with 3-star system
- [ ] Add exercise validation (numeric, missing, multiple choice)
- [ ] Create data flow: Exercise → Answer → Score → Progression

**Files to Implement** :
- `js/core/engine.js` — fully typed exercise generation
- `js/core/progression.js` — mastery algorithm (90%+ = 3⭐)
- `js/content/operations.js` — operation templates (min/max ranges)
- `js/utils/random.js` — exercise generators
- `js/utils/math.js` — calculation utils

**Tests** :
- Generate 10 addition exercises, verify answer keys
- Record 5 correct answers, verify mastery goes 1→2
- Record 5 more, verify mastery goes 2→3

### **WED 08/10 — Univers Espace**
**Objectives** :
- [ ] Implement Universe.js (fusée, planètes, étoiles)
- [ ] Rocket animation (takeoff, stage progression)
- [ ] Planet unlock system (10⭐ = Planet 1, 25⭐ = Planet 2, 50⭐ = Planet 3)
- [ ] Star display (collected stars counter)
- [ ] Screen manager (navigation between screens)

**Files to Implement** :
- `js/ui/universe.js` — complete Universe class
- `js/ui/screen.js` — ScreenManager (home, universe, game, result, parent)
- `js/ui/components.js` — reusable buttons, cards, progress bars

**Visuals** :
```
🚀 ← Rocket emoji (start)
🚀 → Planet 1 ← (after 10⭐)
🚀 → Planet 2 ← (after 25⭐)
🚀 → Planet 3 ← (after 50⭐)

⭐ Counter: 12 / 50
```

### **THU 09/10 — Compétence 1 : Additions**
**Objectives** :
- [ ] Discovery phase (animation : blocs Tetris qui s'assemblent)
- [ ] Numeric game (5+3 = ?, input → validate → feedback)
- [ ] Missing game (5 + ? = 9, choix multiple)
- [ ] Feedback system (success animation, error explanation)
- [ ] Session flow (5 questions → results → stars earned)

**Files to Implement** :
- `js/games/numeric.js` — NumericGame class
- `js/games/missing.js` — MissingGame class
- `js/ui/animations.js` — Block assembly animation
- `js/app.js` — integrate full flow

**Test Case** :
```
Discovery: Show 5+3 with blocks merging → "5 and 3 make 8"
Game 1: 7+2 = ? → User: 9 ✓ → Animation: starPop
Game 2: 5+? = 9 → User clicks 4 ✓
...5 questions total
Result: 5/5 correct ⭐ +2 stars
Univers: Rocket advances, Planet 1 appears
```

### **FRI 10/10 — Polish + ×2**
**Objectives** :
- [ ] Mobile responsive (test on 320px, 768px, 1024px)
- [ ] Accessibility (focus states, high contrast, keyboard nav)
- [ ] Performance (no jank, smooth animations)
- [ ] Compétence 2 : ×2 (duplication animation, basic games)

**Files to Polish** :
- `css/responsive.css` — test all breakpoints
- `css/animations.css` — verify 60fps on mobile
- `js/games/multiple.js` — start implementation

**Performance Targets** :
- First paint: < 1s
- TTI: < 2s
- Animation frame rate: 60fps
- PWA install banner: appears

---

## Progress Tracker

| Day | Task | Status | Blocker |
|-----|------|--------|---------|
| Mon 06 | Init + Setup | ✅ | None |
| Tue 07 | Engine Core | ⏳ | — |
| Wed 08 | Univers | ⏳ | TUE complete |
| Thu 09 | Additions | ⏳ | WED complete |
| Fri 10 | Polish | ⏳ | THU complete |

---

## Key Decisions

1. **Mastery Thresholds** (Progression):
   - Level 1: Just seen (any 1 question)
   - Level 2: 70% correct + min 3 questions seen
   - Level 3: 90% correct + min 5 questions + avg time < 3s

2. **Animation Strategy** :
   - Blocks: Tetris-style merge (addition)
   - Groups: Duplicate rows (×2, ×5)
   - 4 patterns total, reused across all skills

3. **Session Length** :
   - Exactly 5 questions per session
   - Auto-end (no "more?" prompt)
   - Show results + stars earned

4. **Error Handling** :
   - Wrong answer → show correct answer + explanation animation
   - Retry: go to next question (error reappears later in session mix)

---

## Definition of Done (MVP)

**Engine** ✓ (all exercises generate + validate)  
**Progression** ✓ (mastery tracks + stars calculate)  
**Univers** ✓ (rocket + planets render + unlock)  
**Additions** ✓ (5 questions → feedback → results)  
**Mobile** ✓ (responsive, no jank, PWA installable)  
**Offline** ✓ (SW caches, works without Internet)

---

## Notes

- Focus on **one compétence pilote** (Additions) → validate flow
- Don't perfectify animations yet (motion > perfection for Week 1)
- Test offline first thing each day
- Commit daily (TUE, WED, THU, FRI)
