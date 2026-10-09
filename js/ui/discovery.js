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
