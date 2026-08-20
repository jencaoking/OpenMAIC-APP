const GoEngine = require('./core/GoEngine')
const CanvasRenderer = require('./render/CanvasRenderer')
const RandomAI = require('./ai/RandomAI')
const OnlineClient = require('./network/OnlineClient')

class GameController {
  constructor() {
    this.game = new GoEngine(19, 6.5)
    this.renderer = new CanvasRenderer()
    this.ai = new RandomAI()
    this.toast = ''
    this.toastTimer = null
    this.paused = false
    this.screen = 'mode'
    this.mode = ''
    this.humanColor = null
    this.playerColor = null
    this.roomCode = ''
    this.roomStatus = ''
    this.connection = 'idle'
    this.aiTimer = null
    this.online = new OnlineClient({
      onConnection: (connected) => { this.connection = connected ? 'connected' : 'idle'; this.render() },
      onError: (message) => this.showToast(message),
      onRoomIdentity: (identity) => { this.roomCode = identity.roomCode; this.playerColor = identity.color === 'black' ? this.game.BLACK : this.game.WHITE; this.screen = 'game'; this.render() },
      onRoomState: (message) => this.applyRemoteRoom(message),
    })
  }

  start() { this.render() }
  resume() { this.paused = false; if (this.mode === 'online') this.online.reconnect(); this.render() }
  pause() { this.paused = true }

  viewState() {
    const online = this.mode === 'online'
    const canAct = this.screen === 'game' && !this.game.isOver && (!online ? (this.mode !== 'ai' || this.game.currentPlayer === this.humanColor) : (this.roomStatus === 'active' && this.game.currentPlayer === this.playerColor))
    return { screen: this.screen, mode: this.mode, humanColor: this.humanColor, roomCode: this.roomCode, connection: this.connection, waiting: online && this.roomStatus === 'waiting', canAct, canUndo: online ? this.game.moveNumber > 1 : this.game.history.length > 0 }
  }

  render() { if (!this.paused) this.renderer.draw(this.game, this.toast, this.viewState()) }

  showToast(message) {
    this.toast = message
    if (this.toastTimer) clearTimeout(this.toastTimer)
    this.render()
    this.toastTimer = setTimeout(() => { this.toast = ''; this.render() }, 1600)
  }

  enterModeMenu() {
    if (this.aiTimer) clearTimeout(this.aiTimer)
    if (this.mode === 'online') this.online.disconnect()
    this.mode = ''; this.screen = 'mode'; this.roomCode = ''; this.roomStatus = ''; this.playerColor = null; this.humanColor = null; this.game.newGame(); this.render()
  }

  startLocal() { this.mode = 'local'; this.screen = 'game'; this.game.newGame(); this.showToast('本地双人开始，黑方先行') }
  selectAiColor() { this.screen = 'color'; this.render() }
  startAi(color) { this.mode = 'ai'; this.screen = 'game'; this.humanColor = color; this.game.newGame(); this.render(); if (color === this.game.WHITE) this.scheduleAi() }
  selectOnline() { this.mode = 'online'; this.screen = 'room'; this.connection = 'connecting'; this.online.connect(); this.render() }

  createOnlineRoom() { this.connection = 'connecting'; if (this.online.connect()) this.online.createRoom('玩家') }
  joinOnlineRoom() {
    if (!wx.showModal) return this.showToast('当前基础库不支持输入房间号')
    wx.showModal({ title: '加入房间', editable: true, placeholderText: '请输入 6 位房间号', success: (result) => { if (result.confirm) { const code = String(result.content || '').trim(); if (!/^\d{6}$/.test(code)) return this.showToast('房间号必须为 6 位数字'); this.connection = 'connecting'; if (this.online.connect()) { const savedToken = wx.getStorageSync && wx.getStorageSync(`go_reconnect_${code}`); if (savedToken) { this.online.roomCode = code; this.online.reconnectToken = savedToken; this.online.reconnect() } else { this.online.joinRoom(code, '玩家') } } } } })
  }

  applyRemoteRoom(message) {
    this.roomCode = message.room.code
    this.roomStatus = message.room.status
    this.playerColor = message.yourColor === 'black' ? this.game.BLACK : this.game.WHITE
    this.game.hydrate(message.room.game)
    this.screen = 'game'
    if (message.event && message.event.message) this.toast = message.event.message
    this.render()
  }

  handleTouch(x, y) {
    if (this.paused) return
    const hit = this.renderer.hitTest(x, y, this.screen)
    if (!hit) return
    if (hit.type === 'button') return this.handleButton(hit.id)
    if (hit.type === 'board') this.handleBoard(hit.row, hit.col)
  }

  handleBoard(row, col) {
    const view = this.viewState()
    if (!view.canAct) return this.showToast(this.mode === 'online' ? '等待对方落子或加入房间' : '正在等待 AI 落子')
    if (this.mode === 'online') return this.online.gameAction({ kind: 'play', row, col })
    const outcome = this.game.play(row, col)
    if (!outcome.ok) return this.showToast(outcome.message)
    this.toast = outcome.captured ? `提掉 ${outcome.captured} 子` : ''; this.render(); if (this.toast) this.showToast(this.toast)
    if (this.mode === 'ai') this.scheduleAi()
  }

  scheduleAi() {
    if (this.aiTimer) clearTimeout(this.aiTimer)
    this.aiTimer = setTimeout(() => {
      if (this.mode !== 'ai' || this.game.isOver || this.game.currentPlayer === this.humanColor) return
      const move = this.ai.chooseMove(this.game)
      const outcome = move ? this.game.play(move.row, move.col) : this.game.pass()
      this.toast = outcome.captured ? `AI 提掉 ${outcome.captured} 子` : 'AI 已落子'
      this.render()
    }, 420)
  }

  handleButton(id) {
    if (id === 'mode-local') return this.startLocal()
    if (id === 'mode-ai') return this.selectAiColor()
    if (id === 'mode-online') return this.selectOnline()
    if (id === 'color-black') return this.startAi(this.game.BLACK)
    if (id === 'color-white') return this.startAi(this.game.WHITE)
    if (id === 'online-create') return this.createOnlineRoom()
    if (id === 'online-join') return this.joinOnlineRoom()
    if (id === 'back-mode' || id === 'new') return this.enterModeMenu()
    if (id === 'undo') return this.applyAction({ kind: 'undo' })
    if (id === 'pass') return this.applyAction({ kind: 'pass' })
    if (id === 'resign') return this.applyAction({ kind: 'resign' })
  }

  applyAction(action) {
    if (this.mode === 'online') return this.online.gameAction(action)
    let outcome
    if (action.kind === 'undo') outcome = this.game.undo()
    if (action.kind === 'pass') outcome = this.game.pass()
    if (action.kind === 'resign') outcome = this.game.resign()
    if (!outcome.ok) return this.showToast(outcome.message)
    this.toast = outcome.message || ''; this.render(); if (this.mode === 'ai' && action.kind !== 'undo' && !this.game.isOver) this.scheduleAi()
  }
}

module.exports = GameController
