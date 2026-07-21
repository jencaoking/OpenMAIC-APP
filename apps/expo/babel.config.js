module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // presets 按逆序执行：babel-preset-expo 最后加载，内部已正确处理
      // TypeScript 转换在 class-properties 之前执行
      'babel-preset-expo',
    ],
    plugins: [
      // expo preset 已包含 @babel/plugin-transform-private-methods
      // 如果仍报 "Class private methods are not enabled"，取消下面注释：
      // ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
