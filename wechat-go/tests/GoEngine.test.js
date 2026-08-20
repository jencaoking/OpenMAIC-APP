const assert = require('assert')
const GoEngine = require('../js/core/GoEngine')

function mustPlay(game, row, col) {
  const result = game.play(row, col)
  assert.strictEqual(result.ok, true, `落子失败：${row},${col}；${result.message || ''}`)
  return result
}

function testCapture() {
  const game = new GoEngine(5)
  mustPlay(game, 1, 1)
  mustPlay(game, 0, 1)
  mustPlay(game, 4, 4)
  mustPlay(game, 1, 0)
  mustPlay(game, 4, 3)
  mustPlay(game, 2, 1)
  mustPlay(game, 3, 4)
  const finalMove = mustPlay(game, 1, 2)
  assert.strictEqual(finalMove.captured, 1)
  assert.strictEqual(game.board[1][1], game.EMPTY)
  assert.strictEqual(game.captures[game.WHITE], 1)
}

function testSuicideIsRejected() {
  const game = new GoEngine(5)
  game.board[0][1] = game.BLACK
  game.board[1][0] = game.BLACK
  game.board[1][2] = game.BLACK
  game.board[2][1] = game.BLACK
  game.currentPlayer = game.WHITE
  game.positionHistory = [game.boardSignature()]
  const result = game.play(1, 1)
  assert.strictEqual(result.ok, false)
  assert.match(result.message, /禁入点/)
  assert.strictEqual(game.board[1][1], game.EMPTY)
}

function testUndo() {
  const game = new GoEngine(5)
  mustPlay(game, 2, 2)
  assert.strictEqual(game.history.length, 1)
  const result = game.undo()
  assert.strictEqual(result.ok, true)
  assert.strictEqual(game.board[2][2], game.EMPTY)
  assert.strictEqual(game.currentPlayer, game.BLACK)
  assert.strictEqual(game.moveNumber, 1)
}

function testTwoPassesFinishGame() {
  const game = new GoEngine(5)
  assert.strictEqual(game.pass().ok, true)
  const result = game.pass()
  assert.strictEqual(result.ok, true)
  assert.strictEqual(result.finished, true)
  assert.strictEqual(game.isOver, true)
  assert.ok(game.result)
  assert.strictEqual(typeof game.result.blackScore, 'number')
  assert.strictEqual(typeof game.result.whiteScore, 'number')
}

function testOccupiedPointIsRejected() {
  const game = new GoEngine(5)
  mustPlay(game, 2, 2)
  const result = game.play(2, 2)
  assert.strictEqual(result.ok, false)
  assert.match(result.message, /已有棋子/)
}

const tests = [
  ['提子', testCapture],
  ['禁入点', testSuicideIsRejected],
  ['悔棋', testUndo],
  ['连续虚手', testTwoPassesFinishGame],
  ['占点校验', testOccupiedPointIsRejected],
]

tests.forEach(([name, test]) => {
  test()
  console.log(`✓ ${name}`)
})
console.log(`共 ${tests.length} 项围棋规则测试通过`)
