/* Ayudas compartidas por los validadores */
const R = String.raw;
const T = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
const isObj = v => T(v) === 'object';
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const keysOf = v => isObj(v) ? Object.keys(v) : [];
const sameKeys = (v, list) => {
  const k = keysOf(v).sort();
  const l = [...list].sort();
  return k.length === l.length && k.every((x, i) => x === l[i]);
};
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}
const same = (a, b) => canon(a) === canon(b);
const validDate = s => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
};
const validDateTime = s =>
  typeof s === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(s) &&
  !isNaN(Date.parse(s));

const EX = [];

/* ============ NIVEL 1: BASICO ============ */

EX.push({
  nivel: 1,
  titulo: `Tu primer objeto`,
  enunciado: `Un objeto JSON va entre llaves y guarda pares de clave y valor. Escribe uno con tres propiedades: §"nombre"§ (texto), §"edad"§ (número) y §"activo"§ (booleano). Los valores los eliges tú.`,
  starter: R`{

}`,
  pista: `Las claves y los textos llevan comillas dobles. Los números y los booleanos (true y false) se escriben sin comillas.`,
  solucion: R`{
  "nombre": "Lucía",
  "edad": 28,
  "activo": true
}`,
  aprendiste: `Las claves siempre van entre comillas dobles. Los textos también. Los números y los booleanos van sin comillas.`,
  checks: [
    [`La raíz es un objeto`, v => isObj(v)],
    [`Tiene solo las claves nombre, edad y activo`, v => sameKeys(v, ['nombre', 'edad', 'activo'])],
    [`"nombre" es un texto con contenido`, v => isObj(v) && isStr(v.nombre)],
    [`"edad" es un número`, v => isObj(v) && typeof v.edad === 'number'],
    [`"activo" es un booleano`, v => isObj(v) && typeof v.activo === 'boolean'],
  ],
});

EX.push({
  nivel: 1,
  titulo: `Los seis tipos de valor`,
  enunciado: `JSON tiene seis tipos de valor: texto, número, booleano, nulo, arreglo y objeto. Crea un objeto con las claves §"texto"§, §"numero"§, §"booleano"§, §"nulo"§, §"arreglo"§ y §"objeto"§, y que cada una guarde un valor de ese tipo.`,
  starter: R`{

}`,
  pista: `El nulo se escribe null, sin comillas. Un arreglo usa corchetes [ ] y un objeto usa llaves { }. Pueden ir vacíos.`,
  solucion: R`{
  "texto": "hola",
  "numero": 3.14,
  "booleano": false,
  "nulo": null,
  "arreglo": [1, 2, 3],
  "objeto": { "clave": "valor" }
}`,
  aprendiste: `null es un valor explícito, distinto de no tener la clave. Un arreglo es una lista ordenada y un objeto es un conjunto de pares clave y valor.`,
  checks: [
    [`La raíz es un objeto con las seis claves pedidas`, v => sameKeys(v, ['texto', 'numero', 'booleano', 'nulo', 'arreglo', 'objeto'])],
    [`"texto" es un texto`, v => isObj(v) && typeof v.texto === 'string'],
    [`"numero" es un número`, v => isObj(v) && typeof v.numero === 'number'],
    [`"booleano" es true o false`, v => isObj(v) && typeof v.booleano === 'boolean'],
    [`"nulo" es null`, v => isObj(v) && v.nulo === null && 'nulo' in v],
    [`"arreglo" es un arreglo`, v => isObj(v) && Array.isArray(v.arreglo)],
    [`"objeto" es un objeto`, v => isObj(v) && isObj(v.objeto)],
  ],
});

EX.push({
  nivel: 1,
  titulo: `Una lista de lenguajes`,
  enunciado: `Crea un objeto con la clave §"lenguajes"§ que contenga un arreglo con exactamente tres textos distintos.`,
  starter: R`{

}`,
  pista: `Un arreglo se escribe entre corchetes y sus elementos se separan con comas. El último elemento no lleva coma.`,
  solucion: R`{
  "lenguajes": ["JavaScript", "Python", "SQL"]
}`,
  aprendiste: `Los elementos de un arreglo no llevan clave. Se separan con comas y el último no lleva coma final.`,
  checks: [
    [`La raíz es un objeto con la clave "lenguajes"`, v => sameKeys(v, ['lenguajes'])],
    [`"lenguajes" es un arreglo`, v => isObj(v) && Array.isArray(v.lenguajes)],
    [`El arreglo tiene exactamente 3 elementos`, v => isObj(v) && Array.isArray(v.lenguajes) && v.lenguajes.length === 3],
    [`Los 3 elementos son textos con contenido`, v => isObj(v) && Array.isArray(v.lenguajes) && v.lenguajes.length > 0 && v.lenguajes.every(isStr)],
    [`Los 3 textos son distintos entre sí`, v => isObj(v) && Array.isArray(v.lenguajes) && new Set(v.lenguajes).size === v.lenguajes.length && v.lenguajes.length === 3],
  ],
});

