import { createRequire } from 'module'

export const newRequire = (url) => createRequire(url)
