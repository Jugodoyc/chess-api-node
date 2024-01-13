import { db } from '../dbConnection.js'

export async function getPlayers (req, _res, next) {
  req.players = await db('players')
  next()
}

export async function getPlayerById (req, _res, next) {
  req.player = await db('players').where('player_id', req.params.id)
  next()
}

export async function getPlayersByEmail (req, _res, next) {
  req.players = await db('players').where('player_id', 'like', `%${req.params.email}%`)
  next()
}

export async function getPlayersByNick (req, _res, next) {
  req.players = await db('players').where('nick_name', 'like', `%${req.params.nickName}%`)
  next()
}
