# Crédits — Sons MathPulse

Tous les effets sonores viennent de **Mixkit** et sont libres d'utilisation (gratuits, sans attribution obligatoire) sous la **Mixkit License**. Un crédit reste apprécié.

- Site : https://mixkit.co
- Licence : https://mixkit.co/license/

## Organisation

- `bank/` : tous les sons disponibles, réencodés (MP3 mono 96 kbit/s, volume homogène), **sous leur nom Mixkit d'origine** (`mixkit-<titre>-<numéro>.mp3`). Le numéro final permet de retrouver le son sur mixkit.co.
- ce dossier : les sons **utilisés par l'application**, copiés depuis `bank/` sous un **nom court**.
- `encode.sh` : réencode `bank/*.wav` et copie un son choisi (`./encode.sh pick <nom-dans-bank> <nom-court>`). Les WAV d'origine ne sont plus dans le dépôt ; ils sont dans l'historique git (commit `36e1ba6`).

## Sons utilisés (nom d'origine → nom court)

| Fichier utilisé | Source dans `bank/` | Titre Mixkit | Usage |
|---|---|---|---|
| `good.mp3` | `mixkit-correct-answer-notification-947.mp3` | Correct answer notification | Bonne réponse |
| `wrong.mp3` | `mixkit-wrong-answer-fail-notification-946.mp3` | Wrong answer fail notification | Mauvaise réponse (doux, volume bas) |
| `hint.mp3` | `mixkit-game-magic-hint-962.mp3` | Game magic hint | Coup de pouce |
| `start.mp3` | `mixkit-tile-game-reveal-960.mp3` | Tile game reveal | Début de session |
| `stars.mp3` | `mixkit-correct-answer-reward-952.mp3` | Correct answer reward | Fin de session : 1 ou 2⭐ |
| `stars3.mp3` | `mixkit-musical-reveal-961.mp3` | Musical reveal | Fin de session : 3⭐ |
| `planet.mp3` | `mixkit-revealing-bonus-notification-958.mp3` | Revealing bonus notification | Nouvelle planète |
| `fast.mp3` | `mixkit-positive-interface-beep-221.mp3` | Positive interface beep | Série rapide : réponse rapide |
| `cleared.mp3` | `mixkit-positive-notification-951.mp3` | Positive notification | Un calcul qui résistait est acquis |

## Sons disponibles mais non utilisés

`bank/` contient aussi : correct-answer-tone-2870, correct-positive-notification-957, game-show-wrong-answer-buzz-950, wrong-electricity-buzz-955, retro-arcade-casino-notification-211, simple-game-countdown-921. Les buzz, le casino et le compte à rebours sont volontairement écartés (trop agressifs ou mettant la pression).

## Notes techniques

- Volume cible : -18 LUFS (discret) ; le réglage final se fait dans le code.
- Mise en cache hors ligne : par le service worker (`sw.js`).
