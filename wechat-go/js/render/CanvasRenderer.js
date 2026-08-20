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

  createLayout(boardSize) {
    const margin = 22
    const boardWidth = this.width - margin * 2
    const headerHeight = 126
    return {
      margin,
      boardX: margin,
      boardY: headerHeight,
      boardWidth,
      cell: boardWidth / (boardSize - 1),
      controlsY: headerHeight + boardWidth + 30,
    }
  }

  setBoardSize(boardSize) {
    this.layout = this.createLayout(boardSize)
  }

  roundedRect(x, y, width, height, radius) {
    const ctx = this.ctx
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + width, y, x + width, y + height, r)
    ctx.arcTo(x + width, y + height, x, y + height, r)
    ctx.arcTo(x, y + height, x, y, r)
    ctx.arcTo(x, y, x + width, y, r)
    ctx.closePath()
  }

  draw(game, toast) {
    const ctx = this.ctx
    this.buttons = []
    ctx.clearRect(0, 0, this.width, this.height)
    this.drawBackground()
    this.drawHeader(game)
    this.drawBoard(game)
    this.drawControls(game)
    if (toast) this.drawToast(toast)
    if (game.isOver) this.drawGameOver(game)
  }

  drawBackground() {
    const ctx = this.ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, '#FCF8F1')
    gradient.addColorStop(1, '#F0E3D0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.width, this.height)
  }

  drawHeader(game) {
    const ctx = this.ctx
    const { margin } = this.layout
    const turnName = game.currentPlayer === game.BLACK ? '黑方落子' : '白方落子'
    const turnColor = game.currentPlayer === game.BLACK ? '#1F1C18' : '#B88A54'

    ctx.fillStyle = '#302A23'
    ctx.font = '600 24px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('围棋', margin, 46)
    ctx.fillStyle = '#9B7A56'
    ctx.font = '13px sans-serif'
    ctx.fillText('静心对弈', margin + 56, 45)

    this.roundedRect(this.width - 120, 22, 98, 34, 17)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.fillStyle = turnColor
    ctx.beginPath()
    ctx.arc(this.width - 102, 39, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#5B4A3A'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(turnName, this.width - 89, 43)

    this.roundedRect(margin, 72, this.width - margin * 2, 38, 10)
    ctx.fillStyle = '#EFE3D2'
    ctx.fill()
    ctx.fillStyle = '#5E4E3E'
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`第 ${game.moveNumber} 手`, this.width / 2, 96)
    ctx.textAlign = 'left'
    ctx.fillText(`黑提 ${game.captures[game.BLACK]}`, margin + 14, 96)
    ctx.textAlign = 'right'
    ctx.fillText(`白提 ${game.captures[game.WHITE]}`, this.width - margin - 14, 96)
  }

  drawBoard(game) {
    const ctx = this.ctx
    const { boardX, boardY, boardWidth, cell } = this.layout
    const inset = cell / 2
    const gridStartX = boardX + inset
    const gridStartY = boardY + inset
    const gridWidth = boardWidth - cell

    ctx.save()
    ctx.shadowColor = 'rgba(85, 55, 26, 0.30)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 6
    this.roundedRect(boardX, boardY, boardWidth, boardWidth, 10)
    ctx.fillStyle = '#B97D3C'
    ctx.fill()
    ctx.restore()

    const wood = ctx.createLinearGradient(boardX, boardY, boardX + boardWidth, boardY + boardWidth)
    wood.addColorStop(0, '#E8C178')
    wood.addColorStop(0.5, '#D6A457')
    wood.addColorStop(1, '#C88D43')
    this.roundedRect(boardX + 6, boardY + 6, boardWidth - 12, boardWidth - 12, 7)
    ctx.fillStyle = wood
    ctx.fill()

    ctx.strokeStyle = 'rgba(78, 49, 22, 0.82)'
    ctx.lineWidth = 1
    for (let i = 0; i < game.size; i += 1) {
      const position = gridStartX + i * cell
      ctx.beginPath()
      ctx.moveTo(position, gridStartY)
      ctx.lineTo(position, gridStartY + gridWidth)
      ctx.stroke()
      const vertical = gridStartY + i * cell
      ctx.beginPath()
      ctx.moveTo(gridStartX, vertical)
      ctx.lineTo(gridStartX + gridWidth, vertical)
      ctx.stroke()
    }

    this.drawStarPoints(game.size, gridStartX, gridStartY, cell)
    for (let row = 0; row < game.size; row += 1) {
      for (let col = 0; col < game.size; col += 1) {
        const stone = game.board[row][col]
        if (stone) this.drawStone(gridStartX + col * cell, gridStartY + row * cell, stone, cell)
      }
    }

    if (game.lastMove) {
      const x = gridStartX + game.lastMove.col * cell
      const y = gridStartY + game.lastMove.row * cell
      ctx.beginPath()
      ctx.arc(x, y, Math.max(3, cell * 0.13), 0, Math.PI * 2)
      ctx.fillStyle = game.lastMove.player === game.BLACK ? '#D1A35A' : '#8A5A26'
      ctx.fill()
    }
  }

  drawStarPoints(size, startX, startY, cell) {
    const ctx = this.ctx
    const points = size === 19 ? [3, 9, 15] : (size === 13 ? [3, 6, 9] : [2, 4, 6])
    ctx.fillStyle = '#4C321B'
    points.forEach((row) => {
      points.forEach((col) => {
        ctx.beginPath()
        ctx.arc(startX + col * cell, startY + row * cell, Math.max(2.4, cell * 0.1), 0, Math.PI * 2)
        ctx.fill()
      })
    })
  }

  drawStone(x, y, player, cell) {
    const ctx = this.ctx
    const radius = Math.max(8, cell * 0.46)
    const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.38, radius * 0.1, x, y, radius)
    if (player === 1) {
      gradient.addColorStop(0, '#5B5B5B')
      gradient.addColorStop(0.4, '#252525')
      gradient.addColorStop(1, '#080808')
    } else {
      gradient.addColorStop(0, '#FFFFFF')
      gradient.addColorStop(0.55, '#EEE9E0')
      gradient.addColorStop(1, '#CFC6BA')
    }
    ctx.save()
    ctx.shadowColor = 'rgba(30, 20, 10, 0.42)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.restore()
  }

  drawControls(game) {
    const controls = [
      { id: 'new', label: '新局', color: '#7D5634' },
      { id: 'undo', label: '悔棋', color: '#9A7658', disabled: game.history.length === 0 },
      { id: 'pass', label: '虚手', color: '#9A7658', disabled: game.isOver },
      { id: 'resign', label: '认输', color: '#B4644C', disabled: game.isOver },
    ]
    const gap = 9
    const x = 18
    const width = (this.width - x * 2 - gap * 3) / 4
    const y = Math.min(this.layout.controlsY, this.height - 70)
    controls.forEach((control, index) => {
      const buttonX = x + index * (width + gap)
      this.drawButton(buttonX, y, width, 42, control)
    })
    const ctx = this.ctx
    ctx.fillStyle = '#8A725C'
    ctx.textAlign = 'center'
    ctx.font = '12px sans-serif'
    ctx.fillText('点击棋盘交叉点落子 · 连续双方虚手即数目', this.width / 2, y + 70)
  }

  drawButton(x, y, width, height, control) {
    const ctx = this.ctx
    this.roundedRect(x, y, width, height, 10)
    ctx.fillStyle = control.disabled ? '#D8CDC0' : control.color
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '600 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(control.label, x + width / 2, y + 26)
    this.buttons.push({ id: control.id, x, y, width, height, disabled: control.disabled })
  }

  drawToast(toast) {
    const ctx = this.ctx
    const width = Math.min(this.width - 52, 260)
    const x = (this.width - width) / 2
    this.roundedRect(x, this.layout.boardY - 4, width, 34, 17)
    ctx.fillStyle = 'rgba(48, 42, 35, 0.90)'
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(toast, this.width / 2, this.layout.boardY + 18)
  }

  drawGameOver(game) {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(42, 31, 19, 0.45)'
    ctx.fillRect(0, 0, this.width, this.height)
    const boxWidth = Math.min(this.width - 44, 340)
    const boxHeight = 218
    const x = (this.width - boxWidth) / 2
    const y = Math.max(130, (this.height - boxHeight) / 2)
    this.roundedRect(x, y, boxWidth, boxHeight, 18)
    ctx.fillStyle = '#FFF9F0'
    ctx.fill()
    ctx.fillStyle = '#5A4230'
    ctx.font = '600 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(game.result.title, this.width / 2, y + 45)
    ctx.fillStyle = '#8A6C52'
    ctx.font = '13px sans-serif'
    ctx.fillText(game.result.detail, this.width / 2, y + 72)
    ctx.fillStyle = '#34291F'
    ctx.font = '16px sans-serif'
    ctx.fillText(`黑方 ${game.result.blackScore.toFixed(1)} 目`, this.width / 2, y + 114)
    ctx.fillStyle = '#8B7C6E'
    ctx.fillText(`白方 ${game.result.whiteScore.toFixed(1)} 目（含贴目 ${game.komi}）`, this.width / 2, y + 142)
    const button = { id: 'new', label: '再来一局', color: '#7D5634' }
    this.drawButton(x + 44, y + 164, boxWidth - 88, 40, button)
  }

  hitTest(x, y) {
    for (let index = this.buttons.length - 1; index >= 0; index -= 1) {
      const button = this.buttons[index]
      if (!button.disabled && x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
        return { type: 'button', id: button.id }
      }
    }
    const { boardX, boardY, boardWidth, cell } = this.layout
    if (x < boardX - cell / 2 || x > boardX + boardWidth + cell / 2 || y < boardY - cell / 2 || y > boardY + boardWidth + cell / 2) {
      return null
    }
    const col = Math.round((x - (boardX + cell / 2)) / cell)
    const row = Math.round((y - (boardY + cell / 2)) / cell)
    return { type: 'board', row, col }
  }
}

module.exports = CanvasRenderer