EX.push({
  nivel: 1,
  titulo: `Arregla el JSON roto (1)`,
  enunciado: `Este JSON viene de alguien que escribió como si fuera JavaScript o Python. Tiene los errores más típicos: comillas simples, una clave sin comillas, un booleano mal escrito y comas de más. Corrígelo sin cambiar los datos.`,
  starter: R`{
  'nombre': 'Marco',
  edad: 31,
  "premium": True,
  "etiquetas": ["a", "b",],
}`,
  pista: `En JSON solo valen las comillas dobles. Los booleanos van en minúscula (true). Después del último elemento de un objeto o de un arreglo no puede haber coma.`,
  solucion: R`{
  "nombre": "Marco",
  "edad": 31,
  "premium": true,
  "etiquetas": ["a", "b"]
}`,
  aprendiste: `JSON es más estricto que JavaScript: no admite comillas simples, claves sin comillas, True o False con mayúscula, ni comas finales.`,
  checks: [
    [`"nombre" vale "Marco"`, v => isObj(v) && v.nombre === 'Marco'],
    [`"edad" vale 31`, v => isObj(v) && v.edad === 31],
    [`"premium" vale true`, v => isObj(v) && v.premium === true],
    [`"etiquetas" es ["a", "b"]`, v => isObj(v) && same(v.etiquetas, ['a', 'b'])],
    [`No hay propiedades de más ni de menos`, v => sameKeys(v, ['nombre', 'edad', 'premium', 'etiquetas'])],
  ],
});

/* ============ NIVEL 2: INTERMEDIO ============ */

EX.push({
  nivel: 2,
  titulo: `Objetos dentro de objetos`,
  enunciado: `Un valor puede ser otro objeto. Crea un objeto con la clave §"persona"§. Esa persona tiene §"nombre"§ (texto) y §"direccion"§, que es a su vez un objeto con §"ciudad"§ y §"pais"§ (ambos texto).`,
  starter: R`{

}`,
  pista: `Piensa de afuera hacia adentro: raíz, luego "persona", luego "direccion". Cada nivel abre su propia llave y la cierra.`,
  solucion: R`{
  "persona": {
    "nombre": "Camila",
    "direccion": {
      "ciudad": "Arequipa",
      "pais": "Perú"
    }
  }
}`,
  aprendiste: `Anidar objetos permite agrupar datos que van juntos. Para leerlos se encadena el acceso: persona.direccion.ciudad.`,
  checks: [
    [`La raíz tiene solo la clave "persona", y es un objeto`, v => sameKeys(v, ['persona']) && isObj(v.persona)],
    [`"persona" tiene "nombre" (texto) y "direccion"`, v => isObj(v?.persona) && sameKeys(v.persona, ['nombre', 'direccion']) && isStr(v.persona.nombre)],
    [`"direccion" es un objeto`, v => isObj(v?.persona?.direccion)],
    [`"direccion" tiene "ciudad" y "pais" con texto`, v => { const d = v?.persona?.direccion; return sameKeys(d, ['ciudad', 'pais']) && isStr(d.ciudad) && isStr(d.pais); }],
  ],
});

EX.push({
  nivel: 2,
  titulo: `Lista de productos`,
  enunciado: `La raíz de un JSON también puede ser un arreglo. Escribe un arreglo con tres productos. Cada producto es un objeto con §"id"§ (entero), §"nombre"§ (texto) y §"precio"§ (número positivo).`,
  starter: R`[

]`,
  pista: `Dentro de los corchetes van tres objetos separados por comas. Los tres tienen las mismas claves, y cada id debe ser distinto.`,
  solucion: R`[
  { "id": 1, "nombre": "Cuaderno", "precio": 8.5 },
  { "id": 2, "nombre": "Lapicero", "precio": 1.2 },
  { "id": 3, "nombre": "Mochila", "precio": 64 }
]`,
  aprendiste: `Un arreglo de objetos con las mismas claves es la forma habitual de representar una tabla en JSON.`,
  checks: [
    [`La raíz es un arreglo de 3 elementos`, v => Array.isArray(v) && v.length === 3],
    [`Cada elemento tiene solo id, nombre y precio`, v => Array.isArray(v) && v.length > 0 && v.every(p => sameKeys(p, ['id', 'nombre', 'precio']))],
    [`Los id son enteros y no se repiten`, v => Array.isArray(v) && v.length > 0 && v.every(p => Number.isInteger(p?.id)) && new Set(v.map(p => p.id)).size === v.length],
    [`Los nombres son textos con contenido`, v => Array.isArray(v) && v.length > 0 && v.every(p => isStr(p?.nombre))],
    [`Los precios son números mayores que cero`, v => Array.isArray(v) && v.length > 0 && v.every(p => typeof p?.precio === 'number' && p.precio > 0)],
  ],
});

