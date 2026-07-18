#!/usr/bin/env node
/**
 * Phase 7.4 semantic-release 钩子脚本。
 *
 * 在 release prepare 阶段被 @semantic-release/exec 调用，
 * 用于同步更新 apps/expo/app.json 的 version 字段与 apps/expo/package.json 的 version 字段。
 *
 * 用法：
 *   node scripts/bump-app-version.mjs <new-version>
 *
 * 例如：
 *   node scripts/bump-app-version.mjs 1.2.0
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const APP_JSON = resolve(ROOT, 'apps/expo/app.json');
const PACKAGE_JSON = resolve(ROOT, 'apps/expo/package.json');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('[bump-app-version] Missing version argument');
  process.exit(1);
}

console.log(`[bump-app-version] Bumping version to ${newVersion}`);

// 1. 更新 app.json 的 version 字段
const appJsonRaw = readFileSync(APP_JSON, 'utf-8');
const appJson = JSON.parse(appJsonRaw);
const previousVersion = appJson.expo.version;
appJson.expo.version = newVersion;

// 同步 buildNumber / versionCode（自动递增逻辑由 EAS 处理，这里仅设置基础版本）
writeFileSync(APP_JSON, JSON.stringify(appJson, null, 2) + '\n', 'utf-8');
console.log(`[bump-app-version] app.json: ${previousVersion} → ${newVersion}`);

// 2. 更新 package.json 的 version 字段
const pkgJsonRaw = readFileSync(PACKAGE_JSON, 'utf-8');
const pkgJson = JSON.parse(pkgJsonRaw);
pkgJson.version = newVersion;
writeFileSync(PACKAGE_JSON, JSON.stringify(pkgJson, null, 2) + '\n', 'utf-8');
console.log(`[bump-app-version] package.json updated`);

console.log('[bump-app-version] Done.');
