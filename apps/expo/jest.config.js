/**
 * @file jest.config.js
 * @description Phase 7.5 Jest 单元测试配置。
 */
const reactNativePreset = require('@react-native/jest-preset');

module.exports = {
  ...reactNativePreset,
  
  testEnvironment: 'node',

  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    ...reactNativePreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@openmaic/storage-types$': '<rootDir>/../../packages/storage-types/src/index.ts',
    '^@openmaic/core-engine$': '<rootDir>/../../packages/@openmaic/core-engine/src/index.ts',
  },

  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer.js',
    ),
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@sentry|@openmaic)/)',
  ],

  setupFiles: ['<rootDir>/__tests__/setup.ts'],

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
