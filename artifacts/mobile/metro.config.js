const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// In a pnpm workspace, explicitly list only the directories Metro needs to watch.
// Do NOT pass the workspace root itself — that causes Metro's FallbackWatcher to
// recursively walk into other artifacts (e.g. artifacts/dashboard/node_modules/.vite/)
// which contain volatile Vite temp directories (deps_temp_*) that Vite creates and
// deletes rapidly. When Metro tries to call fs.watch() on one of these paths after
// Vite has already deleted it, the watcher crashes with ENOENT.
config.watchFolders = [
  path.join(workspaceRoot, "lib"),            // shared workspace packages (api-client-react etc.)
  path.join(workspaceRoot, "node_modules"),   // pnpm workspace node_modules
];

// Block other artifact directories, Vite internals, AND pnpm temp directories
// (pnpm creates _tmp_NNNN directories during installs that may not exist at watch time)
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wr = escape(workspaceRoot);

config.resolver.blockList = [
  new RegExp(`${wr}/artifacts/(?!mobile)[^/]+/.*`),
  // Block pnpm's volatile temp directories (e.g. @clerk/shared_tmp_4068)
  /node_modules\/\.pnpm\/.*_tmp_\d+/,
  /node_modules\/@[^/]+\/[^/]+_tmp_\d+/,
];

module.exports = config;
