declare global {
  interface Window {
    LocalGame: typeof LocalGame
    SocketGame: typeof SocketGame
  }
}

import p5 from 'p5'
global.p5 = p5

import { LocalGame, SocketGame } from './game.js'

window.LocalGame = LocalGame
window.SocketGame = SocketGame