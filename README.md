# `run-in-children`

Ejecutor pequeño para recorrer las carpetas hijas de una carpeta base y ejecutar el mismo comando dentro de cada una, devolviendo una salida JSON agregada.

Repositorio: [soloaplicaciones/run-in-children](https://github.com/soloaplicaciones/run-in-children)

## Qué hace

- normaliza la carpeta base
- lista carpetas hijas visibles
- valida que cada hija permanezca dentro del root base
- ejecuta un comando con `cwd` dentro de cada carpeta hija
- captura `stdout`, `stderr`, `exitCode` y `durationMs`
- puede correr en serie o en paralelo

## Instalación como dependencia de desarrollo

### Desde npm

```bash
npm install -D run-in-children
```

### Desde una ruta local

```bash
npm install -D /ruta/a/run-in-children
```

Si tu proyecto vive junto a este:

```bash
npm install -D ../run-in-children
```

## Uso por CLI

```bash
run-in-children ./refs "pwd"
```

En Windows, por ejemplo:

```bash
run-in-children .\refs "Write-Output $PWD.Path"
```

Modo paralelo:

```bash
run-in-children ./refs "pwd" --parallel
```

Con timeout personalizado:

```bash
run-in-children ./refs "pwd" --timeout 10000
```

Con shell explícita:

```bash
run-in-children ./refs "pwd" --shell /bin/bash
```

## Uso programático

```js
import { runInChildren } from "run-in-children";

const result = await runInChildren({
  basePath: "./refs",
  command: "pwd",
  parallel: false,
});

console.log(result);
```

## Formato de salida

```json
{
  "basePath": "/ruta/base",
  "command": "pwd",
  "parallel": false,
  "total": 2,
  "results": [
    {
      "name": "repo-a",
      "path": "/ruta/base/repo-a",
      "stdout": "/ruta/base/repo-a\n",
      "stderr": "",
      "exitCode": 0,
      "durationMs": 12
    }
  ]
}
```

## Límites actuales

Esta primera versión no incluye todavía:

- filtros por nombre de carpeta
- límite de concurrencia configurable
- sesiones persistentes
- paginación de salida
- lógica específica de Git

## Publicación en npm

Antes de publicar, conviene comprobar el paquete localmente:

```bash
npm run smoke
npm run pack:dry
```

Después:

```bash
npm login
npm publish
```

Si más adelante añades repositorio público, conviene completar en `package.json` los campos:

- `repository`
- `homepage`
- `bugs`
- `author`
