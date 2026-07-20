// Windows 打包编排脚本：
// 1) 临时移走根 node_modules 中的 node-canvas —— electron-builder 的 @electron/rebuild
//    会扫描整个项目 node_modules 并尝试把非 N-API 模块（node-canvas）重编译为 Electron
//    的 ABI，但当前 Windows 环境没有 Visual Studio，且项目路径含空格会直接导致 node-gyp
//    失败。而本应用的服务端由随附的 node.exe（Node v24 ABI）运行，canvas 已按该 ABI
//    预编译，根本无需重编译（重编译反而会变成错误的 Electron ABI）。
// 2) 复制 standalone 资源 + node.exe；
// 3) 直接以 node 运行 electron-builder 的 cli.js 打包；
// 4) 无论成败都恢复 node-canvas（用复制方式，规避 pnpm 符号链接下 rename 的问题）。
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const logPath = path.join(root, 'build-win.log');
const log = (m) => {
  fs.appendFileSync(logPath, m + '\n');
};
fs.writeFileSync(logPath, `=== build-win ${new Date().toISOString()} ===\n`);

const targets = [
  path.join(root, 'node_modules', 'canvas'),
  path.join(root, 'node_modules', '.pnpm', 'canvas@3.2.3'),
];
const backups = [];
for (const t of targets) {
  if (fs.existsSync(t)) {
    const bak = `${t}.maic-bak`;
    if (!fs.existsSync(bak)) {
      fs.renameSync(t, bak);
      backups.push([bak, t]);
      log(`临时移走 ${path.relative(root, t)}`);
    }
  }
}

function restore() {
  for (const [bak, t] of backups) {
    try {
      if (fs.existsSync(bak)) {
        if (!fs.existsSync(t)) {
          fs.cpSync(bak, t, { recursive: true });
        }
        fs.rmSync(bak, { recursive: true, force: true });
        log(`恢复 ${path.relative(root, t)}`);
      }
    } catch (e) {
      log(`恢复失败 ${path.relative(root, t)}: ${e}`);
    }
  }
}

const mirror =
  process.env.ELECTRON_BUILDER_BINARIES_MIRROR ||
  'https://npmmirror.com/mirrors/electron-builder-binaries/';
const env = {
  ...process.env,
  ELECTRON_BUILDER_BINARIES_MIRROR: mirror,
  // 公司代理对 HTTPS 做中间人拦截，根 CA 未受 Node 信任，打包工具下载时跳过证书校验
  NODE_TLS_REJECT_UNAUTHORIZED: '0',
};

function run(label, cmd, args) {
  log(`--- ${label}: ${cmd} ${args.join(' ')} ---`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  });
  if (r.stdout) log(r.stdout.toString());
  if (r.stderr) log(r.stderr.toString());
  return r.status;
}

try {
  const s1 = run('prepare', process.execPath, ['scripts/prepare-electron.mjs']);
  if (s1 !== 0) {
    restore();
    process.exit(s1 ?? 1);
  }
  const ebCli = path.join(root, 'node_modules', 'electron-builder', 'cli.js');
  const s2 = run('electron-builder', process.execPath, [
    ebCli,
    '--win',
    '-c',
    'electron-builder.yml',
  ]);
  restore();
  process.exit(s2 ?? 0);
} catch (e) {
  restore();
  log(`异常: ${e}`);
  process.exit(1);
}
