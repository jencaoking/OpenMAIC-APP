# 在线联机配置说明

本项目的联机客户端通过 `wx.connectSocket` 连接围棋房间服务的 `/ws` 路径。正式微信小游戏只能使用 `wss://` 加密地址，不能使用 `ws://`、`localhost` 或 IP 地址；服务器域名也需要在小游戏后台预先登记。[1] [2]

## 1. 准备服务地址

将联机服务发布到一个具有有效 TLS 证书的域名。若服务根地址为 `https://go.example.com`，则本项目应使用以下 WebSocket 地址：

```text
wss://go.example.com/ws
```

请在 `wechat-go/js/config/online.js` 中替换占位值：

```js
const ONLINE_CONFIG = {
  wssUrl: 'wss://go.example.com/ws',
}
```

在不同测试环境中，也可以在小游戏启动前使用 `wx.setStorageSync('go_wss_url', 'wss://go.example.com/ws')` 覆盖默认地址；该临时配置优先级高于源码内的默认值。

## 2. 配置微信小游戏安全域名

在微信公众平台进入“小游戏后台 → 开发 → 开发设置 → 服务器域名”，在 **Socket 合法域名** 中新增服务域名的 WSS 根地址，例如 `wss://go.example.com`。填写域名时不要追加 `/ws` 路径。

| 检查项 | 生产环境要求 |
|---|---|
| 协议 | 使用 `wss://`，真机小游戏不支持明文 `ws://`。[2] |
| 域名 | 使用已备案的具体子域名；不可填写 IP、localhost 或父域名。[1] |
| 证书 | 使用有效、受系统信任且域名匹配的 TLS 证书；TLS 需支持 1.2 或更高版本。[1] |
| 地址一致性 | 后台登记 `wss://go.example.com` 后，客户端使用 `wss://go.example.com/ws`。 |

开发者工具可临时开启“开发环境不校验请求域名、TLS 版本及 HTTPS 证书”进行联调，但在提交体验版或正式版前必须关闭该选项并在真机验证。[1]

## 3. 联机流程

创建房间的玩家自动成为黑方，并获得一个由服务端生成的 6 位房间号；另一位玩家输入该房间号后成为白方。客户端会将服务端返回的重连凭据保存到本地存储。若短暂断线，重新输入原房间号时客户端会优先尝试带凭据重连，服务端返回完整棋局快照。

## 参考资料

[1] [微信小游戏网络使用说明](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/network)

[2] [微信小游戏 WebSocket 常见问题](https://developers.weixin.qq.com/minigame/dev/guide/game-engine/common-adaptation/Design/FAQ.html)

[3] [wx.connectSocket API](https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.connectSocket.html)
