// 准备 Electron 打包所需的 standalone 资源：
// Next 的 standalone 输出不含 .next/static（客户端静态资源）和 public，
// 需手动复制到 .next/standalone 后才能由 Electron 作为本地服务运行。
// 同时复制当前 Node 运行时（node.exe），供打包后用独立 Node 进程运行 Next 服务，
// 避免 @electron/rebuild 对原生模块（canvas 等）进行跨 ABI 重编译。
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const standalone = path.join(root, '.next', 'standalone');
const staticSrc = path.join(root, '.next', 'static');
const publicSrc = path.join(root, 'public');

// Windows 下防病毒/索引服务可能短暂锁定刚写入的文件，导致 EBUSY；同步重试规避。
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function copyFileSyncRetry(src, dest, tries = 8) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      fs.copyFileSync(src, dest);
      return;
    } catch (e) {
      lastErr = e;
      if (e.code === 'EBUSY' && i < tries - 1) {
        sleepSync(250);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFileSyncRetry(s, d);
  }
  return true;
}

if (!fs.existsSync(standalone)) {
  console.error('错误：未找到 .next/standalone，请先运行 `pnpm build` 生成 standalone 构建。');
  process.exit(1);
}

const copiedStatic = copyDir(staticSrc, path.join(standalone, '.next', 'static'));
const copiedPublic = copyDir(publicSrc, path.join(standalone, 'public'));

// 复制当前 Node 运行时（node.exe）到 dist-runtime，打包后由 electron-builder
// 作为 extraResources（runtime/）随附，main.js 用它 spawn 运行 Next 服务。
const runtimeDir = path.join(root, 'dist-runtime');
fs.mkdirSync(runtimeDir, { recursive: true });
const nodeTarget = path.join(runtimeDir, 'node.exe');
let copiedNode = false;
if (process.platform === 'win32' && fs.existsSync(process.execPath)) {
  fs.copyFileSync(process.execPath, nodeTarget);
  copiedNode = true;
}

console.log(
  `Electron 资源准备完成：static=${copiedStatic ? '已复制' : '跳过(不存在)'}, public=${copiedPublic ? '已复制' : '跳过(不存在)'}, node=${copiedNode ? '已复制' : '跳过'}`,
);
