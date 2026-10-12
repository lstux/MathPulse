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
| `countdown.mp3` | `mixkit-simple-game-countdown-921.mp3` (coupé à 3,4 s) | Simple game countdown | Série rapide : décompte 3-2-1 |
| `crash.mp3` | **Généré par MathPulse** (synthèse : impact grave, craquement, clang) | — | Intro : le vaisseau s'écrase |
| `intro-fall.mp3` | **Généré par MathPulse** (synthèse : chute en glissando, bruit d'air) | — | Intro : le vaisseau tombe, avant le crash |
| `power-on.mp3` | **Généré par MathPulse** (synthèse : blip montant, écho) | — | Chapitre 3, le premier voyant s'allume |
| `engine-start.mp3` | **Généré par MathPulse** (synthèse : ronronnement grave pulsé, bruit brun) | — | Chapitre 4, les moteurs démarrent |
| `tank-fill.mp3` | **Généré par MathPulse** (synthèse : bulles qui montent et glissando) | — | Chapitre 6, les réservoirs se remplissent |
| `flashlight-click.mp3` | **Généré par MathPulse** (synthèse : deux clics plastiques) | — | Chapitre 13, la lampe de poche (deux éclairs) |
| `cleared.mp3` | `mixkit-positive-notification-951.mp3` | Positive notification | Un calcul qui résistait est acquis |

## Ambiances et applaudissements (histoire)

| Fichier utilisé | Source | Titre Mixkit | Usage |
|---|---|---|---|
| `amb-nature.mp3` | `bank/mixkit-night-crickets-near-the-swamp-1782.mp3` | Night crickets near the swamp | Ambiance forêt (chapitres 1, 2, 13) |
| `amb-ship.mp3` | `bank/mixkit-cinematic-room-tone-loop-3199.mp3` | Cinematic room tone loop | Ambiance vaisseau (chapitres 3 à 10) |
| `applause.mp3` | `bank/mixkit-end-of-show-clapping-crowd-477.mp3` | End of show clapping crowd | Fin de la scène du chapitre 13 |
| `scene-open.mp3` | `bank/mixkit-air-woosh-1489.mp3` | Air woosh | Ouverture d'une scène (coupé à 1 s) |
| `scene-next.mp3` | `bank/mixkit-fast-double-click-on-mouse-275.mp3` | Fast double click on mouse | Vignette suivante |
| `chapter-unlock.mp3` | `bank/mixkit-video-game-treasure-2066.mp3` | Video game treasure | Nouveau chapitre |
| `airlock-close.mp3` | `bank/mixkit-sci-fi-futuristic-door-open-2527.mp3` (silences retirés) | Sci-fi futuristic door open | Chapitre 11, la porte du sas se referme (le fichier s'appelle « door open ») |
| `launch.mp3` | `bank/mixkit-fast-rocket-whoosh-1714.mp3` (coupé à 4 s) | Fast rocket whoosh | Chapitre 11, décollage |
| `landing.mp3` | `bank/mixkit-spaceship-landing-2735.mp3` (coupé à 3 s) | Spaceship landing | Chapitre 13, atterrissage sur la colline |
| `star-tap.mp3` | **Généré par MathPulse** (synthèse : notes désaccordées, réverbération courte) | — | Toucher une étoile de la carte du ciel |
| `lamp-on.mp3` | **Généré par MathPulse** (synthèse : deux notes désaccordées, brillance, écho) | — | Intro, la lampe bleue s'allume dans les bois |
| `radio-signal.mp3` | **Généré par MathPulse** (synthèse : grésillement filtré, sept bips, écho léger) | — | Chapitre 10, le signal de la planète de la lapine |
| `beacon-ping.mp3` | **Généré par MathPulse** (synthèse : deux pings qui montent, écho) | — | Chapitre 12, la balise envoie le rapport |
| `asteroid-pass.mp3` | **Généré par MathPulse** (bruit rose filtré, fondu long) | — | Chapitre 12, un astéroïde frôle le hublot |
| `amb-space.mp3` | **Généré par MathPulse** (synthèse : trois notes graves et un souffle, sans échantillon externe) | — | Ambiance espace (chapitres 11 et 12) |

`amb-space.mp3` n'a pas de source externe : il a été fabriqué pour ce projet, il n'y a donc pas de licence tierce à mentionner.

## Sons disponibles mais non utilisés

`bank/` contient aussi : correct-answer-tone-2870, correct-positive-notification-957, game-show-wrong-answer-buzz-950, retro-arcade-casino-notification-211. Écartés volontairement (trop agressifs ou mettant la pression).

## Notes techniques

- Volume cible : -18 LUFS (discret) ; le réglage final se fait dans le code.
- Mise en cache hors ligne : par le service worker (`sw.js`).
