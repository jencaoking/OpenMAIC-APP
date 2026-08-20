const GameController = require('./js/GameController')

const controller = new GameController()
controller.start()

wx.onTouchStart((event) => {
  const touch = event.touches && event.touches[0]
  if (touch) {
    controller.handleTouch(touch.clientX, touch.clientY)
  }
})

wx.onShow(() => controller.resume())
wx.onHide(() => controller.pause())
