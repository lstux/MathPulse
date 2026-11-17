// MathPulse v2 - Registre des manipulations : outil d'une étape « explore » (missions.js) → modèle + rendu
// Chaque modèle expose done et moves ; chaque rendu appelle onChange(événement, modèle).
// Événements communs : 'complete' (but atteint), 'back' (on défait). Les autres sont propres à l'outil.

const MANIPULATIVES = {
    'ten-frame': { model: s => new TenFrameModel(...s.operands), view: TenFrame },
    'break-ten': { model: s => new BreakTenModel(...s.operands), view: BreakTen },
    'groups':    { model: s => new GroupsModel(...s.operands), view: Groups },
    'share':     { model: s => new ShareModel(...s.operands), view: Share }
};
