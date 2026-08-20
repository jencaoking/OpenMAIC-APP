const { getServerUrl, isConfigured } = require('../config/online')

class OnlineClient {
  constructor(handlers = {}) {
    this.handlers = handlers
    this.socketTask = null
    this.connected = false
    this.roomCode = ''
    this.reconnectToken = ''
    this.pendingMessages = []
  }

  connect() {
    const url = getServerUrl()
    if (!isConfigured(url)) {
      this.handlers.onError && this.handlers.onError('请先在 js/config/online.js 填写 WSS 服务地址')
      return false
    }
    if (this.socketTask) return true
    this.socketTask = wx.connectSocket({ url })
    this.socketTask.onOpen(() => {
      this.connected = true
      this.flush()
      this.handlers.onConnection && this.handlers.onConnection(true)
    })
    this.socketTask.onMessage((event) => this.handleMessage(event.data))
    this.socketTask.onError(() => {
      this.handlers.onError && this.handlers.onError('联机服务连接失败')
    })
    this.socketTask.onClose(() => {
      this.connected = false
      this.socketTask = null
      this.handlers.onConnection && this.handlers.onConnection(false)
    })
    return true
  }

  createRoom(displayName = '玩家') {
    this.send({ type: 'create_room', displayName })
  }

  joinRoom(roomCode, displayName = '玩家') {
    this.send({ type: 'join_room', roomCode: String(roomCode).trim(), displayName })
  }

  reconnect() {
    if (this.roomCode && this.reconnectToken) this.send({ type: 'reconnect', roomCode: this.roomCode, reconnectToken: this.reconnectToken })
  }

  gameAction(action) {
    this.send({ type: 'game_action', action })
  }

  send(payload) {
    if (!this.socketTask) {
      if (!this.connect()) return
    }
    if (!this.connected) {
      this.pendingMessages.push(payload)
      return
    }
    this.socketTask.send({ data: JSON.stringify(payload) })
  }

  flush() {
    const messages = this.pendingMessages.splice(0)
    messages.forEach((message) => this.send(message))
  }

  handleMessage(raw) {
    let message
    try {
      message = JSON.parse(raw)
    } catch (error) {
      return
    }
    if (message.type === 'room_created' || message.type === 'room_joined' || message.type === 'room_reconnected') {
      this.roomCode = message.roomCode
      this.reconnectToken = message.reconnectToken
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync(`go_reconnect_${message.roomCode}`, message.reconnectToken)
      }
      this.handlers.onRoomIdentity && this.handlers.onRoomIdentity(message)
      return
    }
    if (message.type === 'room_state') {
      this.handlers.onRoomState && this.handlers.onRoomState(message)
      return
    }
    if (message.type === 'error') {
      this.handlers.onError && this.handlers.onError(message.message || '联机服务返回错误')
    }
  }

  disconnect() {
    if (this.socketTask) this.socketTask.close({})
    this.socketTask = null
    this.connected = false
  }
}

module.exports = OnlineClient
