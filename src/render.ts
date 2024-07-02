import p5, { Renderer } from 'p5'
import { Id, Interpreter } from 'wollok-ts'
import Game from './game'
import { GameProject } from './gameProject'
import { GameSound, SoundState, SoundStatus } from './gameSound'
import { DrawableMessage, TEXT_SIZE, TEXT_STYLE, drawMessage } from './messages'
import { Position, flushEvents } from './utils'

const { round, min } = Math

export interface Drawable {
  drawableImage?: DrawableImage;
  drawableText?: DrawableText;
}

export interface DrawableImage {
  image: p5.Image;
  position: Position;
}

export interface DrawableText {
  position: Position;
  text: string;
  color?: string;
  size?: number;
  horizAlign?: p5.HORIZ_ALIGN;
  vertAlign?: p5.VERT_ALIGN;
  style?: p5.THE_STYLE;
}

export function draw(sketch: p5, drawable: Drawable): void {
  if (drawable.drawableImage) {
    const { drawableImage: { image, position: { x, y } } } = drawable
    sketch.image(image, x, y)
  }
  if (drawable.drawableText) {
    write(sketch, drawable.drawableText)
  }
}

export function write(sketch: p5, drawableText: DrawableText): void {
  const defaultTextColor = 'blue'
  const grey = '#1c1c1c'
  const hAlign = drawableText.horizAlign || 'center'
  const vAlign = drawableText.vertAlign || 'center'
  const x = drawableText.position.x
  const y = drawableText.position.y
  sketch.textSize(drawableText.size || TEXT_SIZE)
  sketch.textStyle(drawableText.style || TEXT_STYLE)
  sketch.textAlign(hAlign, vAlign)
  sketch.stroke(grey)
  sketch.fill(drawableText.color || defaultTextColor)
  sketch.text(drawableText.text, x, y)
}

export function baseDrawable(images: Map<string, p5.Image>, path?: string): Drawable {
  const origin: Position = { x: 0, y: 0 }
  const p5Image = path && images.get(removeIfStartsWith(path, './'))

  if (!p5Image) {
    const drawableText = {
      color: 'black', horizAlign: p5.prototype.LEFT,
      vertAlign: p5.prototype.TOP, text: 'IMAGE\n  NOT\nFOUND', position: origin,
    }
    return { drawableImage: { image: images.get('wko.png')!, position: origin }, drawableText }
  }

  return { drawableImage: { image: p5Image, position: origin } }
}

export function moveAllTo(drawable: Drawable, position: Position): void {
  const { drawableImage, drawableText } = drawable
  if (drawableImage) { drawableImage.position = position }
  if (drawableText) { drawableText.position = position }
}

export function hexaToColor(textColor?: string): string | undefined { return !textColor ? undefined : '#' + textColor }

function canvasAspectRatio(gameWidth: number, gameHeight: number, parentWidth: number, parentHeight: number) {
  return min(parentWidth / gameWidth, parentHeight / gameHeight)
}

export function resizeCanvas(gameWidth: number, gameHeight: number, rendered: Renderer, canvasParent?: Element) {
  const parentWidth = canvasParent?.clientWidth || window.innerWidth
  const parentHeight = canvasParent?.clientHeight || window.innerHeight
  const ratio = canvasAspectRatio(gameWidth, gameHeight, parentWidth, parentHeight)

  rendered.style('width', `${gameWidth * ratio}px`)
  rendered.style('height', `${gameHeight * ratio}px`)
}

export function removeIfStartsWith(path: string, prefix: string): string {
  if (path.startsWith(prefix)) {
    return path.replace(prefix, '')
  }

  return path
}


// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// GAME CYCLE
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface StepAssets {
  sketch: p5
  game: Game
  sounds: Map<Id, GameSound>
  images: Map<Id, p5.Image>
  audioMuted: boolean
  gamePaused: boolean
}

interface SoundAssets {
  gameProject: GameProject
  interpreter: Interpreter
  sounds: Map<Id, GameSound>
  audioMuted?: boolean
  gamePaused?: boolean
}

export function step(assets: StepAssets) {
  const { sketch, game, sounds, images, audioMuted, gamePaused } = assets
  const { project: gameProject, interpreter } = game

  if (!gamePaused) {
    window.performance.mark('update-start')
    flushEvents(game.interpreter, sketch.millis())
    updateSound({ gameProject, interpreter, sounds, audioMuted })
    window.performance.mark('update-end')
    window.performance.mark('draw-start')
    render(game, sketch, images)
    window.performance.mark('draw-end')

    window.performance.measure('update-start-to-end', 'update-start', 'update-end')
    window.performance.measure('draw-start-to-end', 'draw-start', 'draw-end')
  }
  else {
    updateSound({ gameProject, interpreter, sounds, gamePaused })
  }
  return undefined
}

function updateSound(assets: SoundAssets) {
  const { gameProject, interpreter, sounds, audioMuted, gamePaused } = assets
  const soundInstances = gamePaused ? [] : interpreter.object('wollok.game.game').get('sounds')?.innerCollection ?? []

  for (const [id, sound] of sounds.entries()) {
    if (!soundInstances.some(sound => sound.id === id)) {
      sound.stopSound()
      sounds.delete(id)
    } else {
      sound.playSound()
    }
  }

  soundInstances.forEach(soundInstance => {
    const soundState: SoundState = {
      id: soundInstance.id,
      file: soundInstance.get('file')!.innerString!,
      status: soundInstance.get('status')!.innerString! as SoundStatus,
      volume: audioMuted ? 0 : soundInstance.get('volume')!.innerNumber!,
      loop: soundInstance.get('loop')!.innerBoolean!,
    }

    let sound = sounds.get(soundState.id)
    if (!sound) {
      const soundPath = gameProject.sounds.find(({ possiblePaths }) => possiblePaths.includes(soundState.file))?.url
      if (soundPath) { // TODO: add soundfile not found exception
        sound = new GameSound(soundState, soundPath)
        sounds.set(soundState.id, sound)
      }
    }

    sound?.update(soundState)
  })
}

function render(game: Game, sketch: p5, images: Map<string, p5.Image>) {
  const { cellSize, boardGround, ground, width, height, } = game.board()

  if (boardGround) sketch.image(baseDrawable(images, boardGround).drawableImage!.image, 0, 0, sketch.width, sketch.height)
  else {
    const groundImage = baseDrawable(images, ground).drawableImage!.image
    const gameWidth = round(width)
    const gameHeight = round(height)

    for (let x = 0; x < gameWidth; x++)
      for (let y = 0; y < gameHeight; y++)
        sketch.image(groundImage, x * cellSize, y * cellSize, cellSize, cellSize)
  }

  const messagesToDraw: DrawableMessage[] = []
  for (const visual of game.visuals()) {
    const { image: stateImage, position, message, messageTime, text, textColor } = visual
    const drawable = stateImage === undefined ? {} : baseDrawable(images, stateImage)
    let x = position.x * cellSize
    let y = sketch.height - (position.y + 1) * cellSize

    if (stateImage) {
      x = position.x * cellSize
      y = sketch.height - position.y * cellSize - drawable.drawableImage!.image.height
      moveAllTo(drawable, { x, y })
    }

    if (message && messageTime > sketch.millis())
      messagesToDraw.push({ message, x, y })

    draw(sketch, drawable)

    if (text) {
      x = (position.x + 0.5) * cellSize
      y = sketch.height - (position.y + 0.5) * cellSize
      const drawableText = { text, position: { x, y }, color: hexaToColor(textColor) }
      write(sketch, drawableText)
    }
  }

  messagesToDraw.forEach(drawMessage(sketch))


}
