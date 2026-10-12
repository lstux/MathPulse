// MathPulse - Écran de découverte (affiché une seule fois par compétence)

const Discovery = {
    content: {
        'addition-simple': {
            title: 'Additionner, c\'est rassembler !',
            visual: () => Animations.blocks(5, 3),
            text: '5 et 3 font 8 ensemble', formula: '5 + 3 = 8'
        },
        'subtract-simple': {
            title: 'Soustraire, c\'est enlever !',
            visual: () => Animations.takeAway(8, 3),
            text: '8, on enlève 3 : il en reste 5', formula: '8 − 3 = 5'
        },
        'multiply-10': {
            title: 'Un paquet de 10, deux paquets de 10...',
            visual: () => Animations.tens(3),
            text: '3 paquets de 10, ça fait 30 : on ajoute un zéro !', formula: '3 × 10 = 30'
        },
        'multiply-2': {
            title: 'Doubler, c\'est avoir deux fois pareil !',
            visual: () => Animations.groups(2, 3),
            text: 'Le double de 3, c\'est 6', formula: '3 × 2 = 6'
        },
        'multiply-3': {
            title: 'Les paquets de 3 !',
            visual: () => Animations.table(4, 3),
            text: '4 × 3 : le double de 4 (en bleu) plus encore 4 (en violet)', formula: '4 × 3 = 8 + 4 = 12'
        },
        'multiply-4': {
            title: 'Doubler deux fois !',
            visual: () => Animations.table(3, 4),
            text: '3 × 4 : le double de 3 (en bleu), puis encore le double (en violet)', formula: '3 × 4 = 6 + 6 = 12'
        },
        'complement-10': {
            title: 'Aller jusqu\'à 10 !',
            visual: () => Animations.blocks(7, 3),
            text: '7, et combien pour faire 10 ? Il en manque 3 !', formula: '7 + 3 = 10'
        },
        'tens-add': {
            title: 'Des dizaines, comme des paquets !',
            visual: () => Animations.tensBars(3, 4, 'add'),
            text: '3 dizaines + 4 dizaines = 7 dizaines', formula: '30 + 40 = 70'
        },
        'tens-sub': {
            title: 'Enlever des dizaines !',
            visual: () => Animations.tensBars(8, 5, 'sub'),
            text: '8 dizaines, on en enlève 5 : il en reste 3', formula: '80 − 50 = 30'
        },
        'complement-100': {
            title: 'Aller jusqu\'à 100 !',
            visual: () => Animations.tensBars(6, 4, 'missing'),
            text: '6 dizaines : il en manque 4 (en pointillés) pour faire 10 dizaines', formula: '60 + 40 = 100'
        },
        'add-units': {
            title: 'Passer par la dizaine !',
            visual: () => Animations.jumps([47, 50, 55], ['+3', '+5']),
            text: '47 + 8 : on va jusqu\'à 50, puis on ajoute le reste', formula: '47 + 8 = 47 + 3 + 5 = 55'
        },
        'sub-units': {
            title: 'Descendre à la dizaine !',
            visual: () => Animations.jumps([52, 50, 45], ['−2', '−5']),
            text: '52 − 7 : on descend à 50, puis on enlève encore 5', formula: '52 − 7 = 52 − 2 − 5 = 45'
        },
        'add-2digits': {
            title: 'Les dizaines, puis les unités !',
            visual: () => Animations.jumps([38, 78, 83], ['+40', '+5']),
            text: '38 + 45 : on ajoute 40, puis encore 5', formula: '38 + 45 = 38 + 40 + 5 = 83'
        },
        'sub-2digits': {
            title: 'Enlever par étapes !',
            visual: () => Animations.jumps([83, 63, 56], ['−20', '−7']),
            text: '83 − 27 : on enlève 20, puis encore 7', formula: '83 − 27 = 83 − 20 − 7 = 56'
        },
        'multiply-100': {
            title: 'Cent fois plus !',
            visual: () => Animations.zeros(37, 2),
            text: '37 × 100 : on ajoute deux zéros', formula: '37 × 100 = 3 700'
        },
        'double-100': {
            title: 'Les doubles !',
            visual: () => Animations.piles(35, 'double'),
            text: 'Le double de 35 : 30 + 30 = 60, 5 + 5 = 10, et 60 + 10 = 70', formula: 'double de 35 = 70'
        },
        'half-100': {
            title: 'Les moitiés !',
            visual: () => Animations.piles(35, 'half'),
            text: 'La moitié de 70 : 2 parts égales de 35', formula: 'moitié de 70 = 35'
        },
        'add-round': {
            title: 'Ajouter des dizaines, des centaines…',
            visual: () => Animations.digits(3204, 3274, 1, '+', 7),
            text: '3 204 + 70 : seul le chiffre des dizaines change, de 0 à 7', formula: '3 204 + 70 = 3 274'
        },
        'sub-round': {
            title: 'Enlever des milliers, des centaines…',
            visual: () => Animations.digits(8756, 3756, 3, '−', 5),
            text: '8 756 − 5 000 : seul le chiffre des milliers change, de 8 à 3', formula: '8 756 − 5 000 = 3 756'
        },
        'multiply-6': {
            title: 'Les paquets de 6 !',
            visual: () => Animations.array(4, 6, 5),
            text: '4 × 6 : 4 × 5 (en bleu) plus encore 4 (en violet)', formula: '4 × 6 = 20 + 4 = 24'
        },
        'multiply-7': {
            title: 'Les paquets de 7 !',
            visual: () => Animations.array(4, 7, 5),
            text: '4 × 7 : 4 × 5 (en bleu) plus 4 × 2 (en violet)', formula: '4 × 7 = 20 + 8 = 28'
        },
        'multiply-8': {
            title: 'Les paquets de 8 !',
            visual: () => Animations.array(3, 8, 4),
            text: '3 × 8 : 3 × 4 (en bleu), puis encore autant (en violet)', formula: '3 × 8 = 12 + 12 = 24'
        },
        'multiply-9': {
            title: 'Les paquets de 9 !',
            visual: () => Animations.array(4, 9, 9, true),
            text: '4 × 9 : 4 × 10, moins la colonne en pointillés', formula: '4 × 9 = 40 − 4 = 36'
        },
        'multiply-mix': {
            title: 'On peut échanger !',
            visual: () => Animations.array(3, 7),
            text: '3 lignes de 7, ou 7 lignes de 3 : c\'est pareil !', formula: '3 × 7 = 7 × 3 = 21'
        },
        'divide-2': {
            title: 'Partager en 2 !',
            visual: () => Animations.share(8, 2),
            text: '8 pommes partagées en 2 paniers : 4 dans chaque panier', formula: '8 ÷ 2 = 4'
        },
        'divide-5': {
            title: 'Combien de paquets de 5 ?',
            visual: () => Animations.groups(3, 5),
            text: 'Dans 15, il y a 3 paquets de 5', formula: '15 ÷ 5 = 3'
        },
        'divide-10': {
            title: 'Combien de paquets de 10 ?',
            visual: () => Animations.tens(3),
            text: 'Dans 30, il y a 3 paquets de 10 : on enlève un zéro !', formula: '30 ÷ 10 = 3'
        },
        'multiply-5': {
            title: 'Des groupes de 5 !',
            visual: () => Animations.groups(3, 5),
            text: '3 groupes de 5, ça fait 15', formula: '3 × 5 = 15'
        }
    },

    create(skillId, onStart, label = "C'est parti !") {
        const c = this.content[skillId];
        const screen = document.createElement('div');
        screen.className = 'screen active flex flex-col flex-center gap-lg p-lg';
        screen.innerHTML = `
            <div class="text-center">
                <div class="fox-big" aria-hidden="true">🦊</div>
                <h1 class="text-2xl font-bold mb-lg">${c.title}</h1>
            </div>
            ${c.visual()}
            <div class="text-center mb-lg">
                <p class="text-lg font-bold mb-md">${c.text}</p>
                <p class="formula">${c.formula}</p>
            </div>
            <button class="btn-primary btn-large" id="btn-start-game">${label}</button>
        `;
        screen.querySelector('#btn-start-game').addEventListener('click', onStart);
        return screen;
    }
};

// Divisions ÷3, ÷4, ÷6, ÷7, ÷8, ÷9 : « combien de paquets de n ? » (le lien avec la table de multiplication)
[[3, 4, () => Animations.groups(4, 3)], [4, 3, () => Animations.groups(3, 4)], [6, 4, () => Animations.array(4, 6)],
 [7, 3, () => Animations.array(3, 7)], [8, 3, () => Animations.array(3, 8)], [9, 4, () => Animations.array(4, 9)]].forEach(([n, q, visual]) => {
    Discovery.content[`divide-${n}`] = {
        title: `Combien de paquets de ${n} ?`,
        visual,
        text: `Dans ${n * q}, il y a ${q} paquets de ${n}, car ${q} × ${n} = ${n * q}`,
        formula: `${n * q} ÷ ${n} = ${q}`
    };
});
