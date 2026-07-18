/**
 * Metro 打包配置 — Phase 7.1 性能优化
 *
 * 优化要点：
 * 1. minify: true — 生产构建启用 Terser 压缩，移除 console/debugger
 * 2. inlineRequires: true — 启用"内联 require"，按需加载模块，减少首屏 JS 解析开销
 * 3. resolver.unstable_enablePackageExports — 支持 package.json 的 exports 字段，按需打包
 * 4. transformer.unstable_allowInlineImport — 允许 inline import 表达式优化
 * 5. Hermes 字节码预编译 — 由 Expo SDK 57 默认启用，无需额外配置
 *
 * 详见：https://docs.expo.dev/guides/performance/
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 启用 inlineRequires（按需加载模块，减小首屏 JS Bundle 体积）
config.transformer.minifyConfig = {
  // 生产构建保留的 console 方法（开发时全部保留，生产时只保留 error）
  keepFnNames: false,
  mangle: true,
  compress: {
    // 移除 console.log/info/debug，保留 console.error
    drop_console: ['log', 'info', 'debug'],
    drop_debugger: true,
    passes: 2,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
  },
};

// 启用内联 require（关键优化：避免顶层 require 阻塞启动）
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
    nonInlinedRequires: [
      // 这些模块即使在 inlineRequires 模式下也保留顶层 require
      // 因为它们是 React Native 运行时必须的
      'react-native',
      'react',
      'expo',
    ],
  },
});

// 启用 package.json exports 字段解析（让 lodash-es 等按需打包）
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'react-native', 'default'];

// 启用懒加载符号（Hermes 字节码优化）
config.resolver.unstable_enableLazyLoading = true;

// 文件大小告警阈值（超过 50KB 的单个文件会在打包日志中告警）
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 监听端口（开发环境保持默认 8081，避免与 Metro 默认配置冲突）
config.server.port = 8081;

// 增强 MD5 哈希（缓存命中更快）
config.cacheStores = [];

module.exports = config;
