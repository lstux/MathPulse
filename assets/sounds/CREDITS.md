# Crédits — Sons MathPulse

## Mixkit License

All sound effects used in MathPulse are sourced from **Mixkit** and are free to use under the **Mixkit License**.

No attribution required, but credit is appreciated.

- **Website** : https://mixkit.co
- **License** : https://mixkit.co/license/
- **Collection** : Game Show & UI sound effects

---

## Sons utilisés

| Fichier | Nom Mixkit | Durée | Usage |
|---------|-----------|-------|-------|
| `mixkit-correct-answer-tone-2870.wav` | Correct answer tone | 0:01 | Réponse juste ✅ |
| `mixkit-wrong-answer-fail-notification-946.wav` | Wrong answer fail notification | 0:01 | Erreur (doux) ❌ |
| `mixkit-correct-answer-reward-952.wav` | Correct answer reward | 0:02 | Étoile gagnée ⭐ |
| `mixkit-positive-interface-beep-221.wav` | Positive interface beep | 0:01 | Déverrouillage 🔓 |
| `mixkit-correct-answer-notification-947.wav` | Correct answer notification | 0:01 | Variante succès |
| `mixkit-game-show-wrong-answer-buzz-950.wav` | Game show wrong answer buzz | 0:01 | Variante erreur |
| `mixkit-positive-notification-951.wav` | Positive notification | 0:02 | Ambiance positive |
| `mixkit-musical-reveal-961.wav` | Musical reveal | 0:03 | Révélation (bonus) |

---

## Notes techniques

- **Format** : WAV (PCM, ~44.1 kHz, mono/stéréo)
- **Volume** : À régler à -6dB à -12dB en code (discret, pas dominant)
- **Offline** : Mis en cache par le service worker (`sw.js`)
- **Licence** : Compatible GPL-3
- **Crédits** : Tous les sons proviennent de Mixkit (https://mixkit.co)

---

## Utilisation dans le code

Les sons essentiels pour le MVP (Option A) :
```js
// À implémenter dans SoundManager
const essentialSounds = {
  success: 'mixkit-correct-answer-tone-2870.wav',
  error: 'mixkit-wrong-answer-fail-notification-946.wav',
  star: 'mixkit-correct-answer-reward-952.wav',
  unlock: 'mixkit-positive-interface-beep-221.wav'
};
```

Les sons bonus (Beta — Option B) :
```js
const bonusSounds = {
  successAlt: 'mixkit-correct-answer-notification-947.wav',
  errorAlt: 'mixkit-game-show-wrong-answer-buzz-950.wav',
  positive: 'mixkit-positive-notification-951.wav',
  reveal: 'mixkit-musical-reveal-961.wav'
};
```

---

**Généré le** : 7 octobre 2026  
**Pour** : MathPulse MVP v0.5
