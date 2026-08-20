const GoEngine = require('./core/GoEngine')
const CanvasRenderer = require('./render/CanvasRenderer')

class GameController {
  constructor() {
    this.game = new GoEngine(19, 6.5)
    this.renderer = new CanvasRenderer()
    this.toast = ''
    this.toastTimer = null
    this.paused = false
  }

  start() {
    this.render()
  }

  resume() {
    this.paused = false
    this.render()
  }

  pause() {
    this.paused = true
  }

  render() {
    if (!this.paused) this.renderer.draw(this.game, this.toast)
  }

  showToast(message) {
    this.toast = message
    if (this.toastTimer) clearTimeout(this.toastTimer)
    this.render()
    this.toastTimer = setTimeout(() => {
      this.toast = ''
      this.render()
    }, 1500)
  }

  newGame() {
    this.game.newGame()
    this.toast = '新局开始，黑方先行'
    this.render()
  }

  handleTouch(x, y) {
    if (this.paused) return
    const hit = this.renderer.hitTest(x, y)
    if (!hit) return

    if (hit.type === 'button') {
      this.handleButton(hit.id)
      return
    }

    if (hit.type === 'board') {
      const outcome = this.game.play(hit.row, hit.col)
      if (outcome.ok) {
        this.toast = outcome.captured ? `提掉 ${outcome.captured} 子` : ''
        this.render()
        if (this.toast) this.showToast(this.toast)
      } else {
        this.showToast(outcome.message)
      }
    }
  }

  handleButton(id) {
    if (id === 'new') {
      this.newGame()
      return
    }
    let outcome
    if (id === 'undo') outcome = this.game.undo()
    if (id === 'pass') outcome = this.game.pass()
    if (id === 'resign') outcome = this.game.resign()
    if (outcome) {
      this.toast = outcome.message || ''
      this.render()
      if (this.toast && !this.game.isOver) this.showToast(this.toast)
    }
  }
}

module.exports = GameController
