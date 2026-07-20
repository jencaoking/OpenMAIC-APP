const { contextBridge } = require('electron');

// 向渲染进程暴露最小 API（版本信息），保持 contextIsolation 安全边界
contextBridge.exposeInMainWorld('maic', {
  appVersion: require('../../package.json').version,
});
