declare global {
  interface Window {
    LocalGame: typeof LocalGame
    SocketGame: typeof SocketGame
  }
}

import p5 from 'p5'
global.p5 = p5
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('p5/lib/addons/p5.sound')

import { LocalGame, SocketGame } from './game'

window.LocalGame = LocalGame
window.SocketGame = SocketGame

// Exporting all games components
export * from './fake'
export * from './game'
export * from './gameProject'
export * from './gameSound'
export * from './messages'
export * from './render'
export * from './sketch'
export * from './utils'