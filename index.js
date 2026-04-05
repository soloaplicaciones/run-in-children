import { spawn } from "node:child_process";
import { existsSync, realpathSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export function normalizeBasePath(input) {
  const trimmed = input.trim();
  const expanded = expandHome(trimmed);
  const absolute = path.isAbsolute(expanded) ? path.resolve(expanded) : path.resolve(process.cwd(), expanded);

  if (!existsSync(absolute)) {
    throw new Error(`Base directory does not exist: ${input}`);
  }

  const statsPath = realpathSync(absolute);
  return path.normalize(statsPath);
}

export function listChildDirectories(basePath) {
  const normalizedBasePath = normalizeBasePath(basePath);
  const entries = readdirSync(normalizedBasePath, { withFileTypes: true });

  return entries
    .filter((entry) => (entry.isDirectory() || entry.isSymbolicLink()) && !entry.name.startsWith("."))
    .map((entry) => {
      const childPath = path.join(normalizedBasePath, entry.name);
      const normalizedChildPath = existsSync(childPath) ? path.normalize(realpathSync(childPath)) : path.normalize(childPath);
      ensureChildWithinRoot(normalizedBasePath, normalizedChildPath);
      return {
        name: entry.name,
        path: normalizedChildPath,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "es", { sensitivity: "base" }));
}

export function getShellSpawnArgs(shellPath, command) {
  const shellName = path.basename(shellPath).toLowerCase();

  if (shellName.includes("bash") || shellName.includes("zsh") || shellName.includes("fish")) {
    return {
      executable: shellPath,
      args: ["-l", "-c", command],
      useShellOption: false,
    };
  }

  if (shellName === "pwsh" || shellName === "pwsh.exe") {
    return {
      executable: shellPath,
      args: ["-Login", "-Command", command],
      useShellOption: false,
    };
  }

  if (shellName === "powershell" || shellName === "powershell.exe") {
    return {
      executable: shellPath,
      args: ["-Command", command],
      useShellOption: false,
    };
  }

  if (shellName === "cmd" || shellName === "cmd.exe") {
    return {
      executable: shellPath,
      args: ["/c", command],
      useShellOption: false,
    };
  }

  return {
    executable: command,
    args: [],
    useShellOption: shellPath,
  };
}

export function resolveShell(shell) {
  if (shell && shell.trim().length > 0) {
    return shell.trim();
  }

  if (process.platform === "win32") {
    return "powershell.exe";
  }

  return process.env.SHELL || (process.platform === "darwin" ? "/bin/zsh" : "/bin/sh");
}

export async function runInChildren(input) {
  if (input.command.trim().length === 0) {
    throw new Error("Command is required");
  }

  const basePath = normalizeBasePath(input.basePath);
  const children = listChildDirectories(basePath);
  const parallel = input.parallel === true;
  const timeoutMs = input.timeoutMs ?? 30000;
  const shell = resolveShell(input.shell);

  const runner = (child) =>
    executeInChild({
      child,
      command: input.command,
      timeoutMs,
      shell,
    });

  const results = parallel
    ? await Promise.all(children.map((child) => runner(child)))
    : await runSeries(children, runner);

  return {
    basePath,
    command: input.command,
    parallel,
    total: results.length,
    results,
  };
}

async function executeInChild(input) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const shellConfig =
      typeof input.shell === "string"
        ? getShellSpawnArgs(input.shell, input.command)
        : {
            executable: input.command,
            args: [],
            useShellOption: input.shell,
          };

    const childProcess = spawn(shellConfig.executable, shellConfig.args, {
      cwd: input.child.path,
      shell: shellConfig.useShellOption,
      env: {
        ...process.env,
        TERM: "xterm-256color",
      },
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      childProcess.kill();
      reject(new Error(`Timed out while running in ${input.child.name}`));
    }, input.timeoutMs);

    childProcess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    childProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    childProcess.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    childProcess.on("close", (exitCode) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve({
        name: input.child.name,
        path: input.child.path,
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
        durationMs: Date.now() - startedAt,
      });
    });
  });
}

async function runSeries(items, runner) {
  const results = [];
  for (const item of items) {
    results.push(await runner(item));
  }
  return results;
}

function expandHome(input) {
  if (input === "~" || input.startsWith("~/") || input.startsWith("~\\")) {
    return path.join(homedir(), input.slice(1));
  }

  return input;
}

function ensureChildWithinRoot(rootPath, childPath) {
  const normalizedRoot = trimTrailingSeparator(path.normalize(rootPath));
  const normalizedChild = trimTrailingSeparator(path.normalize(childPath));
  const rootForComparison = process.platform === "win32" ? normalizedRoot.toLowerCase() : normalizedRoot;
  const childForComparison = process.platform === "win32" ? normalizedChild.toLowerCase() : normalizedChild;

  if (childForComparison === rootForComparison || childForComparison.startsWith(`${rootForComparison}${path.sep}`)) {
    return;
  }

  throw new Error(`Child directory is outside the allowed root: ${childPath}`);
}

function trimTrailingSeparator(input) {
  if (input.length > 1 && input.endsWith(path.sep)) {
    return input.slice(0, -1);
  }
  return input;
}
