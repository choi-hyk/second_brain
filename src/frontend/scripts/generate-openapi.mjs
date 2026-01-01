import { spawn } from "node:child_process";

const url = process.env.OPENAPI_URL || "http://localhost:8000/openapi.json";
const outFile = process.env.OPENAPI_OUT || "src/api/openapi.ts";
const timeoutMs = Number(process.env.OPENAPI_TIMEOUT_MS || 3000);

async function canFetch(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(target, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

if (!(await canFetch(url))) {
  console.warn(`[openapi] Skipping generation; ${url} not reachable.`);
  process.exit(0);
}

const npmExecPath = process.env.npm_execpath;
let child;

if (npmExecPath) {
  // Use the same npm that invoked this script for cross-platform reliability.
  child = spawn(process.execPath, [npmExecPath, "exec", "--", "openapi-typescript", url, "-o", outFile], {
    stdio: "inherit",
  });
} else {
  const npxCmd = process.platform === "win32" ? "npx" : "npx";
  child = spawn(npxCmd, ["openapi-typescript", url, "-o", outFile], { stdio: "inherit", shell: true });
}

child.on("exit", (code) => process.exit(code ?? 1));
