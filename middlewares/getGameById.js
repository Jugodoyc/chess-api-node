import { getGameById } from '../logic/getGame.js'

export async function getGameByIdMW (req, res, next) {
  const { id } = req.params
  const { game, error } = await getGameById(id)
  if (error) return res.status(400).send('this game not exists')
  req.body.game = JSON.parse(game)
  next()
}
