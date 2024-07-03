declare global {
    var asd: number
    interface Window {
        LocalGame: typeof LocalGame
        SocketGame: typeof SocketGame
    }
}

global.asd = 87

import p5 from "p5"
global.p5 = p5
require('p5/lib/addons/p5.sound')

import { LocalGame, SocketGame } from "./game"
window.LocalGame = LocalGame
window.SocketGame = SocketGame