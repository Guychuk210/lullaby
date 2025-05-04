const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add support for CJS files
defaultConfig.resolver.sourceExts.push('cjs');

// Disable package exports to fix navigation registration issues
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 