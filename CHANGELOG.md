# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [1.0.0] — 2026-11-16

Première version stable.

### Ajouté
- **Import d'une sauvegarde** dans l'espace parent : restaure la progression, l'historique et les préférences depuis un fichier exporté. Le fichier est validé avant toute écriture ; un fichier invalide ou issu d'une version plus récente est refusé sans rien modifier. Test automatique d'aller-retour export / import.
- Note de confidentialité dans le README (aucune donnée ne quitte l'appareil).

### Modifié
- Version portée à 1.0.0 (`package.json`, affichage dans l'espace parent).
- README et plan de la bêta / RC mis à jour (licence GPL-3, contenu réel, état des critères de sortie).

### Depuis le prototype (6 oct. – 1er nov. 2026)
- 34 compétences en 4 parcours : additions et soustractions, tables de ×2 à ×10, calcul malin (×100, doubles, moitiés, arrondis), divisions.
- Pédagogie : explications visuelles animées, erreurs qui reviennent dans les sessions suivantes, rappels des notions déjà vues, maîtrise sur les 20 dernières réponses, coups de pouce limités (2 gratuits par session).
- Série rapide (5 calculs enchaînés) et série libre (l'enfant choisit ses exercices).
- Histoire du renard et de la lapine : 13 chapitres, scènes animées, carte du ciel, illustrations SVG, ambiances et effets sonores (désactivables).
- Espace parent : graphiques par parcours, étoiles par jour, historique, export JSON, réinitialisation.
- PWA : installable, hors ligne, déploiement GitHub Pages après tests (unitaires + navigateur).

### Reporté
Voir la section « Reporté après 1.0 » de [`docs/plan-beta-rc.md`](docs/plan-beta-rc.md).
