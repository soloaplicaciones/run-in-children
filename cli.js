#!/usr/bin/env node
import { runInChildren } from "./index.js";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await runInChildren(options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function parseArgs(argv) {
  const args = [...argv];
  let parallel = false;
  let timeoutMs;
  let shell;
  const positional = [];

  while (args.length > 0) {
    const current = args.shift();
    if (!current) {
      continue;
    }

    if (current === "--parallel") {
      parallel = true;
      continue;
    }

    if (current === "--timeout") {
      const raw = args.shift();
      const parsed = Number.parseInt(raw ?? "", 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--timeout requiere un número positivo en milisegundos");
      }
      timeoutMs = parsed;
      continue;
    }

    if (current === "--shell") {
      shell = args.shift();
      if (!shell) {
        throw new Error("--shell requiere una ruta o nombre de shell");
      }
      continue;
    }

    positional.push(current);
  }

  if (positional.length < 2) {
    throw new Error("Uso: run-in-children <basePath> <command> [--parallel] [--timeout ms] [--shell shell]");
  }

  const [basePath, ...commandParts] = positional;
  return {
    basePath,
    command: commandParts.join(" "),
    parallel,
    timeoutMs,
    shell,
  };
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "No se pudo ejecutar run-in-children";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
