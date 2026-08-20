const assert = require('assert')
const GoEngine = require('../js/core/GoEngine')
const RandomAI = require('../js/ai/RandomAI')

function testRandomAiChoosesLegalMove() {
  const game = new GoEngine(5)
  const ai = new RandomAI()
  const move = ai.chooseMove(game)
  assert.ok(move)
  assert.strictEqual(game.isLegalMove(move.row, move.col), true)
  assert.strictEqual(game.play(move.row, move.col).ok, true)
}

function testModeSelectionFlow() {
  const gradient = { addColorStop() {} }
  const context = {
    scale() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, arcTo() {}, closePath() {}, fill() {}, stroke() {}, lineTo() {}, arc() {}, save() {}, restore() {}, fillText() {},
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
  }
  global.wx = {
    createCanvas: () => ({ width: 0, height: 0, getContext: () => context }),
    getSystemInfoSync: () => ({ windowWidth: 375, windowHeight: 667, pixelRatio: 2 }),
  }
  const GameController = require('../js/GameController')
  const controller = new GameController()
  assert.strictEqual(controller.screen, 'mode')
  controller.handleButton('mode-local')
  assert.strictEqual(controller.mode, 'local')
  assert.strictEqual(controller.screen, 'game')
  controller.enterModeMenu()
  controller.handleButton('mode-ai')
  assert.strictEqual(controller.screen, 'color')
  controller.handleButton('color-black')
  assert.strictEqual(controller.mode, 'ai')
  assert.strictEqual(controller.humanColor, controller.game.BLACK)
}

function testOnlineClientPersistsReconnectIdentity() {
  const callbacks = {}
  const sent = []
  const stored = { go_wss_url: 'wss://go.example.com/ws' }
  const task = {
    onOpen: (callback) => { callbacks.open = callback },
    onMessage: (callback) => { callbacks.message = callback },
    onError: (callback) => { callbacks.error = callback },
    onClose: (callback) => { callbacks.close = callback },
    send: ({ data }) => sent.push(JSON.parse(data)),
    close: () => callbacks.close && callbacks.close(),
  }
  global.wx = {
    getStorageSync: (key) => stored[key],
    setStorageSync: (key, value) => { stored[key] = value },
    connectSocket: ({ url }) => { assert.strictEqual(url, 'wss://go.example.com/ws'); return task },
  }
  const identities = []
  const OnlineClient = require('../js/network/OnlineClient')
  const client = new OnlineClient({ onRoomIdentity: (identity) => identities.push(identity) })
  assert.strictEqual(client.connect(), true)
  client.createRoom('测试玩家')
  callbacks.open()
  assert.deepStrictEqual(sent[0], { type: 'create_room', displayName: '测试玩家' })
  callbacks.message({ data: JSON.stringify({ type: 'room_created', roomCode: '123456', reconnectToken: 'token', color: 'black' }) })
  assert.strictEqual(client.roomCode, '123456')
  assert.strictEqual(client.reconnectToken, 'token')
  assert.strictEqual(stored.go_reconnect_123456, 'token')
  assert.strictEqual(identities[0].color, 'black')
}

testRandomAiChoosesLegalMove()
console.log('✓ 随机 AI 选择合法落子')
testModeSelectionFlow()
console.log('✓ 模式选择进入本地与人机对战')
testOnlineClientPersistsReconnectIdentity()
console.log('✓ 在线客户端保存房间重连身份')
