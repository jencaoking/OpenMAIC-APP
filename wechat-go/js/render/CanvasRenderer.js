class CanvasRenderer {
  constructor() {
    this.canvas = wx.createCanvas()
    this.ctx = this.canvas.getContext('2d')
    const systemInfo = wx.getSystemInfoSync()
    this.width = systemInfo.windowWidth
    this.height = systemInfo.windowHeight
    this.dpr = systemInfo.pixelRatio || 1
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.ctx.scale(this.dpr, this.dpr)
    this.buttons = []
    this.layout = this.createLayout(19)
  }

  createLayout(size) {
    const margin = 22
    const boardWidth = this.width - margin * 2
    const headerHeight = 126
    return { margin, boardX: margin, boardY: headerHeight, boardWidth, cell: boardWidth / (size - 1), controlsY: headerHeight + boardWidth + 30 }
  }

  roundedRect(x, y, width, height, radius) {
    const ctx = this.ctx
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r); ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r); ctx.arcTo(x, y, x + width, y, r); ctx.closePath()
  }

  draw(game, toast, view) {
    const activeView = view || { screen: 'game', mode: 'local', canAct: true, canUndo: true, roomCode: '', waiting: false }
    this.buttons = []
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.drawBackground()
    if (activeView.screen === 'mode') this.drawModeMenu()
    else if (activeView.screen === 'color') this.drawColorMenu()
    else if (activeView.screen === 'room') this.drawRoomMenu(activeView)
    else this.drawGame(game, toast, activeView)
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, '#FCF8F1'); gradient.addColorStop(1, '#F0E3D0')
    this.ctx.fillStyle = gradient; this.ctx.fillRect(0, 0, this.width, this.height)
  }

  drawModeMenu() {
    const ctx = this.ctx
    ctx.fillStyle = '#302A23'; ctx.font = '600 29px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('开始新对局', this.width / 2, 112)
    ctx.fillStyle = '#967554'; ctx.font = '14px sans-serif'; ctx.fillText('选择一种对战模式', this.width / 2, 140)
    const cards = [
      { id: 'mode-local', title: '本地双人', sub: '同屏轮流落子', color: '#7D5634' },
      { id: 'mode-ai', title: '人机对战', sub: '随机 AI 对手', color: '#46675C' },
      { id: 'mode-online', title: '在线联机', sub: '创建或加入房间', color: '#B4644C' },
    ]
    cards.forEach((card, index) => this.drawChoiceCard(26, 176 + index * 104, this.width - 52, 86, card))
    ctx.fillStyle = '#9B7A56'; ctx.font = '12px sans-serif'; ctx.fillText('所有对局均采用 19 路棋盘 · 白方贴 6.5 目', this.width / 2, 510)
  }

  drawColorMenu() {
    const ctx = this.ctx
    ctx.fillStyle = '#302A23'; ctx.font = '600 29px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('选择执子颜色', this.width / 2, 150)
    ctx.fillStyle = '#967554'; ctx.font = '14px sans-serif'; ctx.fillText('AI 将执另一种颜色，黑方先行', this.width / 2, 178)
    this.drawChoiceCard(26, 222, this.width - 52, 86, { id: 'color-black', title: '我执黑', sub: '先手落子', color: '#292522' })
    this.drawChoiceCard(26, 328, this.width - 52, 86, { id: 'color-white', title: '我执白', sub: 'AI 先行', color: '#9A7658' })
    this.drawButton((this.width - 140) / 2, 460, 140, 42, { id: 'back-mode', label: '返回', color: '#A88969' })
  }

  drawRoomMenu(view) {
    const ctx = this.ctx
    ctx.fillStyle = '#302A23'; ctx.font = '600 29px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('在线联机', this.width / 2, 142)
    ctx.fillStyle = '#967554'; ctx.font = '14px sans-serif'; ctx.fillText('通过 6 位房间号邀请好友对弈', this.width / 2, 170)
    this.drawChoiceCard(26, 218, this.width - 52, 86, { id: 'online-create', title: '创建房间', sub: '我执黑，生成 6 位房间号', color: '#7D5634' })
    this.drawChoiceCard(26, 324, this.width - 52, 86, { id: 'online-join', title: '加入房间', sub: '输入好友分享的房间号', color: '#46675C' })
    if (view.connection === 'connecting') { ctx.fillStyle = '#A06D39'; ctx.font = '12px sans-serif'; ctx.fillText('正在连接联机服务…', this.width / 2, 450) }
    this.drawButton((this.width - 140) / 2, 486, 140, 42, { id: 'back-mode', label: '返回', color: '#A88969' })
  }

  drawChoiceCard(x, y, width, height, card) {
    const ctx = this.ctx
    this.roundedRect(x, y, width, height, 15); ctx.fillStyle = '#FFF9F0'; ctx.fill()
    this.roundedRect(x + 14, y + 14, 56, 56, 12); ctx.fillStyle = card.color; ctx.fill()
    ctx.fillStyle = '#FFFFFF'; ctx.font = '600 22px serif'; ctx.textAlign = 'center'; ctx.fillText(card.title.charAt(0), x + 42, y + 51)
    ctx.textAlign = 'left'; ctx.fillStyle = '#443425'; ctx.font = '600 17px sans-serif'; ctx.fillText(card.title, x + 88, y + 36)
    ctx.fillStyle = '#92765A'; ctx.font = '13px sans-serif'; ctx.fillText(card.sub, x + 88, y + 59)
    this.buttons.push({ id: card.id, x, y, width, height, disabled: false })
  }

  drawGame(game, toast, view) {
    this.layout = this.createLayout(game.size)
    this.drawHeader(game, view); this.drawBoard(game); this.drawControls(game, view)
    if (view.waiting) this.drawWaiting(view)
    if (toast) this.drawToast(toast)
    if (game.isOver) this.drawGameOver(game)
  }

  drawHeader(game, view) {
    const ctx = this.ctx; const { margin } = this.layout
    const turnName = game.currentPlayer === game.BLACK ? '黑方落子' : '白方落子'; const turnColor = game.currentPlayer === game.BLACK ? '#1F1C18' : '#B88A54'
    const modeLabel = view.mode === 'local' ? '本地双人' : (view.mode === 'ai' ? `人机对战 · 我执${view.humanColor === game.BLACK ? '黑' : '白'}` : `在线 · ${view.roomCode || '连接中'}`)
    ctx.fillStyle = '#302A23'; ctx.font = '600 24px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('围棋', margin, 46)
    ctx.fillStyle = '#9B7A56'; ctx.font = '12px sans-serif'; ctx.fillText(modeLabel, margin + 56, 45)
    this.roundedRect(this.width - 120, 22, 98, 34, 17); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.fillStyle = turnColor; ctx.beginPath(); ctx.arc(this.width - 102, 39, 7, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#5B4A3A'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(turnName, this.width - 89, 43)
    this.roundedRect(margin, 72, this.width - margin * 2, 38, 10); ctx.fillStyle = '#EFE3D2'; ctx.fill(); ctx.fillStyle = '#5E4E3E'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`第 ${game.moveNumber} 手`, this.width / 2, 96)
    ctx.textAlign = 'left'; ctx.fillText(`黑提 ${game.captures[game.BLACK]}`, margin + 14, 96); ctx.textAlign = 'right'; ctx.fillText(`白提 ${game.captures[game.WHITE]}`, this.width - margin - 14, 96)
  }

  drawBoard(game) {
    const ctx = this.ctx; const { boardX, boardY, boardWidth, cell } = this.layout; const inset = cell / 2; const startX = boardX + inset; const startY = boardY + inset; const gridWidth = boardWidth - cell
    ctx.save(); ctx.shadowColor = 'rgba(85,55,26,0.30)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6; this.roundedRect(boardX, boardY, boardWidth, boardWidth, 10); ctx.fillStyle = '#B97D3C'; ctx.fill(); ctx.restore()
    const wood = ctx.createLinearGradient(boardX, boardY, boardX + boardWidth, boardY + boardWidth); wood.addColorStop(0, '#E8C178'); wood.addColorStop(0.5, '#D6A457'); wood.addColorStop(1, '#C88D43'); this.roundedRect(boardX + 6, boardY + 6, boardWidth - 12, boardWidth - 12, 7); ctx.fillStyle = wood; ctx.fill()
    ctx.strokeStyle = 'rgba(78,49,22,0.82)'; ctx.lineWidth = 1
    for (let index = 0; index < game.size; index += 1) { const offset = index * cell; ctx.beginPath(); ctx.moveTo(startX + offset, startY); ctx.lineTo(startX + offset, startY + gridWidth); ctx.stroke(); ctx.beginPath(); ctx.moveTo(startX, startY + offset); ctx.lineTo(startX + gridWidth, startY + offset); ctx.stroke() }
    this.drawStarPoints(game.size, startX, startY, cell)
    for (let row = 0; row < game.size; row += 1) for (let col = 0; col < game.size; col += 1) if (game.board[row][col]) this.drawStone(startX + col * cell, startY + row * cell, game.board[row][col], cell)
    if (game.lastMove) { ctx.beginPath(); ctx.arc(startX + game.lastMove.col * cell, startY + game.lastMove.row * cell, Math.max(3, cell * 0.13), 0, Math.PI * 2); ctx.fillStyle = game.lastMove.player === game.BLACK ? '#D1A35A' : '#8A5A26'; ctx.fill() }
  }

  drawStarPoints(size, startX, startY, cell) { const points = size === 19 ? [3, 9, 15] : [2, Math.floor(size / 2), size - 3]; this.ctx.fillStyle = '#4C321B'; points.forEach((row) => points.forEach((col) => { this.ctx.beginPath(); this.ctx.arc(startX + col * cell, startY + row * cell, Math.max(2.4, cell * 0.1), 0, Math.PI * 2); this.ctx.fill() })) }

  drawStone(x, y, player, cell) { const ctx = this.ctx; const radius = Math.max(8, cell * 0.46); const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.38, radius * 0.1, x, y, radius); if (player === 1) { gradient.addColorStop(0, '#5B5B5B'); gradient.addColorStop(0.4, '#252525'); gradient.addColorStop(1, '#080808') } else { gradient.addColorStop(0, '#FFFFFF'); gradient.addColorStop(0.55, '#EEE9E0'); gradient.addColorStop(1, '#CFC6BA') }; ctx.save(); ctx.shadowColor = 'rgba(30,20,10,0.42)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill(); ctx.restore() }

  drawControls(game, view) {
    const controls = [
      { id: 'new', label: '模式', color: '#7D5634' },
      { id: 'undo', label: '悔棋', color: '#9A7658', disabled: !view.canUndo || game.isOver },
      { id: 'pass', label: '虚手', color: '#9A7658', disabled: !view.canAct || game.isOver },
      { id: 'resign', label: '认输', color: '#B4644C', disabled: !view.canAct || game.isOver },
    ]
    const gap = 9; const x = 18; const width = (this.width - x * 2 - gap * 3) / 4; const y = Math.min(this.layout.controlsY, this.height - 70)
    controls.forEach((control, index) => this.drawButton(x + index * (width + gap), y, width, 42, control))
    this.ctx.fillStyle = '#8A725C'; this.ctx.textAlign = 'center'; this.ctx.font = '12px sans-serif'; this.ctx.fillText(view.canAct ? '点击棋盘交叉点落子 · 连续双方虚手即数目' : '等待对方落子…', this.width / 2, y + 70)
  }

  drawWaiting(view) { const ctx = this.ctx; const width = this.width - 78; const x = 39; const y = this.layout.boardY + this.layout.boardWidth / 2 - 38; this.roundedRect(x, y, width, 76, 15); ctx.fillStyle = 'rgba(48,42,35,0.87)'; ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.font = '600 16px sans-serif'; ctx.fillText('等待对手加入', this.width / 2, y + 31); ctx.font = '13px sans-serif'; ctx.fillText(`房间号：${view.roomCode}`, this.width / 2, y + 55) }

  drawButton(x, y, width, height, control) { const ctx = this.ctx; this.roundedRect(x, y, width, height, 10); ctx.fillStyle = control.disabled ? '#D8CDC0' : control.color; ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(control.label, x + width / 2, y + 26); this.buttons.push({ id: control.id, x, y, width, height, disabled: control.disabled }) }

  drawToast(toast) { const width = Math.min(this.width - 52, 280); const x = (this.width - width) / 2; this.roundedRect(x, this.layout.boardY - 4, width, 34, 17); this.ctx.fillStyle = 'rgba(48,42,35,0.90)'; this.ctx.fill(); this.ctx.fillStyle = '#FFFFFF'; this.ctx.font = '13px sans-serif'; this.ctx.textAlign = 'center'; this.ctx.fillText(toast, this.width / 2, this.layout.boardY + 18) }

  drawGameOver(game) { const ctx = this.ctx; ctx.fillStyle = 'rgba(42,31,19,0.45)'; ctx.fillRect(0, 0, this.width, this.height); const boxWidth = Math.min(this.width - 44, 340); const x = (this.width - boxWidth) / 2; const y = Math.max(130, (this.height - 218) / 2); this.roundedRect(x, y, boxWidth, 218, 18); ctx.fillStyle = '#FFF9F0'; ctx.fill(); ctx.fillStyle = '#5A4230'; ctx.font = '600 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(game.result.title, this.width / 2, y + 45); ctx.fillStyle = '#8A6C52'; ctx.font = '13px sans-serif'; ctx.fillText(game.result.detail, this.width / 2, y + 72); ctx.fillStyle = '#34291F'; ctx.font = '16px sans-serif'; ctx.fillText(`黑方 ${game.result.blackScore.toFixed(1)} 目`, this.width / 2, y + 114); ctx.fillStyle = '#8B7C6E'; ctx.fillText(`白方 ${game.result.whiteScore.toFixed(1)} 目（含贴目 ${game.komi}）`, this.width / 2, y + 142); this.drawButton(x + 44, y + 164, boxWidth - 88, 40, { id: 'new', label: '返回模式选择', color: '#7D5634' }) }

  hitTest(x, y, screen = 'game') {
    for (let index = this.buttons.length - 1; index >= 0; index -= 1) { const button = this.buttons[index]; if (!button.disabled && x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) return { type: 'button', id: button.id } }
    if (screen !== 'game') return null
    const { boardX, boardY, boardWidth, cell } = this.layout
    if (x < boardX - cell / 2 || x > boardX + boardWidth + cell / 2 || y < boardY - cell / 2 || y > boardY + boardWidth + cell / 2) return null
    return { type: 'board', row: Math.round((y - (boardY + cell / 2)) / cell), col: Math.round((x - (boardX + cell / 2)) / cell) }
  }
}

module.exports = CanvasRenderer
