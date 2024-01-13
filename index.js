import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { readdir, writeFile } from 'node:fs/promises'
import { newRequire } from './utils/require.js'
import { getGameByIdMW } from './middlewares/getGameById.js'
import { getIndex, getRowAndColumn } from './logic/getRowAndColumn.js'
import { getNewBoard } from './middlewares/getNewBoard.js'
import { createPlayer } from './logic/players/createPlayer.js'
import { getPlayers } from './logic/players/getPlayers.js'
import { getHints, getPiece } from './logic/movements/hints.js'

const require = newRequire(import.meta.url)
const NEW_GAME = require('./json/newGame.json')
const COLORS = require('./json/colors.json')
const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export const app = express()

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use(cors())

app.use(express.json())

app.get('/players', getPlayers, async (req, res) => {
  res.send(req.players)
})

app.post('/player', createPlayer, async (req, res) => {
  if (req.currentPlayer.length) res.status(400).send('This user already exists')
  else res.send('user created successfully')
})

app.get('/games', async (_req, res) => {
  const games = await readdir('./games')
  res.send(games)
})

app.get('/game/:id', getGameByIdMW, async (req, res) => {
  res.send(req.body.game)
})

app.get('/game/:id/hints/:toHint', getGameByIdMW, getNewBoard, getPiece, getHints, (req, res) => {
  const { hints, color, piece, noPieceFound } = req
  if (noPieceFound) return res.send('notPieceFound').status(400)
  if (req.turnError) return res.status(400).send('isNotYourTurn')
  const finalHints = hints.map((hint) => getIndex(hint))
  res.send({ hints: finalHints, piece, color })
})

app.post('/game', async (_req, res) => {
  const newGame = { ...NEW_GAME, id: randomUUID() }
  await writeFile(`./games/${newGame.id}.json`, JSON.stringify(newGame))
  res.send(newGame)
})

app.post('/game/:id/move', getGameByIdMW, getNewBoard, getPiece, getHints, async (req, res) => {
  const { id } = req.params
  const { game, move, prevMove } = req.body
  const finalHints = req.hints.map((hint) => getIndex(hint))
  if (req.noPieceFound) return res.status(400).send('notPieceFound')
  if (req.turnError) return res.status(400).send('isNotYourTurn')
  if (!finalHints.includes(move)) return res.send(game)
  game.board[move].piece = game.board[prevMove].piece
  game.board[move].moved = true
  game.board[prevMove].piece = null
  game.board[prevMove].moved = null
  const [, piece] = game.board[move].piece
  const { row, column } = getRowAndColumn(game.board[move].index)
  if (!game.moves) game.moves = []
  console.log(game.moves)
  game.moves.push(`${game.moves.length}. ${piece}${COLUMNS[column]}${row + 1}`)
  console.log(game.moves)
  game.turn = COLORS.WHITE === game.turn ? COLORS.BLACK : COLORS.WHITE
  await writeFile(`./games/${id}${id.includes('.json') ? '' : '.json'}`, JSON.stringify(game))
  res.send(game)
})

app.listen(3000, () => console.log('listen in port 3000'))
