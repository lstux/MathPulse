# MathPulse — Sons à chercher sur Mixkit (histoire)

_Liste de courses sonore pour l'histoire du renard 🦊 et de la lapine 🐰. Rédigée le 12 octobre 2026. Elle complète [`assets/sounds/CREDITS.md`](../assets/sounds/CREDITS.md), qui décrit les 11 sons déjà utilisés par le jeu._

## État (12 octobre 2026)

- **Reçus et câblés :** `amb-nature`, `amb-ship`, `amb-space` (fabriqué par MathPulse), `applause`, `scene-open`, `scene-next`, `chapter-unlock`, `airlock-close`, `launch`, `landing`.
- **Fabriqués par MathPulse et câblés :** `star-tap`, `beacon-ping`, `asteroid-pass` (synthèse, voir `CREDITS.md`).
- **Abandonné :** `voice-blip` (pas de blip de voix pour l'instant).
- **Priorité 1 : complète.** Priorité 2 et 3 à chercher plus tard.

## Décisions

- **Ambiances activées par défaut**, à volume très bas, **seulement pendant les scènes d'histoire et sur l'écran Univers** (jamais pendant les questions).
- **Un bouton 🔊 facile d'accès** pour tout couper : il sera présent sur les scènes d'histoire et sur l'écran Univers, en plus de celui qui existe déjà. Il coupe ambiances et bruitages ensemble (réglage `sound` des préférences).
- **Pas de voix humaine, pas de mélodie** dans les ambiances : on ne veut rien qui distraie du calcul.

## Comment chercher

1. Va sur <https://mixkit.co/free-sound-effects/> et colle l'expression de la colonne « À chercher » dans la barre de recherche. Les expressions sont en anglais, comme les titres Mixkit.
2. Si rien de bon ne sort, essaie la deuxième expression, ou une catégorie proche (je n'ai pas vérifié les noms exacts des catégories : fie-toi à l'oreille plutôt qu'au titre).
3. Écoute avec un casque, puis sur un téléphone : un bon son doux dans un casque peut être strident sur un petit haut-parleur.
4. Télécharge le fichier et dépose-le dans `assets/sounds/bank/` **sous son nom Mixkit d'origine** (`mixkit-<titre>-<numéro>.wav` ou `.mp3`). Le numéro final permet de retrouver le son pour les crédits.
5. Dis-moi quel fichier correspond à quelle ligne (colonne « Nom court »). Je m'occupe du réencodage (`encode.sh`), du choix, des crédits et du câblage.

Critères valables pour tous les sons : **doux, court, jamais agressif**, pas de bruit soudain et fort, pas de rire ni de voix, durée donnée dans chaque tableau.

---

## Priorité 1 — Indispensables

### Ambiances (boucles)

Une boucle de **20 à 40 secondes** convient. Si le son n'est pas parfaitement bouclable, je gère le fondu de bouclage dans le code.

| Nom court | À quoi il sert | Où | À chercher sur Mixkit | Remarques |
|---|---|---|---|---|
| `amb-nature` | Ambiance de la forêt la nuit | Chapitres 1, 2 et 13 (scènes, écran Univers) | `night forest crickets` · `crickets night` · `soft wind nature` | Grillons discrets, léger vent. Pas d'oiseaux bruyants ni d'animaux qui crient. |
| `amb-ship` | Ambiance à l'intérieur du vaisseau | Chapitres 3 à 10 | `spaceship hum` · `sci fi ambience` · `electronic hum` · `machine room low` | Un bourdonnement grave et régulier, très bas. Rien qui bipe en continu. |
| `amb-space` | Ambiance de l'espace | Chapitres 11 et 12 | `space drone` · `deep space` · `ethereal pad` · `cosmic ambience` | Une nappe lente et calme, sans mélodie. |

### Bruitages d'interface de l'histoire

| Nom court | À quoi il sert | À chercher sur Mixkit | Durée | Remarques |
|---|---|---|---|---|
| `scene-open` | Une scène d'histoire s'ouvre | `soft whoosh` · `whoosh transition` · `swoosh` | 0,4 à 1 s | Doux, qui monte à peine. |
| `scene-next` | On passe à la vignette suivante (bouton « Suite ») | `soft click` · `interface tick` · `light tap` | < 0,3 s | Très discret : il revient souvent. |
| `voice-blip` | Un « blip » à chaque réplique, à la place d'une voix. Un seul fichier : je le joue plus grave pour le 🦊 et plus aigu pour la 🐰 | `cartoon pop` · `short blip` · `bubble pop` · `game blip` | < 0,2 s | Rond et mignon, pas électronique agressif. |
| `chapter-unlock` | Un nouveau chapitre se débloque (remplace `planet.mp3`) | `magical reveal` · `unlock reward` · `star twinkle` · `positive notification` | 1 à 2 s | Joyeux mais pas fanfare. |

### Moments clés

| Nom court | Chapitre et moment | À chercher sur Mixkit | Durée | Remarques |
|---|---|---|---|---|
| `airlock-close` | Ch. 11, la porte du sas se ferme par accident | `airlock door` · `sci fi door close` · `door hiss` | 1 à 2 s | Un « pschitt » mécanique, rien d'effrayant. |
| `launch` | Ch. 11, le vaisseau décolle | `rocket launch` · `rocket whoosh` · `engine takeoff` | 2 à 4 s | Une montée progressive, pas de bruit sec. |
| `landing` | Ch. 13, atterrissage tout doux sur la colline | `soft landing` · `gentle thud` · `engine power down` | 1 à 3 s | Un moteur qui s'éteint doucement. |

---

## Priorité 2 — Pour rendre l'histoire vivante

| Nom court | À quoi il sert | À chercher sur Mixkit | Durée | Remarques |
|---|---|---|---|---|
| `star-tap` | On touche une étoile sur la carte du ciel | `twinkle` · `magic chime` · `sparkle` | < 1 s | Un petit scintillement. |
| `intro-fall` | Intro : le vaisseau tombe, avant le crash existant (`crash.mp3`) | `falling whoosh` · `object falling` · `meteor whoosh` | 1,5 à 2 s | Doit finir avant le crash. |
| `lamp-on` | Intro : la lampe bleue s'allume dans les bois | `power on beep` · `soft power up` · `light switch` | < 1 s | Un petit « ding » doux. |
| `power-on` | Ch. 3, le premier voyant s'allume | `power on` · `electric spark` · `switch on` | < 1 s | Peut ressembler à `lamp-on` : on pourra n'en garder qu'un. |
| `engine-start` | Ch. 4, les moteurs démarrent et se mettent à ronronner | `engine start` · `motor hum` · `machine start up` | 2 à 3 s | Ronronnement, pas de moteur de voiture qui rugit. |
| `tank-fill` | Ch. 6, les réservoirs se remplissent d'énergie | `water filling` · `liquid fill` · `energy charge` · `charging up` | 2 à 3 s | Au choix : liquide qui coule ou énergie qui monte. |
| `radio-signal` | Ch. 10, le signal radio de la planète de la 🐰 | `radio static` · `radio signal` · `morse beeps` · `transmission` | 2 à 4 s | Grésillements légers puis quelques bips. |
| `asteroid-pass` | Ch. 12, un astéroïde frôle le hublot | `fast whoosh` · `pass by whoosh` · `air swoosh` | 0,5 à 1 s | Rapide mais pas violent. |
| `beacon-ping` | Ch. 12, la balise s'allume et envoie le rapport | `sonar ping` · `satellite beep` · `signal sent` | 1 à 2 s | Un « ping » clair qui s'éloigne. |
| `flashlight-click` | Ch. 13, le renard allume la lampe de poche (deux éclairs) | `flashlight click` · `button click` · `switch click` | < 0,3 s | Joué deux fois de suite. |

---

## Priorité 3 — Pour plus tard

| Nom court | À quoi il sert | À chercher sur Mixkit | Durée |
|---|---|---|---|
| `page-turn` | Ch. 7, le carnet de mesures qu'on feuillette | `page turn` · `paper flip` | < 1 s |
| `lights-all-on` | Ch. 9, tous les voyants se rallument | `power up sequence` · `computer boot` · `lights on` | 1 à 2 s |
| `surprise-boing` | Ch. 11, la 🐰 lève les sourcils pour la première fois (l'expression « surprise ») | `cartoon boing` · `surprise sound` · `comic spring` | < 1 s |
| `engine-room` | Ch. 4, variante plus grave de `amb-ship` pour la salle des machines | `machine room` · `engine room ambience` · `industrial hum` | boucle 20 à 40 s |
| `map-open` | On ouvre la carte du ciel | `soft sparkle` · `magic swipe` | < 1 s |
| `story-end` | Fin du chapitre 13, « à suivre… » | `soft chime ending` · `gentle outro` · `calm bell` | 2 à 3 s |

---

## Récapitulatif

| Priorité | Nombre de sons | Poids estimé |
|---|---|---|
| 1 | 10 (3 ambiances, 4 interface, 3 moments clés) | environ 350 Ko |
| 2 | 10 | environ 250 Ko |
| 3 | 6 | environ 150 Ko |

Les 11 sons actuels pèsent environ 270 Ko : avec tout cela, l'appli restera sous 1 Mo de sons, mis en cache hors ligne par le service worker.

## À faire côté code (quand les fichiers seront là)

- Boucles avec fondu d'entrée, de sortie et d'enchaînement dans `sound.js`.
- Champ optionnel `sfx` dans chaque vignette de `chapters.js`, et ambiance choisie d'après le décor.
- Bouton 🔊 sur les scènes d'histoire et sur l'écran Univers.
- Remplacer `planet.mp3` par `chapter-unlock` pour « Nouveau chapitre ».
- Mise à jour de `CREDITS.md`, du service worker et des tests.
