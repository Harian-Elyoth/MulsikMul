// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Metro to resolve .wasm files as assets (required by expo-sqlite on web)
config.resolver.assetExts.push('wasm');

// Explicitly resolve .wasm imports from node_modules (e.g. expo-sqlite wa-sqlite)
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('.wasm')) {
    const fromDir = path.dirname(context.originModulePath);
    const wasmPath = path.resolve(fromDir, moduleName);
    return { filePath: wasmPath, type: 'asset' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
