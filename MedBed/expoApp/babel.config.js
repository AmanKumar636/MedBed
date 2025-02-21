// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from', // Updated plugin name
      'react-native-reanimated/plugin'
    ],
  };
};