EX.push({
  nivel: 2,
  titulo: `Usuario con roles y perfil`,
  enunciado: `Crea un objeto con la clave §"usuario"§. Debe tener §"email"§ (texto con @), §"roles"§ (arreglo de al menos 2 textos) y §"perfil"§ (objeto con §"tema"§ de tipo texto y §"notificaciones"§ de tipo booleano).`,
  starter: R`{

}`,
  pista: `Aquí se mezclan los tres tipos de estructura: un objeto raíz, un arreglo de textos y un objeto anidado.`,
  solucion: R`{
  "usuario": {
    "email": "diego@ejemplo.com",
    "roles": ["admin", "editor"],
    "perfil": {
      "tema": "oscuro",
      "notificaciones": true
    }
  }
}`,
  aprendiste: `Los datos reales mezclan arreglos y objetos a varios niveles. Lee siempre de afuera hacia adentro y verifica cada cierre.`,
  checks: [
    [`La raíz tiene solo la clave "usuario"`, v => sameKeys(v, ['usuario'])],
    [`"usuario" tiene email, roles y perfil`, v => isObj(v?.usuario) && sameKeys(v.usuario, ['email', 'roles', 'perfil'])],
    [`"email" es un texto que contiene @`, v => typeof v?.usuario?.email === 'string' && v.usuario.email.includes('@')],
    [`"roles" es un arreglo de 2 o más textos`, v => Array.isArray(v?.usuario?.roles) && v.usuario.roles.length >= 2 && v.usuario.roles.every(isStr)],
    [`"perfil" tiene "tema" (texto) y "notificaciones" (booleano)`, v => { const p = v?.usuario?.perfil; return sameKeys(p, ['tema', 'notificaciones']) && isStr(p.tema) && typeof p.notificaciones === 'boolean'; }],
  ],
});

EX.push({
  nivel: 2,
  titulo: `Arregla el JSON roto (2)`,
  enunciado: `Aquí los errores son de estructura: faltan comas y falta un cierre. El motor suele quejarse más abajo del lugar real del problema, así que revisa también las líneas anteriores. Mantén los datos tal cual.`,
  starter: R`{
  "tienda": "Casa Verde"
  "abierto": true,
  "horarios": {
    "lunes": ["09:00", "18:00"],
    "martes": ["09:00", "18:00"
  },
  "telefonos": ["999111222" "999333444"]
}`,
  pista: `Son tres errores: una coma que falta entre dos propiedades, un corchete ] que falta al cerrar el horario del martes, y otra coma que falta entre los dos teléfonos.`,
  solucion: R`{
  "tienda": "Casa Verde",
  "abierto": true,
  "horarios": {
    "lunes": ["09:00", "18:00"],
    "martes": ["09:00", "18:00"]
  },
  "telefonos": ["999111222", "999333444"]
}`,
  aprendiste: `Un cierre que falta rompe todo lo que viene después. Los teléfonos van como texto porque son identificadores: no se suman ni se restan.`,
  checks: [
    [`"tienda" y "abierto" conservan sus valores`, v => isObj(v) && v.tienda === 'Casa Verde' && v.abierto === true],
    [`"horarios.lunes" es ["09:00", "18:00"]`, v => same(v?.horarios?.lunes, ['09:00', '18:00'])],
    [`"horarios.martes" es ["09:00", "18:00"]`, v => same(v?.horarios?.martes, ['09:00', '18:00'])],
    [`"telefonos" tiene los dos números como texto`, v => same(v?.telefonos, ['999111222', '999333444'])],
    [`No hay propiedades de más ni de menos`, v => sameKeys(v, ['tienda', 'abierto', 'horarios', 'telefonos'])],
  ],
});

/* ============ NIVEL 3: PRACTICO ============ */

EX.push({
  nivel: 3,
  titulo: `Respuesta de una API`,
  enunciado: `Escribe la respuesta típica de una API que lista usuarios: un objeto con §"status"§ igual a §"ok"§, §"total"§ con la cantidad de usuarios y §"data"§ con un arreglo de 2 usuarios (cada uno con §"id"§ y §"nombre"§).`,
  starter: R`{

}`,
  pista: `El valor de "total" tiene que coincidir con la cantidad real de elementos en "data". Los dos números deben contar la misma historia.`,
  solucion: R`{
  "status": "ok",
  "total": 2,
  "data": [
    { "id": 101, "nombre": "Ana" },
    { "id": 102, "nombre": "Bruno" }
  ]
}`,
  aprendiste: `Los datos derivados, como total, deben ser coherentes con el resto del documento. Una API que se contradice causa errores difíciles de rastrear.`,
  checks: [
    [`La raíz tiene solo status, total y data`, v => sameKeys(v, ['status', 'total', 'data'])],
    [`"status" es el texto "ok"`, v => isObj(v) && v.status === 'ok'],
    [`"data" es un arreglo de 2 usuarios`, v => isObj(v) && Array.isArray(v.data) && v.data.length === 2],
    [`Cada usuario tiene "id" y "nombre"`, v => isObj(v) && Array.isArray(v.data) && v.data.length > 0 && v.data.every(u => sameKeys(u, ['id', 'nombre']) && isStr(u.nombre) && u.id !== null && typeof u.id !== 'object')],
    [`"total" es un número igual a la cantidad de usuarios`, v => isObj(v) && typeof v.total === 'number' && Array.isArray(v.data) && v.total === v.data.length],
  ],
});

