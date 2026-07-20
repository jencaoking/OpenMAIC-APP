module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'module:metro-react-native-babel-preset',
      '@babel/preset-typescript',
    ],
    plugins: [
      // 必须在 TypeScript 转换之后、其他 class 特性插件之前
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
