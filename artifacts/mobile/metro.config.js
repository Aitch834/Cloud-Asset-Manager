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

// Also block Vite internals and other artifact directories from the resolver
// in case Metro discovers them through symlinks.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wr = escape(workspaceRoot);

config.resolver.blockList = [
  new RegExp(`${wr}/artifacts/(?!mobile)[^/]+/.*`),
];

module.exports = config;
