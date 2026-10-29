# Taller de JSON

Página web estática con 20 ejercicios para practicar JSON. No tiene dependencias ni paso de compilación: se abre `index.html` en el navegador o se sirve la carpeta con `npm start`.

Está publicada con GitHub Pages en https://alex-varillas.github.io/taller-json/, desde la raíz de la rama `main`. Cada push a `main` la actualiza. El archivo `.nojekyll` hace que GitHub publique los archivos tal cual.

## Archivos

- `index.html`: estructura de la página y carga de los scripts.
- `style.css`: estilos. Columna enmarcada con líneas finas, un solo acento y etiquetas en monoespaciada, y la paleta de navel-ai.com (acento azul `#4A78DC`). Todos los colores son variables en `:root`. El tema claro es el predeterminado, aunque el sistema esté en oscuro; el oscuro (`:root[data-theme="dark"]`) solo se activa con el botón de la cabecera.
- `ejercicios.js`: los datos. Define `EX` (lista de ejercicios) y `LEVELS` (los 5 niveles), más las funciones auxiliares de los validadores.
- `app.js`: la lógica de la interfaz (editor, validación en vivo, diagnóstico de errores en español, progreso, pistas y soluciones).
- `test/verificar-soluciones.js`: comprueba cada ejercicio. Se ejecuta con `npm test`.
- `docs/`: capturas que usa el README. Si cambia mucho la interfaz, conviene rehacerlas.

## Cómo está hecho un ejercicio

Cada elemento de `EX` tiene:

- `nivel` (1 a 5), `titulo`, `enunciado`, `pista`, `aprendiste`.
- `starter`: texto inicial del editor.
- `solucion`: JSON de referencia, como texto.
- `checks`: lista de pares `[descripción, función]`. La función recibe el JSON ya interpretado y devuelve true o false. Cada par aparece como un requisito con ✓ o ✗.
- `refs` (opcional): bloques de código de apoyo que se muestran sobre el editor.
- En `enunciado`, `pista` y `aprendiste`, el texto entre `§` se muestra como código. Deben ir en pares.

## Reglas al modificar

- Después de añadir o cambiar un ejercicio, ejecuta `npm test`. Exige que la solución pase todos los requisitos y que el punto de partida no los pase todos.
- Los textos de la interfaz están en español. Mantenerlos así.
- No usar rayas largas (el guion largo) en los textos. Usar comas u otra puntuación.
- El progreso y los borradores se guardan en `localStorage` bajo la clave `taller-json-v1`. Si cambias la estructura de `EX` de forma que los id cambien de sentido, cambia esa clave para no mezclar avances viejos. El tema elegido se guarda aparte, bajo `taller-json-tema-v2` (solo cuenta si vale `dark`).
- Los validadores deben comprobar la estructura y el sentido de los datos (por ejemplo, que `total` sea la suma real), no comparar con una respuesta exacta, para aceptar cualquier solución correcta.

## Ideas pendientes

- Más ejercicios de JSON Schema (`oneOf`, `pattern`, `format`).
- Un modo "repaso" que mezcle ejercicios ya resueltos.
- Importar y exportar el progreso como archivo.
