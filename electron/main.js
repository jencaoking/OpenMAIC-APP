const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const net = require('net');
const http = require('http');

let serverProcess = null;
let mainWindow = null;
let serverPort = null;

// 打包后 standalone 服务位于 resources/server，开发时位于 .next/standalone
function getServerDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'server');
  }
  return path.join(app.getAppPath(), '.next', 'standalone');
}

// 极简 .env 解析（避免额外依赖）：仅支持 KEY=VALUE，支持引号包裹
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const text = fs.readFileSync(filePath, 'utf-8');
  const out = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// 依次从 server 目录、exe 目录、项目目录收集 .env.local / .env
function collectEnv() {
  const dirs = [getServerDir(), process.cwd(), app.getAppPath()];
  const env = {};
  for (const dir of dirs) {
    for (const name of ['.env.local', '.env']) {
      Object.assign(env, loadEnvFile(path.join(dir, name)));
    }
  }
  return env;
}

// 优先使用 3000，被占用则回退到随机空闲端口
function getPort(preferred = 3000) {
  return new Promise((resolve, reject) => {
    const tryRandom = () => {
      const s = net.createServer();
      s.once('error', reject);
      s.listen(0, '127.0.0.1', () => {
        const p = s.address().port;
        s.close(() => resolve(p));
      });
    };
    const srv = net.createServer();
    srv.once('error', tryRandom);
    srv.listen(preferred, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
  });
}

function waitForServer(port, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      const req = http.get(
        { host: '127.0.0.1', port, path: '/', timeout: 1500 },
        (res) => {
          res.resume();
          resolve();
        }
      );
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          return reject(new Error('Next 服务启动超时'));
        }
        setTimeout(attempt, 500);
      });
      req.on('timeout', () => req.destroy());
    };
    attempt();
  });
}

async function startServer() {
  const serverDir = getServerDir();
  const serverJs = path.join(serverDir, 'server.js');
  if (!fs.existsSync(serverJs)) {
    dialog.showErrorBox(
      '缺少构建产物',
      `未找到 Next standalone 服务：\n${serverJs}\n\n请先运行 pnpm build 生成 .next/standalone。`
    );
    app.quit();
    return null;
  }
  const port = await getPort();
  const env = {
    ...process.env,
    ...collectEnv(),
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
    NODE_ENV: 'production',
  };
  // 用独立 Node 进程运行服务（打包后用随附的 node.exe，开发时用当前 node），
  // 使原生模块（canvas/sharp/@napi-rs/canvas）以编译时的 ABI 直接加载，无需重编译。
  const nodeExe = app.isPackaged
    ? path.join(process.resourcesPath, 'runtime', 'node.exe')
    : process.execPath;
  serverProcess = spawn(nodeExe, [serverJs], {
    env,
    cwd: serverDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout?.on('data', (d) => process.stdout.write(d));
  serverProcess.stderr?.on('data', (d) => process.stderr.write(d));
  serverProcess.on('exit', (code) => {
    if (code && code !== 0 && !app.isQuitting) {
      dialog.showErrorBox('服务异常退出', `Next 服务进程退出，代码：${code}`);
    }
  });
  await waitForServer(port);
  return port;
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0b0b0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const local = `http://127.0.0.1:${port}`;
    const localL = `http://localhost:${port}`;
    if (url.startsWith(local) || url.startsWith(localL)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    const port = await startServer();
    if (port) {
      serverPort = port;
      createWindow(port);
    }
  } catch (err) {
    dialog.showErrorBox('启动失败', String((err && err.message) || err));
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (serverProcess) serverProcess.kill();
});
