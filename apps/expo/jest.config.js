/**
 * @file jest.config.js
 * @description Phase 7.5 Jest 单元测试配置。
 *
 * 覆盖范围：
 * - SyncManager 增量同步逻辑
 * - DeepLinkRouter URL 解析
 * - ImageCompressor 参数边界
 * - VadDetector 静默检测算法
 * - SecureKeyStore 密钥生成
 * - 各工具函数
 */
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',

  // 测试文件位置
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  // 模块解析（与 tsconfig 对齐）
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@openmaic/storage-types$': '<rootDir>/../../packages/storage-types/src/index.ts',
    '^@openmaic/core-engine$': '<rootDir>/../../packages/@openmaic/core-engine/src/index.ts',
  },

  // 转换
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json', isolatedModules: true }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@sentry|@openmaic)/)',
  ],

  // Mock 原生模块
  setupFiles: ['<rootDir>/__tests__/setup.ts'],

  // 覆盖率
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },
};
