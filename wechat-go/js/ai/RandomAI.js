class RandomAI {
  chooseMove(game) {
    const legalMoves = game.getLegalMoves()
    if (!legalMoves.length) return null
    const index = Math.floor(Math.random() * legalMoves.length)
    return legalMoves[index]
  }
}

module.exports = RandomAI
