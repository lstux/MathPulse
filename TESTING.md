# MathPulse — Testing Guide

## Quick Start

### Local Testing
```bash
# Terminal 1: Start a local server
python3 -m http.server 8000

# Terminal 2: Open in browser
# http://localhost:8000/demo.html
```

### Demo Features
- ✅ Home screen (start + parent access)
- ✅ Universe screen (rocket + planets + progress)
- ✅ Discovery phase (animated introduction)
- ✅ Game screen (exercises + feedback)
- ✅ Results screen (stars + summary)
- ✅ Parent dashboard (skill progress)

---

## Test Flows

### Flow 1: First Time User
1. **Home** → Click "JOUER"
2. **Universe** → See rocket on pad, 0 stars
3. **Discovery** (Additions) → See blocks merge animation
4. **Game** (5 questions) → Answer numeric exercises
5. **Results** → See stars earned
6. **Universe** → See rocket advance, new planets unlocked

### Flow 2: Parent Dashboard
1. **Home** → Click "Espace Parent"
2. **Dashboard** → See skill progress + mastery stars
3. → Return to Home

### Flow 3: Multiple Sessions
1. Do Flow 1 completely
2. **Universe** → Click "Démarrer une session" again
3. **Game** → Discovery should NOT appear (cached)
4. Same game flow
5. **Universe** → Rocket should have moved further

---

## Console Tests

Open DevTools (F12) and run:

```javascript
// Check initialization
window.mathpulse.progression.getTotalStars()  // → 0 initially

// Start a session
window.mathpulse.screenManager.startSession()

// Navigate
window.mathpulse.screenManager.show('home')
window.mathpulse.screenManager.show('universe')
window.mathpulse.screenManager.show('parent')

// Check engine
const exercises = window.mathpulse.engine.generateExercise('addition-simple', 5)
console.log(exercises)  // Show 5 exercises with correct answers

// Simulate answering
window.mathpulse.progression.recordAnswer('addition-simple', true, 2500)
window.mathpulse.progression.recordAnswer('addition-simple', true, 2200)
window.mathpulse.progression.getTotalStars()  // → should increase

// Reset
window.mathpulse.progression.reset()
```

---

## Visual Checklist

### Home Screen
- [ ] Title "MathPulse" centered
- [ ] "JOUER" button prominent (blue)
- [ ] "Espace Parent" button secondary (pink)
- [ ] Star counter at bottom

### Universe Screen
- [ ] Rocket emoji 🚀 visible
- [ ] 3 planets (☿️ Venus ♀️ Mars ♂️)
- [ ] Progress bar showing 0/50 stars
- [ ] "Démarrer une session" button
- [ ] Responsive on mobile (stack vertically)

### Discovery (Additions)
- [ ] Title "Regardons comment ça marche ! ✨"
- [ ] 5 blue blocks + 3 purple blocks animated
- [ ] Text "5 et 3 font 8 ensemble !"
- [ ] "▶️ C'est parti !" button

### Game Screen
- [ ] Question "7 + 2 = ?" displayed prominently
- [ ] Blocks animation rendering below
- [ ] Input field for number entry
- [ ] Checkmark button to submit
- [ ] Progress "1/5" visible
- [ ] Star counter (⭐ 0) in top right

### Results Screen
- [ ] Emoji (🎉 if all correct, ✨ otherwise)
- [ ] "Session complète !"
- [ ] "5/5 calculs réussis"
- [ ] Stars earned display (⭐⭐ if 2 stars)
- [ ] "▶️ Suivant" button
- [ ] "🏠 Accueil" button

### Parent Dashboard
- [ ] "📊 Progression" heading
- [ ] "Total: ⭐ X" displayed
- [ ] "Compétences" section
- [ ] Skill cards showing % + mastery stars
- [ ] "⬅️ Retour" button

---

## Performance Targets

- [ ] First paint: < 1s
- [ ] TTI (Time to Interactive): < 2s
- [ ] Animation frame rate: 60fps (smooth)
- [ ] No console errors
- [ ] Responsive at 320px, 768px, 1024px widths

---

## Accessibility Checks

- [ ] Focus visible on buttons (outline/highlight)
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Contrast sufficient (dark text on light, light on dark)
- [ ] High contrast mode active (text readable)
- [ ] Animations can be disabled (prefers-reduced-motion)

---

## Known Limitations (MVP)

- ❌ No sound (optional, for next phase)
- ❌ No custom animations per exercise type yet
- ❌ No export/import of progression data
- ❌ Single-player only (no multi-device sync)
- ❌ No offline sync (data stays local)

---

## Next Steps (Friday)

- [ ] Add Compétence 2 (×2) with duplication animation
- [ ] Add Compétence 3 (×5) with groups animation
- [ ] Mobile polish (touch targets, spacing)
- [ ] PWA install banner
- [ ] Final accessibility audit
