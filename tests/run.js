// Lance les tests sans dépendance : `node tests/run.js`
// Charge les sources du navigateur dans un contexte isolé avec un localStorage factice.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const sources = ['js/content/skills.js', 'js/core/storage.js', 'js/core/progression.js', 'js/core/engine.js', 'js/core/session.js'];

function makeContext() {
    const store = new Map();
    const localStorage = {
        getItem: k => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: k => store.delete(k),
        clear: () => store.clear()
    };
    const ctx = vm.createContext({ localStorage, console, assert, Date, Math, JSON, Number, String, Set, Array, Object, Error });
    ctx.__store = store;
    return ctx;
}

const results = [];
const tests = [];
const code = sources.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') +
    '\n' + fs.readFileSync(path.join(__dirname, 'engine.test.js'), 'utf8');

const ctx = makeContext();
ctx.test = (name, fn) => tests.push({ name, fn });
ctx.fresh = () => { ctx.__store.clear(); };
vm.runInContext(code, ctx);

let failed = 0;
for (const t of tests) {
    ctx.__store.clear();
    try { t.fn(); console.log(`  ok   ${t.name}`); }
    catch (e) { failed++; console.log(`  FAIL ${t.name}\n       ${e.message}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} tests réussis`);
process.exit(failed ? 1 : 0);
