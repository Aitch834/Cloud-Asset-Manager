import { access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredShims = [
  {
    command: "TypeScript compiler",
    relativePath: "node_modules/.bin/tsc",
  },
  {
    command: "Dashboard Vite",
    relativePath: "artifacts/dashboard/node_modules/.bin/vite",
  },
  {
    command: "API Server tsx",
    relativePath: "artifacts/api-server/node_modules/.bin/tsx",
  },
];

async function inspectShim({ command, relativePath }) {
  const shimPath = path.join(workspaceRoot, relativePath);

  try {
    const shim = await stat(shimPath);

    if (!shim.isFile() || shim.size === 0) {
      return `${command}: ${relativePath} is empty or is not a command file`;
    }

    await access(shimPath, constants.X_OK);
    return null;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return `${command}: ${relativePath} is missing`;
    }

    if (error?.code === "EACCES") {
      return `${command}: ${relativePath} is not executable`;
    }

    return `${command}: ${relativePath} could not be checked (${error?.code ?? error?.message})`;
  }
}

const failures = (await Promise.all(requiredShims.map(inspectShim))).filter(Boolean);

if (failures.length > 0) {
  console.error("Workspace command shim check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("\nRestore dependencies with `pnpm install --frozen-lockfile` from the workspace root, then run this check again.");
  process.exitCode = 1;
} else {
  console.log("Workspace command shims are present and executable.");
}