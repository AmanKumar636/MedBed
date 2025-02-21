// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: false,
};

config.resolver.sourceExts.push('cjs');

module.exports = config;
