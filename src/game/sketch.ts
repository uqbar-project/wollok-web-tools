import p5 from 'p5'
import { Id } from 'wollok-ts'
import Game from './game.js'
import { MediaFile } from './gameProject.js'
import { GameSound } from './gameSound.js'
import { resizeCanvas } from './render.js'
import { wKeyCode } from './utils.js'
import { Howl } from 'howler'
import BASE64_IMAGES from './images'

export const sketch = (game: Game, projectImages: MediaFile[], projectSounds: MediaFile[], canvasParent?: HTMLElement) => (p: p5): void => {
  const images = new Map<string, p5.Image>()
  const sounds = new Map<Id, Howl>()
  const currentSounds = new Map<Id, GameSound>()
  const baseRemove = p.remove

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let stop = false
  const gamePaused = false
  const audioMuted = false

  p.preload = () => {
    BASE64_IMAGES.forEach((base64Data, path) =>
      images.set(path, p.loadImage(base64Data))
    )
    const fallbackImage = images.get('wko.png')
    projectImages.forEach(({ possiblePaths, url }) =>
      possiblePaths.forEach(path => {
        // We can also load images as base64 strings,
        // dont append a cache buster to those
        const isDataUrl = url.startsWith('data:')
        images.set(path, p.loadImage(url + (isDataUrl ? '' : `?cb=${Date.now()}`), () => {}, () => {
          images.set(path, fallbackImage)
        }))
      })
    )
    projectSounds.forEach(({ possiblePaths, url }) =>
      possiblePaths.forEach(path =>
        sounds.set(path, new Howl({ src: url }))
      )
    )
  }

  p.setup = () => {
    const { width, height } = game.canvasResolution
    const renderer = p.createCanvas(width, height)
    if (canvasParent) renderer.parent(canvasParent)
    resizeCanvas(width, height, renderer, canvasParent)
  }

  p.draw = () => {
    if (gamePaused) return
    if (!game.running) { stop = true }
    else game.step(p, { images, sounds, currentSounds, audioMuted, gamePaused })
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

  p.remove = () => {
    baseRemove.call(p)
    sounds.forEach( sound => sound.unload())
  }
}