EX.push({
  nivel: 3,
  titulo: `Pedido de una tienda`,
  enunciado: `Crea un pedido con §"pedidoId"§ (texto), §"moneda"§ igual a §"PEN"§, §"items"§ (al menos 2 objetos con §"sku"§ texto, §"cantidad"§ entero y §"precioUnitario"§ número) y §"total"§, que debe ser exactamente la suma de cantidad por precioUnitario de todos los items.`,
  starter: R`{

}`,
  pista: `Calcula el total a mano antes de escribirlo. Por ejemplo, 2 unidades a 10.5 más 1 unidad a 4 da 25.`,
  solucion: R`{
  "pedidoId": "PED-2026-0045",
  "moneda": "PEN",
  "items": [
    { "sku": "CAM-01", "cantidad": 2, "precioUnitario": 49.9 },
    { "sku": "GOR-07", "cantidad": 1, "precioUnitario": 25.5 }
  ],
  "total": 125.3
}`,
  aprendiste: `En sistemas reales de pagos se suele guardar el dinero en centavos, como enteros, para evitar errores de redondeo con decimales.`,
  checks: [
    [`La raíz tiene pedidoId, moneda, items y total`, v => sameKeys(v, ['pedidoId', 'moneda', 'items', 'total'])],
    [`"pedidoId" es un texto y "moneda" es "PEN"`, v => isObj(v) && isStr(v.pedidoId) && v.moneda === 'PEN'],
    [`"items" tiene 2 o más objetos con sku, cantidad y precioUnitario`, v => isObj(v) && Array.isArray(v.items) && v.items.length >= 2 && v.items.every(i => sameKeys(i, ['sku', 'cantidad', 'precioUnitario']))],
    [`"sku" es texto, "cantidad" es entero positivo y "precioUnitario" es número positivo`, v => isObj(v) && Array.isArray(v.items) && v.items.length > 0 && v.items.every(i => isStr(i?.sku) && Number.isInteger(i?.cantidad) && i.cantidad > 0 && typeof i?.precioUnitario === 'number' && i.precioUnitario > 0)],
    [`"total" es la suma exacta de cantidad por precioUnitario`, v => {
      if (!isObj(v) || !Array.isArray(v.items) || typeof v.total !== 'number') return false;
      const suma = v.items.reduce((a, i) => a + (Number(i?.cantidad) || 0) * (Number(i?.precioUnitario) || 0), 0);
      return Math.abs(suma - v.total) < 0.005;
    }],
  ],
});

EX.push({
  nivel: 3,
  titulo: `Configuración de un proyecto`,
  enunciado: `Escribe un package.json mínimo: §"name"§ (minúsculas, números y guiones, sin espacios), §"version"§ con formato 1.0.0 (tres números separados por puntos, como texto), §"scripts"§ con §"start"§ y §"build"§, y §"dependencies"§ (objeto con al menos un paquete y su versión como texto).`,
  starter: R`{

}`,
  pista: `La versión es un texto como "1.0.0", porque 1.0.0 no es un número válido en JSON. En scripts, cada valor es el comando que se ejecuta, también como texto.`,
  solucion: R`{
  "name": "mi-primera-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "build": "vite build"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`,
  aprendiste: `Casi todo proyecto de JavaScript se configura con JSON. Las versiones van como texto porque combinan números y puntos.`,
  checks: [
    [`"name" solo usa minúsculas, números y guiones`, v => isObj(v) && typeof v.name === 'string' && /^[a-z0-9-]+$/.test(v.name)],
    [`"version" tiene formato 1.0.0 y es texto`, v => isObj(v) && typeof v.version === 'string' && /^\d+\.\d+\.\d+$/.test(v.version)],
    [`"scripts" tiene "start" y "build" con texto`, v => isObj(v?.scripts) && isStr(v.scripts.start) && isStr(v.scripts.build)],
    [`"dependencies" es un objeto con al menos un paquete`, v => isObj(v?.dependencies) && Object.keys(v.dependencies).length >= 1],
    [`Cada versión de dependencia es un texto`, v => isObj(v?.dependencies) && Object.keys(v.dependencies).length >= 1 && Object.values(v.dependencies).every(isStr)],
  ],
});

EX.push({
  nivel: 3,
  titulo: `Evento de pago (webhook)`,
  enunciado: `Una pasarela de pagos avisa con un evento cuando se confirma un cobro. Escríbelo con §"evento"§ igual a §"pago.confirmado"§, §"ocurrioEn"§ con fecha y hora ISO 8601 incluyendo zona (por ejemplo 2026-10-28T08:30:00-05:00), §"monto"§ (objeto con §"valor"§ numérico positivo y §"moneda"§ de tres letras mayúsculas) y §"metodo"§ que sea §"tarjeta"§, §"transferencia"§ o §"efectivo"§.`,
  starter: R`{

}`,
  pista: `El formato ISO 8601 es AAAA-MM-DDTHH:MM:SS seguido de la zona: Z para UTC, o un desfase como -05:00. Va entre comillas porque es un texto.`,
  solucion: R`{
  "evento": "pago.confirmado",
  "ocurrioEn": "2026-10-28T08:30:00-05:00",
  "monto": {
    "valor": 125.3,
    "moneda": "PEN"
  },
  "metodo": "tarjeta"
}`,
  aprendiste: `JSON no tiene tipo de fecha. Se usa un texto en formato ISO 8601 con zona horaria, para que cualquier sistema lo interprete igual.`,
  checks: [
    [`La raíz tiene solo evento, ocurrioEn, monto y metodo`, v => sameKeys(v, ['evento', 'ocurrioEn', 'monto', 'metodo'])],
    [`"evento" es "pago.confirmado"`, v => isObj(v) && v.evento === 'pago.confirmado'],
    [`"ocurrioEn" es una fecha y hora ISO 8601 con zona`, v => isObj(v) && validDateTime(v.ocurrioEn)],
    [`"monto" tiene "valor" positivo y "moneda" de 3 letras mayúsculas`, v => { const m = v?.monto; return sameKeys(m, ['valor', 'moneda']) && typeof m.valor === 'number' && m.valor > 0 && /^[A-Z]{3}$/.test(m.moneda); }],
    [`"metodo" es tarjeta, transferencia o efectivo`, v => isObj(v) && ['tarjeta', 'transferencia', 'efectivo'].includes(v.metodo)],
  ],
});

