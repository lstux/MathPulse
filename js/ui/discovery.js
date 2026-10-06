// MathPulse - Écran de découverte (affiché une seule fois par compétence)

const Discovery = {
    content: {
        'addition-simple': {
            title: 'Additionner, c\'est rassembler !',
            visual: () => Animations.blocks(5, 3),
            text: '5 et 3 font 8 ensemble', formula: '5 + 3 = 8'
        },
        'multiply-2': {
            title: 'Doubler, c\'est avoir deux fois pareil !',
            visual: () => Animations.groups(2, 3),
            text: 'Le double de 3, c\'est 6', formula: '3 × 2 = 6'
        },
        'multiply-5': {
            title: 'Des groupes de 5 !',
            visual: () => Animations.groups(3, 5),
            text: '3 groupes de 5, ça fait 15', formula: '3 × 5 = 15'
        }
    },

    create(skillId, onStart) {
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
            <button class="btn-primary btn-large" id="btn-start-game">C'est parti !</button>
        `;
        screen.querySelector('#btn-start-game').addEventListener('click', onStart);
        return screen;
    }
};
