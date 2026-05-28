# `run-in-children` Agent Instructions

## Repository Structure

Single ESM package with CLI and programmatic API.
- `index.js` - main module exports (core logic)
- `cli.js` - CLI entry point using `runInChildren`
- `index.d.ts` - TypeScript definitions

## Commands

```bash
# Verify CLI works
npm run smoke

# Dry-run publish check
npm run pack:dry

# Run command in child directories
run-in-children ./refs "pwd"
```

## Key Constraints

- ESM only (`"type": "module"`)
- CLI shebang: `#!/usr/bin/env node`
- No tests, linting, or CI configured
- TypeScript definitions are manual (index.d.ts, not generated)

## API Usage

```js
import { runInChildren } from "run-in-children";
const result = await runInChildren({
  basePath: "./refs",
  command: "pwd",
  parallel: false,
});
```

## Publish Flow

Before publishing: `npm run smoke` → `npm run pack:dry`

Then: `npm login` → `npm publish`

Keep `package.json` fields complete if adding public repo: `repository`, `homepage`, `bugs`, `author`