/* ============ NIVEL 4: AVANZADO ============ */

EX.push({
  nivel: 4,
  titulo: `Escapes y Unicode`,
  enunciado: R`Dentro de un texto JSON hay caracteres que no se pueden escribir tal cual. Crea un objeto con la clave §"mensaje"§ cuyo texto, una vez interpretado, contenga una comilla doble (§"§), un salto de línea y una barra invertida (§\§). Escríbelos con sus escapes.`,
  starter: R`{

}`,
  pista: R`Los escapes de JSON empiezan con una barra invertida: \" para la comilla doble, \n para el salto de línea y \\ para la barra invertida. Un salto de línea real dentro del texto rompe el JSON.`,
  solucion: R`{
  "mensaje": "Dijo \"hola\"\nRuta: C:\\datos"
}`,
  aprendiste: R`Dentro de un texto: la comilla doble se escribe \", el salto de línea \n y la barra invertida \\. También existe \uXXXX para cualquier carácter Unicode.`,
  checks: [
    [`La raíz tiene solo la clave "mensaje"`, v => sameKeys(v, ['mensaje'])],
    [`"mensaje" es un texto`, v => isObj(v) && typeof v.mensaje === 'string'],
    [`El texto contiene una comilla doble`, v => isObj(v) && typeof v.mensaje === 'string' && v.mensaje.includes('"')],
    [`El texto contiene un salto de línea`, v => isObj(v) && typeof v.mensaje === 'string' && v.mensaje.includes('\n')],
    [`El texto contiene una barra invertida`, v => isObj(v) && typeof v.mensaje === 'string' && v.mensaje.includes('\\')],
  ],
});

EX.push({
  nivel: 4,
  titulo: `Línea de tiempo ordenada`,
  enunciado: `Crea un objeto con la clave §"eventos"§: un arreglo de al menos 3 objetos. Cada uno tiene §"id"§ (texto único) y §"fecha"§ en formato AAAA-MM-DD. Las fechas deben ir en orden cronológico estricto, de la más antigua a la más reciente, y todas deben existir en el calendario.`,
  starter: R`{

}`,
  pista: `Cuidado con las fechas imposibles como 2026-02-30. El formato AAAA-MM-DD se ordena bien incluso como texto, por eso se usa tanto.`,
  solucion: R`{
  "eventos": [
    { "id": "e1", "fecha": "2026-01-15" },
    { "id": "e2", "fecha": "2026-03-02" },
    { "id": "e3", "fecha": "2026-10-28" }
  ]
}`,
  aprendiste: `El formato ISO 8601 con año primero se ordena igual como texto que como fecha. Por eso es el estándar para intercambiar datos.`,
  checks: [
    [`La raíz tiene solo la clave "eventos"`, v => sameKeys(v, ['eventos'])],
    [`"eventos" es un arreglo de 3 o más objetos con id y fecha`, v => isObj(v) && Array.isArray(v.eventos) && v.eventos.length >= 3 && v.eventos.every(e => sameKeys(e, ['id', 'fecha']))],
    [`Los id son textos distintos`, v => isObj(v) && Array.isArray(v.eventos) && v.eventos.length > 0 && v.eventos.every(e => isStr(e?.id)) && new Set(v.eventos.map(e => e.id)).size === v.eventos.length],
    [`Todas las fechas tienen formato AAAA-MM-DD y existen`, v => isObj(v) && Array.isArray(v.eventos) && v.eventos.length > 0 && v.eventos.every(e => validDate(e?.fecha))],
    [`Las fechas van en orden cronológico estricto`, v => isObj(v) && Array.isArray(v.eventos) && v.eventos.length >= 2 && v.eventos.every(e => validDate(e?.fecha)) && v.eventos.every((e, i, a) => i === 0 || a[i - 1].fecha < e.fecha)],
  ],
});

