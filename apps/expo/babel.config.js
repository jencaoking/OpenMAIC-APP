module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // 第一个执行：TypeScript 转换（处理 declare 字段）
      '@babel/preset-typescript',
      // 第二个执行：Metro 预设（包含 class-properties 等）
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      // 最后执行：private methods（需要 loose:true 匹配 preset）
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
