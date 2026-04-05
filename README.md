# `run-in-children`

A small utility that walks the child directories of a base folder, runs the same command inside each one, and returns aggregated JSON output.

Repository: [soloaplicaciones/run-in-children](https://github.com/soloaplicaciones/run-in-children)

## What it does

- normalizes the base path
- lists visible child directories
- validates that each child stays inside the base root
- runs a command with `cwd` set to each child directory
- captures `stdout`, `stderr`, `exitCode`, and `durationMs`
- can run in series or in parallel

## Install as a dev dependency

### From npm

```bash
npm install -D run-in-children
```

### From a local path

```bash
npm install -D /path/to/run-in-children
```

If your project lives next to this one:

```bash
npm install -D ../run-in-children
```

## CLI usage

```bash
run-in-children ./refs "pwd"
```

On Windows, for example:

```bash
run-in-children .\refs "Write-Output $PWD.Path"
```

Parallel mode:

```bash
run-in-children ./refs "pwd" --parallel
```

With a custom timeout:

```bash
run-in-children ./refs "pwd" --timeout 10000
```

With an explicit shell:

```bash
run-in-children ./refs "pwd" --shell /bin/bash
```

## Programmatic usage

```js
import { runInChildren } from "run-in-children";

const result = await runInChildren({
  basePath: "./refs",
  command: "pwd",
  parallel: false,
});

console.log(result);
```

## Output format

```json
{
  "basePath": "/base/path",
  "command": "pwd",
  "parallel": false,
  "total": 2,
  "results": [
    {
      "name": "repo-a",
      "path": "/base/path/repo-a",
      "stdout": "/base/path/repo-a\n",
      "stderr": "",
      "exitCode": 0,
      "durationMs": 12
    }
  ]
}
```

## Current limits

This first version does not include yet:

- directory name filters
- configurable concurrency limits
- persistent sessions
- paginated output
- Git-specific logic

## Publishing to npm

Before publishing, it is a good idea to verify the package locally:

```bash
npm run smoke
npm run pack:dry
```

Then:

```bash
npm login
npm publish
```

If you later add a public repository, these `package.json` fields are worth keeping complete:

- `repository`
- `homepage`
- `bugs`
- `author`
