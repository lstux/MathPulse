// MathPulse v2 - Catalogue des erreurs typiques, par opération : + − × ÷ (voir mission/diagnosis.js)
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
        ? { fn: 'jumps', args: [[a, a - (a % 10), '?'], [`−${a % 10}`, `−${b - (a % 10)}`]] } : null,
    // a paquets de b, à compter (petites tables seulement : au-delà, l'image serait illisible sur un téléphone)
    mulGroups: (a, b) => a >= 1 && a <= 10 && b >= 2 && b <= 5 ? { fn: 'groups', args: [a, b, '🔵'] } : null
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
    ],
    '×': [
        { id: 'mul-zeros',         // 37 × 100 = 370 ou 37 : il manque des zéros (ou il y en a trop)
          match: (a, b, r, t) => (b === 10 || b === 100) && (r === a || r === t / 10 || r === t * 10),
          say: (a, b) => `Multiplier par ${b}, ça décale les chiffres ${b === 10 ? "d'un rang" : 'de deux rangs'}. Compte tes zéros.` },
        { id: 'op-added',          // 6 × 7 = 13 : addition au lieu de multiplication
          match: (a, b, r) => r === a + b,
          say: (a, b) => `Regarde bien le signe : ${a} × ${b}, c'est ${a} paquets de ${b}, pas ${a} + ${b}.`,
          visual: ErrorHelpers.mulGroups },
        { id: 'mul-reversed',      // 6 × 7 = 24 : les chiffres de 42 à l'envers
          match: (a, b, r, t) => t >= 10 && t % 11 !== 0 && String(r) === String(t).split('').reverse().join(''),
          say: () => `Regarde bien tes deux chiffres : lequel est la dizaine, lequel est l'unité ?` },
        { id: 'mul-one-group-off', // 6 × 7 = 35 ou 49 : un paquet de trop ou de moins
          match: (a, b, r) => r === (a - 1) * b || r === (a + 1) * b,
          say: (a, b) => `Tu es dans la bonne table, à un paquet près ! Il faut ${a} paquets de ${b}.`,
          visual: ErrorHelpers.mulGroups },
        { id: 'mul-wrong-table',   // 6 × 7 = 36 ou 48 : la table d'à côté
          match: (a, b, r) => a > 1 && (r === a * (b - 1) || r === a * (b + 1)),
          say: (a, b) => `Presque : tu as glissé dans la table d'à côté. Ici, ce sont des paquets de ${b}.`,
          visual: ErrorHelpers.mulGroups },
        { id: 'mul-same-table',    // 6 × 7 = 56 : un autre résultat de la table de 7
          match: (a, b, r) => b > 1 && b <= 10 && r % b === 0 && r / b >= 1 && r / b <= 10,
          say: (a, b) => `Ce nombre est bien dans la table de ${b}, mais pas pour ${a}. Récite-la depuis le début.`,
          visual: ErrorHelpers.mulGroups },
        { id: 'off-by-one',
          match: (a, b, r, t) => Math.abs(r - t) === 1,
          say: () => `Tu y es presque, à 1 près ! Recompte le dernier paquet.`,
          visual: ErrorHelpers.mulGroups }
    ],
    '÷': [
        { id: 'div-zeros',         // 370 ÷ 10 = 370 ou 3 700 : mauvais décalage
          match: (a, b, r, t) => (b === 10 || b === 100) && (r === a || r === t * 10 || r === t / 10 || r === a * b),
          say: (a, b) => `Diviser par ${b}, ça décale les chiffres ${b === 10 ? "d'un rang" : 'de deux rangs'} dans l'autre sens. Compte tes zéros.` },
        { id: 'op-multiplied',     // 42 ÷ 7 = 294 : multiplication au lieu de division
          match: (a, b, r) => r === a * b,
          say: (a, b) => `Regarde bien le signe : ici on partage ${a} en paquets de ${b}. Le résultat est plus petit que ${a}.` },
        { id: 'op-subtracted',     // 42 ÷ 7 = 35 : une seule soustraction
          match: (a, b, r) => r === a - b,
          say: (a, b) => `Tu as enlevé ${b} une seule fois. Combien de fois peut-on enlever ${b} à ${a} ?` },
        { id: 'div-gave-divisor',  // 42 ÷ 7 = 7 : la taille des paquets au lieu de leur nombre
          match: (a, b, r) => r === b,
          say: (a, b) => `${b}, c'est la taille d'un paquet. On cherche combien de paquets il y a.` },
        { id: 'div-one-group-off', // 42 ÷ 7 = 5 ou 7 : un paquet de trop ou de moins
          match: (a, b, r, t) => Math.abs(r - t) === 1,
          say: (a, b) => `À un paquet près ! Vérifie : ton nombre fois ${b}, est-ce que ça fait ${a} ?` }
    ]
};

// Deuxième essai, quand il n'y a pas d'image : un conseil de méthode (qui ne donne pas le résultat)
const ERROR_TIPS = {
    '×': (a, b) => a <= 10 && b <= 10 ? `Compte de ${b} en ${b}, ${a} fois.` : null,
    '÷': (a, b) => b <= 10 && a / b <= 10 ? `Compte de ${b} en ${b} jusqu'à ${a} : combien de pas ?` : null
};
