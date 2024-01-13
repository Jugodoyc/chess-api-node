import { getRowAndColumn } from '../getRowAndColumn.js'
import { newRequire } from '../../utils/require.js'

const require = newRequire(import.meta.url)
const COLORS = require('../../json/colors.json')

export function getPiece (req, _res, next) {
  const { toHint } = req.params
  const { game, prevMove } = req.body
  if (!game.board[toHint || prevMove].piece) {
    req.noPieceError = true
    return next()
  }
  const [color, piece] = game.board[toHint || prevMove].piece
  const { row, column } = getRowAndColumn(toHint || prevMove)
  req.piece = piece
  req.color = color
  req.row = row
  req.column = column
  req.hints = []
  next()
}

export function pawn (data) {
  const { board, color, row, column } = data
  const direction = COLORS.WHITE === color ? 1 : -1
  const hints = []
  const move = { row, column: column + direction }
  let canMove = validateCell({ ...move, board })
  const capture = { row: row + 1, column: column + direction }
  let canCapture = validateCell({ ...capture, board })
  if (!canCapture.empty && canCapture.color !== color && !canCapture.notMove) hints.push({ ...capture })
  capture.row -= 2
  canCapture = validateCell({ ...capture, board })
  if (!canCapture.empty && canCapture.color !== color && !canCapture.notMove) hints.push({ ...capture })
  if (!canMove.empty) return hints
  hints.push({ ...move })
  move.column += direction
  canMove = validateCell({ ...move, board })

  if (!canMove.empty || board[column][row].moved) return hints
  hints.push({ ...move })
  return hints
}

export function bishop (data) {
  const { board, color, row, column, maxMove } = data
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  return moveRookAndBishop({ board, color, row, column, directions, maxMove })
}

export function rook (data) {
  const { board, color, row, column, maxMove } = data
  const directions = [[1, 0], [0, -1], [-1, 0], [0, 1]]
  return moveRookAndBishop({ board, color, row, column, directions, maxMove })
}

export function queen (data) {
  const { board, color, row, column, maxMove = 7 } = data
  return [...rook({ board, color, row, column, maxMove }), ...bishop({ board, color, row, column, maxMove })]
}

export function king (data) {
  const { board, color, row, column } = data
  return queen({ board, color, row, column, maxMove: 2 })
}

export function knight (data) {
  const { board, color, row, column } = data
  const moves = [{ row: row + 1, column: column + 2 },
    { row: row - 1, column: column + 2 },
    { row: row + 1, column: column - 2 },
    { row: row - 1, column: column - 2 },
    { row: row + 2, column: column + 1 },
    { row: row + 2, column: column - 1 },
    { row: row - 2, column: column + 1 },
    { row: row - 2, column: column - 1 }]
  const hints = moves.map(move => {
    const { color: movementColor, notMove } = validateCell({ ...move, board })
    if (notMove || movementColor === color) return null
    return move
  }).filter(move => move)
  return hints
}

export function getHints (req, _res, next) {
  const { body: { board, game }, color, row, column } = req
  const moveFunction = {
    p: pawn,
    b: bishop,
    r: rook,
    q: queen,
    k: king,
    n: knight
  }
  if (game.turn !== color) {
    req.turnError = true
    next()
  }
  req.hints = moveFunction[req.piece]({ board, color, row, column })
  next()
}

function moveRookAndBishop ({ board, color, row, column, directions, maxMove = 8 }) {
  const hints = []
  const canContinue = [true, true, true, true]
  for (let index = 1; index < maxMove; index++) {
    if (canContinue.every(validation => validation === false)) break
    const moves = directions.map(([dRow, dColumn]) => ({ row: row + (index * dRow), column: column + (index * dColumn) }))
    moves.forEach((move, i) => {
      if (!canContinue[i]) return
      const { empty, color: movementColor, notMove } = validateCell({ ...move, board })
      if (notMove) {
        canContinue[i] = false
        return
      }
      if (empty) return hints.push(move)
      else canContinue[i] = false
      if (movementColor !== color) hints.push(move)
    })
  }
  return hints
}

function validateCell ({ row, column, board }) {
  if (row > 7 || row < 0 || column > 7 || column < 0) return { notMove: true }
  const { piece, moved } = board[column][row]
  if (!piece) return { empty: true }
  const [color] = piece
  return { empty: false, color, moved }
}
