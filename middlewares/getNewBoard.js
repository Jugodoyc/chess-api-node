import { getRowAndColumn } from '../logic/getRowAndColumn.js'

export function getNewBoard (req, _res, next) {
  const { game } = req.body
  const newBoard = []
  game.board.forEach((cell) => {
    const { column } = getRowAndColumn(cell.index)
    if (cell.index % 8 === 0) newBoard.push([])
    newBoard[column].push(cell)
  })
  // console.log(newBoard.map(row => row.map(cell => cell?.piece + cell?.index).join(' ')).join('\n'))
  req.body.board = newBoard
  next()
}
