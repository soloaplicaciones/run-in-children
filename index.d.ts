export type RunInChildrenInput = {
  basePath: string;
  command: string;
  shell?: string;
  timeoutMs?: number;
  parallel?: boolean;
};

export type ChildCommandResult = {
  name: string;
  path: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
};

export type RunInChildrenResult = {
  basePath: string;
  command: string;
  parallel: boolean;
  total: number;
  results: ChildCommandResult[];
};

export type ShellSpawnConfig = {
  executable: string;
  args: string[];
  useShellOption: string | boolean | undefined;
};

export declare function normalizeBasePath(input: string): string;
export declare function listChildDirectories(basePath: string): { name: string; path: string }[];
export declare function getShellSpawnArgs(shellPath: string, command: string): ShellSpawnConfig;
export declare function resolveShell(shell?: string): string | boolean;
export declare function runInChildren(input: RunInChildrenInput): Promise<RunInChildrenResult>;
