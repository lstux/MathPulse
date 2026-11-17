// MathPulse v2 - Catalogue des erreurs typiques, par opération (voir mission/diagnosis.js)
// Chaque entrée : id, match(a, b, réponse, total) → vrai si la réponse correspond à cette erreur,
//   say(a, b)    : la piste d'Andrea (question ou remarque très courte, qui ne donne jamais la réponse),
//   visual(a, b) : facultatif, { fn, args } = fonction de Animations montrant le chemin sans le résultat.
// L'ordre compte : la première entrée qui correspond l'emporte (du plus précis au plus général).

const ErrorHelpers = {
    crossesTen: (a, b) => b < 10 && (a % 10) + b > 10,            // 47 + 8 : on dépasse la dizaine
    borrows: (a, b) => b < 10 && (a % 10) < b,                    // 52 − 7 : il faut passer sous la dizaine
    // Frise « on passe par la dizaine », le résultat reste caché
    addPath: (a, b) => ErrorHelpers.crossesTen(a, b)
        ? { fn: 'jumps', args: [[a, a + 10 - (a % 10), '?'], [`+${10 - (a % 10)}`, `+${b - (10 - (a % 10))}`]] } : null,
    subPath: (a, b) => ErrorHelpers.borrows(a, b)
        ? { fn: 'jumps', args: [[a, a - (a % 10), '?'], [`−${a % 10}`, `−${b - (a % 10)}`]] } : null
};

const ERROR_CATALOG = {
    '+': [
        { id: 'add-concat',        // 47 + 8 = 415 : les unités (15) écrites à la suite des dizaines
          match: (a, b, r) => ErrorHelpers.crossesTen(a, b) && r === Number(`${Math.floor(a / 10)}${(a % 10) + b}`),
          say: (a, b) => `${a % 10} + ${b} = ${(a % 10) + b}, c'est juste ! Mais ${(a % 10) + b}, c'est 1 dizaine et ${(a % 10) + b - 10} unités. Où va la dizaine ?`,
          visual: ErrorHelpers.addPath },
        { id: 'add-forgot-carry',  // 47 + 8 = 45 : la dizaine gagnée est oubliée
          match: (a, b, r, t) => ErrorHelpers.crossesTen(a, b) && r === t - 10,
          say: (a) => `Tes unités sont bonnes ! Mais on dépasse ${a + 10 - (a % 10)} : que devient la dizaine ?`,
          visual: ErrorHelpers.addPath },
        { id: 'add-units-only',    // 47 + 8 = 5 : seules les unités sont données
          match: (a, b, r, t) => t >= 10 && r === t % 10,
          say: () => `Tu as trouvé les unités. Et les dizaines, où sont-elles ?`,
          visual: ErrorHelpers.addPath },
        { id: 'op-subtracted',     // 47 + 8 = 39 : soustraction au lieu d'addition
          match: (a, b, r) => r === Math.abs(a - b),
          say: () => `Regarde bien le signe : ici, on ajoute ou on enlève ?` },
        { id: 'off-by-one',        // 47 + 8 = 54 ou 56 : erreur de comptage
          match: (a, b, r, t) => Math.abs(r - t) === 1,
          say: () => `Tu y es presque, à 1 près ! Refais le dernier saut doucement.`,
          visual: ErrorHelpers.addPath },
        { id: 'off-by-ten',        // 47 + 8 = 65 : unités justes, dizaines fausses
          match: (a, b, r, t) => Math.abs(r - t) === 10,
          say: () => `Tes unités sont bonnes ! Vérifie les dizaines.`,
          visual: ErrorHelpers.addPath }
    ],
    '−': [
        { id: 'sub-swapped',       // 52 − 7 = 55 : « 7 − 2 » au lieu de passer sous la dizaine
          match: (a, b, r) => ErrorHelpers.borrows(a, b) && r === a - (a % 10) + (b - (a % 10)),
          say: (a, b) => `On ne peut pas enlever ${b} à ${a % 10}. Enlève d'abord ${a % 10} pour arriver à ${a - (a % 10)}. Et ensuite ?`,
          visual: ErrorHelpers.subPath },
        { id: 'sub-forgot-borrow', // 52 − 7 = 55 est traité au-dessus ; ici 52 − 7 = 35 ou 55 − ... : dizaine en trop ou en moins
          match: (a, b, r, t) => ErrorHelpers.borrows(a, b) && r === t + 10,
          say: (a) => `Tes unités sont bonnes ! Mais on passe sous ${a - (a % 10)} : que devient la dizaine ?`,
          visual: ErrorHelpers.subPath },
        { id: 'op-added',          // 52 − 7 = 59 : addition au lieu de soustraction
          match: (a, b, r) => r === a + b,
          say: () => `Regarde bien le signe : ici, on ajoute ou on enlève ?` },
        { id: 'off-by-one',
          match: (a, b, r, t) => Math.abs(r - t) === 1,
          say: () => `Tu y es presque, à 1 près ! Refais le dernier saut doucement.`,
          visual: ErrorHelpers.subPath },
        { id: 'off-by-ten',
          match: (a, b, r, t) => Math.abs(r - t) === 10,
          say: () => `Tes unités sont bonnes ! Vérifie les dizaines.`,
          visual: ErrorHelpers.subPath }
    ]
};