EX.push({
  nivel: 4,
  titulo: `Relaciones por id`,
  enunciado: `Modela un blog con dos listas en la raíz: §"usuarios"§ (cada uno con §"id"§ y §"nombre"§, al menos 2) y §"publicaciones"§ (cada una con §"id"§, §"titulo"§ y §"autorId"§, al menos 3). Cada §"autorId"§ debe apuntar a un usuario que exista, y al menos un usuario debe tener más de una publicación.`,
  starter: R`{

}`,
  pista: `En lugar de copiar los datos del autor dentro de cada publicación, guardas solo su id. Así el nombre del autor vive en un único lugar.`,
  solucion: R`{
  "usuarios": [
    { "id": 1, "nombre": "Ana" },
    { "id": 2, "nombre": "Bruno" }
  ],
  "publicaciones": [
    { "id": 10, "titulo": "Hola JSON", "autorId": 1 },
    { "id": 11, "titulo": "Esquemas", "autorId": 1 },
    { "id": 12, "titulo": "Relaciones", "autorId": 2 }
  ]
}`,
  aprendiste: `Guardar referencias por id evita duplicar datos. Si el nombre de un autor cambia, se corrige en un solo lugar.`,
  checks: [
    [`La raíz tiene solo "usuarios" y "publicaciones"`, v => sameKeys(v, ['usuarios', 'publicaciones'])],
    [`Hay 2 o más usuarios, cada uno con id y nombre`, v => isObj(v) && Array.isArray(v.usuarios) && v.usuarios.length >= 2 && v.usuarios.every(u => sameKeys(u, ['id', 'nombre']) && isStr(u.nombre))],
    [`Hay 3 o más publicaciones, cada una con id, titulo y autorId`, v => isObj(v) && Array.isArray(v.publicaciones) && v.publicaciones.length >= 3 && v.publicaciones.every(p => sameKeys(p, ['id', 'titulo', 'autorId']) && isStr(p.titulo))],
    [`Los id no se repiten dentro de cada lista`, v => {
      if (!isObj(v) || !Array.isArray(v.usuarios) || !Array.isArray(v.publicaciones)) return false;
      const u = v.usuarios.map(x => x?.id), p = v.publicaciones.map(x => x?.id);
      return u.length > 0 && p.length > 0 && new Set(u).size === u.length && new Set(p).size === p.length;
    }],
    [`Todos los autorId apuntan a un usuario que existe`, v => {
      if (!isObj(v) || !Array.isArray(v.usuarios) || !Array.isArray(v.publicaciones) || v.publicaciones.length === 0) return false;
      const ids = new Set(v.usuarios.map(u => u?.id));
      return v.publicaciones.every(p => ids.has(p?.autorId));
    }],
    [`Al menos un usuario tiene más de una publicación`, v => {
      if (!isObj(v) || !Array.isArray(v.publicaciones)) return false;
      const cuenta = {};
      v.publicaciones.forEach(p => { cuenta[p?.autorId] = (cuenta[p?.autorId] || 0) + 1; });
      return Object.values(cuenta).some(n => n > 1);
    }],
  ],
});

EX.push({
  nivel: 4,
  titulo: `Tu primer esquema JSON`,
  enunciado: `JSON Schema es un JSON que describe cómo debe ser otro JSON. Escribe un esquema para un objeto con §"nombre"§ (texto) y §"edad"§ (entero, mínimo 0). Ambas propiedades son obligatorias y no se permiten propiedades extra.`,
  starter: R`{

}`,
  pista: R`Las palabras clave que necesitas son: type, properties, required, minimum y additionalProperties. "required" es un arreglo con los nombres obligatorios y additionalProperties va en false.`,
  solucion: R`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "nombre": { "type": "string" },
    "edad": { "type": "integer", "minimum": 0 }
  },
  "required": ["nombre", "edad"],
  "additionalProperties": false
}`,
  aprendiste: `Con un esquema se puede validar datos automáticamente, sin escribir código. Es la base de formularios, APIs y configuraciones confiables.`,
  checks: [
    [`El esquema es de tipo "object"`, v => isObj(v) && v.type === 'object'],
    [`"properties.nombre" es de tipo "string"`, v => v?.properties?.nombre?.type === 'string'],
    [`"properties.edad" es de tipo "integer"`, v => v?.properties?.edad?.type === 'integer'],
    [`"edad" tiene "minimum" igual a 0`, v => v?.properties?.edad?.minimum === 0],
    [`"required" incluye "nombre" y "edad"`, v => Array.isArray(v?.required) && v.required.includes('nombre') && v.required.includes('edad')],
    [`"additionalProperties" es false`, v => isObj(v) && v.additionalProperties === false],
  ],
});

/* ============ NIVEL 5: EXPERTO ============ */

EX.push({
  nivel: 5,
  titulo: `Error estándar de API`,
  enunciado: `El estándar RFC 9457 (Problem Details) define cómo devolver errores de una API en JSON. Escribe uno para un recurso no encontrado con §"type"§ (una URL como texto), §"title"§ (texto), §"status"§ igual a 404 como número, §"detail"§ (texto) e §"instance"§ (una ruta que empieza con /).`,
  starter: R`{

}`,
  pista: `"type" identifica la clase de error y suele ser una URL que lo documenta. "instance" identifica este caso concreto, por ejemplo la ruta que se pidió.`,
  solucion: R`{
  "type": "https://api.ejemplo.com/errores/no-encontrado",
  "title": "Recurso no encontrado",
  "status": 404,
  "detail": "No existe un pedido con el id 4821.",
  "instance": "/pedidos/4821"
}`,
  aprendiste: `Un formato de error estándar permite que cualquier cliente entienda tus fallos sin leer documentación aparte.`,
  checks: [
    [`La raíz tiene solo type, title, status, detail e instance`, v => sameKeys(v, ['type', 'title', 'status', 'detail', 'instance'])],
    [`"type" es una URL en texto (http o https)`, v => isObj(v) && typeof v.type === 'string' && /^https?:\/\/\S+$/.test(v.type)],
    [`"status" es el número 404`, v => isObj(v) && v.status === 404],
    [`"title" y "detail" son textos con contenido`, v => isObj(v) && isStr(v.title) && isStr(v.detail)],
    [`"instance" es un texto que empieza con /`, v => isObj(v) && typeof v.instance === 'string' && v.instance.startsWith('/') && v.instance.length > 1],
  ],
});

