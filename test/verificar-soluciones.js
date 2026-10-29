// Comprueba que la solución de cada ejercicio pasa todos sus requisitos
// y que el punto de partida no los pasa por sí solo.
// Uso: node test/verificar-soluciones.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'ejercicios.js'), 'utf8') + '\n;this.EX = EX; this.LEVELS = LEVELS;';
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src, ctx);
const { EX, LEVELS } = ctx;

let fallos = 0;
EX.forEach((e, i) => {
  const n = i + 1;
  let sol;
  try { sol = JSON.parse(e.solucion); }
  catch (err) { console.log(`#${n} ${e.titulo}: la solución no es JSON válido: ${err.message}`); fallos++; return; }

  const malos = e.checks.filter(([, f]) => { try { return !f(sol); } catch (x) { return true; } });
  if (malos.length) { console.log(`#${n} ${e.titulo}: la solución falla:`, malos.map(m => m[0])); fallos++; }

  let pasaInicial = false;
  try {
    const ini = JSON.parse(e.starter);
    pasaInicial = e.checks.every(([, f]) => { try { return f(ini); } catch (x) { return false; } });
  } catch (x) { pasaInicial = false; }
  if (pasaInicial) { console.log(`#${n} ${e.titulo}: el punto de partida ya pasa todo`); fallos++; }
});

console.log(`${EX.length} ejercicios, ${LEVELS.length} niveles, ${fallos} fallos`);
process.exit(fallos ? 1 : 0);
