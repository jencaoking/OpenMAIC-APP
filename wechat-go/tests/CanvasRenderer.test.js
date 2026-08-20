const assert = require('assert')

function createContext() {
  const gradient = { addColorStop() {} }
  return {
    scale() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, arcTo() {}, closePath() {}, fill() {}, stroke() {}, lineTo() {}, arc() {}, save() {}, restore() {}, fillText() {},
    createLinearGradient() { return gradient },
    createRadialGradient() { return gradient },
  }
}

global.wx = {
  createCanvas() {
    return { width: 0, height: 0, getContext: () => createContext() }
  },
  getSystemInfoSync() {
    return { windowWidth: 375, windowHeight: 667, pixelRatio: 2 }
  },
}

const GoEngine = require('../js/core/GoEngine')
const CanvasRenderer = require('../js/render/CanvasRenderer')

const game = new GoEngine(19)
const renderer = new CanvasRenderer()
renderer.draw(game, '')

const boardHit = renderer.hitTest(30, 134)
assert.strictEqual(boardHit.type, 'board')
assert.ok(boardHit.row >= 0 && boardHit.row < 19)
assert.ok(boardHit.col >= 0 && boardHit.col < 19)

const newGameButton = renderer.hitTest(40, renderer.layout.controlsY + 15)
assert.deepStrictEqual(newGameButton, { type: 'button', id: 'new' })
console.log('✓ 画布渲染与触控命中冒烟测试通过')