EX.push({
  nivel: 5,
  titulo: `Esquema con $ref y enum`,
  enunciado: `Escribe un esquema de tipo objeto con la propiedad §"tareas"§, un arreglo cuyos elementos son objetos con §"titulo"§ (texto) y §"prioridad"§. Define en §"$defs"§ un tipo §"prioridad"§ como un enum con §"baja"§, §"media"§ y §"alta"§, y úsalo desde la tarea con §"$ref"§.`,
  starter: R`{

}`,
  pista: R`La referencia se escribe como "$ref": "#/$defs/prioridad". El # significa "este mismo documento" y la ruta baja por $defs hasta prioridad.`,
  solucion: R`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "$defs": {
    "prioridad": { "enum": ["baja", "media", "alta"] }
  },
  "properties": {
    "tareas": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "titulo": { "type": "string" },
          "prioridad": { "$ref": "#/$defs/prioridad" }
        },
        "required": ["titulo"]
      }
    }
  }
}`,
  aprendiste: `$defs y $ref evitan repetir definiciones: defines un tipo una vez y lo reutilizas donde haga falta.`,
  checks: [
    [`El esquema raíz es de tipo "object"`, v => isObj(v) && v.type === 'object'],
    [`"$defs.prioridad" es un enum de baja, media y alta`, v => Array.isArray(v?.$defs?.prioridad?.enum) && same([...v.$defs.prioridad.enum].sort(), ['alta', 'baja', 'media'])],
    [`"properties.tareas" es de tipo "array"`, v => v?.properties?.tareas?.type === 'array'],
    [`Los elementos de "tareas" tienen "titulo" de tipo "string"`, v => v?.properties?.tareas?.items?.properties?.titulo?.type === 'string'],
    [`"prioridad" usa "$ref" apuntando a "#/$defs/prioridad"`, v => v?.properties?.tareas?.items?.properties?.prioridad?.$ref === '#/$defs/prioridad'],
  ],
});

/* Aplicador de JSON Patch (RFC 6902) para validar el ejercicio */
const PATCH_DOC = { nombre: 'Casa Verde', estado: 'borrador', tags: ['nuevo', 'oferta'], precio: 100 };
const PATCH_TARGET = { nombre: 'Casa Verde', estado: 'publicado', tags: ['nuevo', 'oferta', 'destacado'], precios: { lista: 100, oferta: 80 } };

function aplicarPatch(docInicial, ops) {
  let doc = JSON.parse(JSON.stringify(docInicial));
  const partes = p => {
    if (p === '') return [];
    if (p[0] !== '/') throw new Error('puntero invalido');
    return p.slice(1).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  };
  const leer = (ps) => {
    let c = doc;
    for (const k of ps) {
      if (c === null || typeof c !== 'object' || !(k in c)) throw new Error('no existe ' + k);
      c = c[k];
    }
    return c;
  };
  const agregar = (ps, val) => {
    if (ps.length === 0) { doc = val; return; }
    const padre = leer(ps.slice(0, -1));
    const k = ps[ps.length - 1];
    if (Array.isArray(padre)) {
      if (k === '-') padre.push(val);
      else {
        const i = Number(k);
        if (!Number.isInteger(i) || i < 0 || i > padre.length) throw new Error('indice');
        padre.splice(i, 0, val);
      }
    } else if (padre && typeof padre === 'object') padre[k] = val;
    else throw new Error('padre invalido');
  };
  const quitar = (ps) => {
    const padre = leer(ps.slice(0, -1));
    const k = ps[ps.length - 1];
    if (Array.isArray(padre)) {
      const i = Number(k);
      if (!Number.isInteger(i) || i < 0 || i >= padre.length) throw new Error('indice');
      return padre.splice(i, 1)[0];
    }
    if (!(k in padre)) throw new Error('no existe');
    const viejo = padre[k];
    delete padre[k];
    return viejo;
  };
  for (const o of ops) {
    const ps = partes(o.path);
    if (o.op === 'add') agregar(ps, o.value);
    else if (o.op === 'remove') quitar(ps);
    else if (o.op === 'replace') {
      const padre = leer(ps.slice(0, -1));
      const k = ps[ps.length - 1];
      if (!(k in padre)) throw new Error('no existe');
      padre[k] = o.value;
    } else if (o.op === 'move') { const val = quitar(partes(o.from)); agregar(ps, val); }
    else if (o.op === 'copy') { const val = JSON.parse(JSON.stringify(leer(partes(o.from)))); agregar(ps, val); }
    else if (o.op === 'test') { if (!same(leer(ps), o.value)) throw new Error('test fallo'); }
    else throw new Error('operacion desconocida');
  }
  return doc;
}

