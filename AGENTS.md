# Instrucciones para Agentes de `run-in-children`

## Estructura del Repositorio

Paquete único ESM con CLI y API programática.
- `index.js` - exportaciones del módulo principal (lógica central)
- `cli.js` - punto de entrada CLI usando `runInChildren`
- `index.d.ts` - definiciones TypeScript

## Comandos

```bash
# Verificar que la CLI funciona
npm run smoke

# Verificación en seco de publicación
npm run pack:dry

# Ejecutar comando en directorios hijos
run-in-children ./refs "pwd"
```

## Restricciones Clave

- Solo ESM (`"type": "module"`)
- Shebang CLI: `#!/usr/bin/env node`
- Sin pruebas, linting o CI configurados
- Definiciones TypeScript son manuales (index.d.ts, no generadas)

## Uso de la API

```js
import { runInChildren } from "run-in-children";
const result = await runInChildren({
  basePath: "./refs",
  command: "pwd",
  parallel: false,
});
```

## Flujo de Publicación

Antes de publicar: `npm run smoke` → `npm run pack:dry`

Luego: `npm login` → `npm publish`

Mantén completos los campos de `package.json` si agregas repositorio público: `repository`, `homepage`, `bugs`, `author`