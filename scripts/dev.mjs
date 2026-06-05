import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const viteArgs = process.argv.slice(2);

const processes = [
  spawn(npmCommand, ["run", "content"], { stdio: "inherit", shell: true }),
  spawn(npmCommand, ["run", "vite", "--", ...viteArgs], { stdio: "inherit", shell: true }),
];

let isShuttingDown = false;

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(exitCode);
}

for (const child of processes) {
  child.on("exit", (code) => {
    if (!isShuttingDown && code !== 0) {
      shutdown(code ?? 1);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
