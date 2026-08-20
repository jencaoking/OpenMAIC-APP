class GoEngine {
  constructor(size = 19, komi = 6.5) {
    this.BLACK = 1
    this.WHITE = 2
    this.EMPTY = 0
    this.size = size
    this.komi = komi
    this.newGame()
  }

  newGame() {
    this.board = this.createEmptyBoard()
    this.currentPlayer = this.BLACK
    this.captures = { [this.BLACK]: 0, [this.WHITE]: 0 }
    this.moveNumber = 1
    this.passCount = 0
    this.lastMove = null
    this.history = []
    this.positionHistory = [this.boardSignature(this.board)]
    this.isOver = false
    this.result = null
  }

  createEmptyBoard() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(this.EMPTY))
  }

  cloneBoard(board = this.board) {
    return board.map((row) => row.slice())
  }

  boardSignature(board = this.board) {
    return board.map((row) => row.join('')).join('|')
  }

  exportState() {
    return {
      size: this.size,
      komi: this.komi,
      board: this.cloneBoard(),
      currentPlayer: this.currentPlayer,
      captures: { ...this.captures },
      moveNumber: this.moveNumber,
      passCount: this.passCount,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      positionHistory: [...this.positionHistory],
      history: this.history.map((snapshot) => ({ ...snapshot, board: this.cloneBoard(snapshot.board), captures: { ...snapshot.captures } })),
      isOver: this.isOver,
      result: this.result ? { ...this.result } : null,
    }
  }

  hydrate(state) {
    this.size = state.size || this.size
    this.komi = state.komi || this.komi
    this.board = this.cloneBoard(state.board)
    this.currentPlayer = state.currentPlayer
    this.captures = { ...state.captures }
    this.moveNumber = state.moveNumber
    this.passCount = state.passCount
    this.lastMove = state.lastMove ? { ...state.lastMove } : null
    this.positionHistory = state.positionHistory ? [...state.positionHistory] : [this.boardSignature()]
    this.history = state.history ? state.history.map((snapshot) => ({ ...snapshot, board: this.cloneBoard(snapshot.board), captures: { ...snapshot.captures } })) : Array(Math.max(0, this.moveNumber - 1)).fill(null)
    this.isOver = Boolean(state.isOver)
    this.result = state.result ? { ...state.result } : null
  }

  isOnBoard(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size
  }

  neighbours(row, col) {
    return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].filter(([r, c]) => this.isOnBoard(r, c))
  }

  getGroup(row, col, board = this.board) {
    const player = board[row][col]
    if (player === this.EMPTY) return { stones: [], liberties: [] }
    const pending = [[row, col]]
    const seen = new Set()
    const liberties = new Set()
    const stones = []
    while (pending.length) {
      const [r, c] = pending.pop()
      const key = `${r},${c}`
      if (seen.has(key)) continue
      seen.add(key)
      stones.push([r, c])
      this.neighbours(r, c).forEach(([nr, nc]) => {
        if (board[nr][nc] === this.EMPTY) liberties.add(`${nr},${nc}`)
        if (board[nr][nc] === player && !seen.has(`${nr},${nc}`)) pending.push([nr, nc])
      })
    }
    return { stones, liberties: Array.from(liberties, (key) => key.split(',').map(Number)) }
  }

  saveSnapshot() {
    return {
      board: this.cloneBoard(), currentPlayer: this.currentPlayer, captures: { ...this.captures }, moveNumber: this.moveNumber,
      passCount: this.passCount, lastMove: this.lastMove ? { ...this.lastMove } : null,
      positionHistoryLength: this.positionHistory.length, isOver: this.isOver, result: this.result ? { ...this.result } : null,
    }
  }

  restoreSnapshot(snapshot) {
    this.board = this.cloneBoard(snapshot.board)
    this.currentPlayer = snapshot.currentPlayer
    this.captures = { ...snapshot.captures }
    this.moveNumber = snapshot.moveNumber
    this.passCount = snapshot.passCount
    this.lastMove = snapshot.lastMove ? { ...snapshot.lastMove } : null
    this.positionHistory.length = snapshot.positionHistoryLength
    this.isOver = snapshot.isOver
    this.result = snapshot.result ? { ...snapshot.result } : null
  }

  togglePlayer() {
    this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
  }

  isLegalMove(row, col) {
    const snapshot = this.saveSnapshot()
    const historyLength = this.history.length
    const result = this.play(row, col)
    this.restoreSnapshot(snapshot)
    this.history.length = historyLength
    return result.ok
  }

  getLegalMoves() {
    const moves = []
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.board[row][col] === this.EMPTY && this.isLegalMove(row, col)) moves.push({ row, col })
      }
    }
    return moves
  }

  play(row, col) {
    if (this.isOver) return { ok: false, message: '本局已结束，请开启新局' }
    if (!this.isOnBoard(row, col)) return { ok: false, message: '请在棋盘交叉点落子' }
    if (this.board[row][col] !== this.EMPTY) return { ok: false, message: '该处已有棋子' }
    const snapshot = this.saveSnapshot()
    const player = this.currentPlayer
    const opponent = player === this.BLACK ? this.WHITE : this.BLACK
    this.board[row][col] = player
    let captured = 0
    const inspected = new Set()
    this.neighbours(row, col).forEach(([nr, nc]) => {
      if (this.board[nr][nc] !== opponent || inspected.has(`${nr},${nc}`)) return
      const group = this.getGroup(nr, nc)
      group.stones.forEach(([gr, gc]) => inspected.add(`${gr},${gc}`))
      if (group.liberties.length === 0) {
        group.stones.forEach(([gr, gc]) => { this.board[gr][gc] = this.EMPTY })
        captured += group.stones.length
      }
    })
    if (this.getGroup(row, col).liberties.length === 0) {
      this.restoreSnapshot(snapshot)
      return { ok: false, message: '禁入点：该手棋没有气' }
    }
    const signature = this.boardSignature()
    if (this.positionHistory.includes(signature)) {
      this.restoreSnapshot(snapshot)
      return { ok: false, message: '打劫：不可使局面重复' }
    }
    this.history.push(snapshot)
    this.captures[player] += captured
    this.lastMove = { row, col, player }
    this.passCount = 0
    this.positionHistory.push(signature)
    this.moveNumber += 1
    this.togglePlayer()
    return { ok: true, captured }
  }

  pass() {
    if (this.isOver) return { ok: false, message: '本局已结束，请开启新局' }
    this.history.push(this.saveSnapshot())
    this.passCount += 1
    this.moveNumber += 1
    this.togglePlayer()
    if (this.passCount >= 2) {
      this.finishByScore('双方虚手')
      return { ok: true, finished: true, message: '双方虚手，本局数目结束' }
    }
    return { ok: true, message: '虚手成功，轮到对方' }
  }

  resign() {
    if (this.isOver) return { ok: false, message: '本局已结束，请开启新局' }
    const resignedPlayer = this.currentPlayer
    const winner = resignedPlayer === this.BLACK ? this.WHITE : this.BLACK
    const scores = this.calculateScore()
    this.isOver = true
    this.result = { title: winner === this.BLACK ? '黑方胜' : '白方胜', detail: resignedPlayer === this.BLACK ? '黑方认输' : '白方认输', blackScore: scores.blackScore, whiteScore: scores.whiteScore }
    return { ok: true, message: this.result.detail }
  }

  undo() {
    if (!this.history.length) return { ok: false, message: '当前没有可悔的棋' }
    const snapshot = this.history.pop()
    this.restoreSnapshot(snapshot)
    return { ok: true, message: '已悔棋' }
  }

  getEmptyRegion(row, col, visited) {
    const stack = [[row, col]]
    const points = []
    const borders = new Set()
    while (stack.length) {
      const [r, c] = stack.pop()
      const key = `${r},${c}`
      if (visited.has(key)) continue
      visited.add(key)
      points.push([r, c])
      this.neighbours(r, c).forEach(([nr, nc]) => {
        if (this.board[nr][nc] === this.EMPTY && !visited.has(`${nr},${nc}`)) stack.push([nr, nc])
        if (this.board[nr][nc] !== this.EMPTY) borders.add(this.board[nr][nc])
      })
    }
    return { points, borders }
  }

  calculateScore() {
    const territory = { [this.BLACK]: 0, [this.WHITE]: 0 }
    const visited = new Set()
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.board[row][col] !== this.EMPTY || visited.has(`${row},${col}`)) continue
        const region = this.getEmptyRegion(row, col, visited)
        if (region.borders.size === 1) territory[Array.from(region.borders)[0]] += region.points.length
      }
    }
    return { blackScore: territory[this.BLACK] + this.captures[this.BLACK], whiteScore: territory[this.WHITE] + this.captures[this.WHITE] + this.komi, territory }
  }

  finishByScore(detail) {
    const scores = this.calculateScore()
    const difference = scores.blackScore - scores.whiteScore
    this.isOver = true
    this.result = { title: difference === 0 ? '和棋' : (difference > 0 ? '黑方胜' : '白方胜'), detail, blackScore: scores.blackScore, whiteScore: scores.whiteScore }
  }
}

module.exports = GoEngine
