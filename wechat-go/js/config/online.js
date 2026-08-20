const ONLINE_CONFIG = {
  // 发布前替换为已备案并配置到微信小游戏安全域名的 WSS 地址。
  wssUrl: 'wss://YOUR_GO_SERVER_DOMAIN/ws',
}

function isConfigured(url) {
  return /^wss:\/\//.test(url) && !url.includes('YOUR_GO_SERVER_DOMAIN')
}

function getServerUrl() {
  if (typeof wx !== 'undefined' && wx.getStorageSync) {
    const overridden = wx.getStorageSync('go_wss_url')
    if (overridden) return overridden
  }
  return ONLINE_CONFIG.wssUrl
}

module.exports = { ONLINE_CONFIG, getServerUrl, isConfigured }
