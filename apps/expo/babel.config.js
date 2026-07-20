module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      // 必须第一个执行：TypeScript 转换（处理 declare 字段）
      ['@babel/plugin-transform-typescript', {
        isTSX: true,
        allowNamespaces: true,
        allExtensions: true,
      }],
      // 其次：class 特性（private methods 需要 loose:true 匹配 preset）
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
