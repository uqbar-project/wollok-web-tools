declare global {
  interface Window {
    LocalGame: typeof LocalGame
    SocketGame: typeof SocketGame
  }
}

import p5 from 'p5'
global.p5 = p5

import { LocalGame, SocketGame } from './game'
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('p5/lib/addons/p5.sound')

window.LocalGame = LocalGame
window.SocketGame = SocketGame