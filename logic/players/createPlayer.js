import { db } from '../dbConnection.js'
import { randomUUID } from 'crypto'

export async function createPlayer (req, _res, next) {
  const { email, nickName } = req.body
  req.currentPlayer = await db('players').where('email', email)
  if (req.currentPlayer.length) return next()
  req.newPlayer = await db('players').insert({ player_id: randomUUID(), email, nick_name: nickName })
  next()
}
