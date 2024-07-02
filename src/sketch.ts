import p5 from "p5"
import { Id } from "wollok-ts"
import Game from "./game"
import { DEFAULT_GAME_ASSETS_DIR } from "./gameProject"
import { GameSound } from "./gameSound"
import { resizeCanvas } from "./render"
import { defaultImgs, wKeyCode } from "./utils"

export default (game: Game, canvasParent?: Element) => (p: p5) => {
    const images = new Map<string, p5.Image>()
    const sounds = new Map<Id, GameSound>()
    let stop = false
    let gamePaused = false
    let audioMuted = false

    p.preload = () => {
        defaultImgs.forEach(path => 
            images.set(path, p.loadImage(DEFAULT_GAME_ASSETS_DIR + path))
        )
        game.images.forEach(({ possiblePaths, url }) =>
            possiblePaths.forEach(path =>
                images.set(path, p.loadImage(url))
            )
        )
    }

    p.setup = () => {
        const { width, height } = game.canvasResolution()
        const renderer = p.createCanvas(width, height)
        if (canvasParent) renderer.parent(canvasParent)
        resizeCanvas(width, height, renderer, canvasParent)
    }

    p.draw = () => {
        if (!game.running) { stop = true }
        else game.step(p, { sounds, images, audioMuted, gamePaused })
    }


    p.keyPressed = () => {
        if (!gamePaused) {
            window.performance.mark('key-start')
            game.queueEvent(wKeyCode(p.key, p.keyCode), 'ANY')
            window.performance.mark('key-end')
            window.performance.measure('key-start-to-end', 'key-start', 'key-end')
        }

        return false
    }
}