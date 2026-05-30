import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const tempDir = join(rootDir, ".tmp");
const tsxCli = join(rootDir, "node_modules", "tsx", "dist", "cli.mjs");

mkdirSync(tempDir, { recursive: true });

const child = spawn(process.execPath, [tsxCli, "watch", "src/server.ts"], {
  cwd: rootDir,
  env: {
    ...process.env,
    TEMP: tempDir,
    TMP: tempDir,
    TMPDIR: tempDir,
  },
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
