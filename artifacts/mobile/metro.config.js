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

// Stub out native-only packages when bundling for web so Metro can compile
// without crashing on codegenNativeCommands / native-only imports.
const WEB_STUBS = {
  "react-native-maps": path.join(projectRoot, "mocks/react-native-maps.web.js"),
  "expo-media-library": path.join(projectRoot, "mocks/expo-media-library.web.js"),
  "expo-file-system/legacy": path.join(projectRoot, "mocks/expo-file-system-legacy.web.js"),
  "expo-haptics": path.join(projectRoot, "mocks/expo-haptics.web.js"),
  "expo-sharing": path.join(projectRoot, "mocks/expo-sharing.web.js"),
  "expo-image-picker": path.join(projectRoot, "mocks/expo-image-picker.web.js"),
  "expo-camera": path.join(projectRoot, "mocks/expo-camera.web.js"),
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && WEB_STUBS[moduleName]) {
    return { filePath: WEB_STUBS[moduleName], type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