EX.push({
  nivel: 5,
  titulo: `Parche JSON (RFC 6902)`,
  enunciado: `JSON Patch describe cambios a un documento como una lista de operaciones. Escribe un arreglo de operaciones que convierta el documento original en el documento final. Debes usar §move§ para reubicar §precio§ y el resultado debe ser idéntico al final.`,
  refs: [
    { etiqueta: `Documento original`, codigo: JSON.stringify(PATCH_DOC, null, 2) },
    { etiqueta: `Documento final`, codigo: JSON.stringify(PATCH_TARGET, null, 2) },
  ],
  starter: R`[

]`,
  pista: R`Cada operación es un objeto con "op" y "path". Las rutas usan punteros como /estado o /tags/-. La barra - al final de un arreglo significa "al final". Para mover, usa "from" y "path". Necesitas crear /precios antes de mover algo adentro.`,
  solucion: R`[
  { "op": "replace", "path": "/estado", "value": "publicado" },
  { "op": "add", "path": "/tags/-", "value": "destacado" },
  { "op": "add", "path": "/precios", "value": {} },
  { "op": "move", "from": "/precio", "path": "/precios/lista" },
  { "op": "add", "path": "/precios/oferta", "value": 80 }
]`,
  aprendiste: `JSON Patch permite actualizar partes de un documento sin reenviarlo completo. Las operaciones son add, remove, replace, move, copy y test.`,
  checks: [
    [`Es un arreglo de operaciones con "op" y "path"`, v => Array.isArray(v) && v.length > 0 && v.every(o => isObj(o) && typeof o.op === 'string' && typeof o.path === 'string')],
    [`Todas las operaciones son válidas (add, remove, replace, move, copy, test)`, v => Array.isArray(v) && v.length > 0 && v.every(o => ['add', 'remove', 'replace', 'move', 'copy', 'test'].includes(o?.op))],
    [`Usas "move" con "from" igual a "/precio"`, v => Array.isArray(v) && v.some(o => o?.op === 'move' && o.from === '/precio')],
    [`Al aplicar el parche se obtiene el documento final`, v => { try { return Array.isArray(v) && same(aplicarPatch(PATCH_DOC, v), PATCH_TARGET); } catch (e) { return false; } }],
  ],
});

EX.push({
  nivel: 5,
  titulo: `Depuración final`,
  enunciado: `Este archivo de configuración tiene ocho errores distintos. Corrígelos todos. Donde JSON no permite el valor original, usa esto: §reintentos§ debe valer 3 y §mantenimiento§ debe ser null. El puerto es 8080.`,
  starter: R`{
  "app": "Reservas",
  "version": "2.4.0",
  // configuración de producción
  "servidor": {
    "host": "0.0.0.0",
    "puerto": 08080,
    "https": true
  },
  "origenesPermitidos": [
    "https://app.example.com"
    "https://admin.example.com",
  ],
  "limites": {
    "peticionesPorMinuto": 120,
    "tamanoMaximo": "10MB",
    "reintentos": NaN
  },
  "descripcion": "Servicio de "reservas" en línea",
  'zonaHoraria': "UTC",
  "mantenimiento": undefined
}`,
  pista: `Busca: un comentario, un número con cero a la izquierda, una coma que falta y una coma de más en el arreglo, NaN, comillas sin escapar dentro de un texto, una clave con comillas simples y undefined.`,
  solucion: R`{
  "app": "Reservas",
  "version": "2.4.0",
  "servidor": {
    "host": "0.0.0.0",
    "puerto": 8080,
    "https": true
  },
  "origenesPermitidos": [
    "https://app.example.com",
    "https://admin.example.com"
  ],
  "limites": {
    "peticionesPorMinuto": 120,
    "tamanoMaximo": "10MB",
    "reintentos": 3
  },
  "descripcion": "Servicio de \"reservas\" en línea",
  "zonaHoraria": "UTC",
  "mantenimiento": null
}`,
  aprendiste: `JSON es estricto: no admite comentarios, NaN, undefined ni ceros a la izquierda. Todo lo que no cabe se reemplaza por null o se omite.`,
  checks: [
    [`"app" y "version" conservan sus valores`, v => isObj(v) && v.app === 'Reservas' && v.version === '2.4.0'],
    [`"servidor.puerto" es el número 8080`, v => v?.servidor?.puerto === 8080 && v?.servidor?.host === '0.0.0.0' && v?.servidor?.https === true],
    [`"origenesPermitidos" tiene las dos URLs`, v => same(v?.origenesPermitidos, ['https://app.example.com', 'https://admin.example.com'])],
    [`"limites.reintentos" es 3 y el resto de límites se conserva`, v => v?.limites?.reintentos === 3 && v?.limites?.peticionesPorMinuto === 120 && v?.limites?.tamanoMaximo === '10MB'],
    [`"descripcion" conserva las comillas de "reservas"`, v => isObj(v) && v.descripcion === 'Servicio de "reservas" en línea'],
    [`"zonaHoraria" es "UTC"`, v => isObj(v) && v.zonaHoraria === 'UTC'],
    [`"mantenimiento" es null`, v => isObj(v) && 'mantenimiento' in v && v.mantenimiento === null],
    [`No hay propiedades de más ni de menos`, v => sameKeys(v, ['app', 'version', 'servidor', 'origenesPermitidos', 'limites', 'descripcion', 'zonaHoraria', 'mantenimiento'])],
  ],
});

const LEVELS = [
  { n: 1, nombre: `Básico`, desc: `Sintaxis y tipos` },
  { n: 2, nombre: `Intermedio`, desc: `Anidación y arreglos` },
  { n: 3, nombre: `Práctico`, desc: `Datos de la vida real` },
  { n: 4, nombre: `Avanzado`, desc: `Escapes, fechas, relaciones y esquemas` },
  { n: 5, nombre: `Experto`, desc: `Estándares y depuración` },
];
