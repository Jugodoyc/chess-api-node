import { readFile } from 'node:fs/promises'

export async function getGameById (id) {
  try {
    const game = await readFile(`./games/${id}${!id.includes('.json') ? '.json' : ''}`)
    return { game }
  } catch (error) {
    return { error: 'this game not exists' }
  }
}
