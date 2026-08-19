import { Howl } from 'howler'
import p5, { Renderer } from 'p5'
import { Id } from 'wollok-ts'
import Game from './game.js'
import { GameSound } from './gameSound.js'
import { DrawableMessage, TEXT_SIZE, TEXT_STYLE, drawMessage, newMessage } from './messages.js'
import { BoardState, DEFAULT_IMAGE, Position, hexaToColor, positionToPixels } from './utils.js'

const { round, min } = Math

const IMAGE_NOT_FOUND = {
  color: 'black', horizAlign: p5.prototype.LEFT,
  vertAlign: p5.prototype.TOP, text: 'IMAGE\n  NOT\nFOUND',
}

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

export function pathToImage(images: Map<string, p5.Image>, path?: string): p5.Image | undefined {
  return path ? images.get(removeIfStartsWith(path, './')) : undefined
}

export function drawImage(images: Map<string, p5.Image>, image: string, sketch: p5, x: number, y: number): void {
  const drawable = pathToImage(images, image)
  if (drawable) {
    sketch.image(drawable, x, y - drawable.height)
  } else {
    sketch.image(images.get(DEFAULT_IMAGE)!, x, y)
    write(sketch, { ...IMAGE_NOT_FOUND, position: { x, y } })
  }
}

export function drawText(sketch: p5, text: string, x: number, y: number, cellSize: number, textColor?: string): void {
  const halfCell = 0.5 * cellSize
  const textPosition = { x: x + halfCell, y: y - halfCell }
  const drawableText = { text, position: textPosition, color: hexaToColor(textColor) }
  write(sketch, drawableText)
}

export function drawBackground(sketch: p5, board: BoardState, images: Map<string, p5.Image>): void {
  const { cellSize, boardGround, ground, width, height } = board

  if (boardGround) sketch.image(pathToImage(images, boardGround)!, 0, 0, sketch.width, sketch.height)
  else {
    const groundImage = pathToImage(images, ground)!
    const gameWidth = round(width)
    const gameHeight = round(height)

    for (let x = 0; x < gameWidth; x++)
      for (let y = 0; y < gameHeight; y++)
        sketch.image(groundImage, x * cellSize, y * cellSize, cellSize, cellSize)
  }
}


export function moveAllTo(drawable: Drawable, position: Position): void {
  const { drawableImage, drawableText } = drawable
  if (drawableImage) { drawableImage.position = position }
  if (drawableText) { drawableText.position = position }
}

function canvasAspectRatio(gameWidth: number, gameHeight: number, parentWidth: number, parentHeight: number) {
  return min(parentWidth / gameWidth, parentHeight / gameHeight)
}

export function resizeCanvas(gameWidth: number, gameHeight: number, rendered: Renderer, canvasParent?: Element): void {
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
  images: Map<Id, p5.Image>
  sounds: Map<Id, Howl>
  currentSounds: Map<Id, GameSound>
  audioMuted: boolean
  gamePaused: boolean
}

export function step(assets: StepAssets): void {
  const { sketch, game, sounds, currentSounds, images, audioMuted, gamePaused } = assets

  if (!gamePaused) {
    window.performance.mark('update-start')
    game.flushEvents(sketch.millis())
    updateSound(game, sounds, currentSounds, audioMuted)
    window.performance.mark('update-end')
    window.performance.mark('draw-start')
    render(game, sketch, images)
    window.performance.mark('draw-end')

    window.performance.measure('update-start-to-end', 'update-start', 'update-end')
    window.performance.measure('draw-start-to-end', 'draw-start', 'draw-end')
  }
  else {
    updateSound(game, sounds, currentSounds, audioMuted)
  }
}

export function updateSound(game: Game, sounds: Map<string, Howl>, currentSounds: Map<Id, GameSound>, audioMuted: boolean): void {
  const { soundStates } = game

  for (const [id, sound] of currentSounds.entries()) {
    if (!soundStates.some(sound => sound.id === id)) {
      sound.stopSound()
      currentSounds.delete(id)
    } else {
      sound.playSound()
    }
  }

  soundStates.forEach(soundState => {
    if (audioMuted) soundState.volume = 0

    let sound = currentSounds.get(soundState.id)
    if (!sound) {
      const soundPath = sounds.get(soundState.file)
      if (soundPath) { // TODO: add soundfile not found exception
        sound = new GameSound(soundState, soundPath)
        currentSounds.set(soundState.id, sound)
      }
    }
    sound?.update(soundState)
  })
}

function render(game: Game, sketch: p5, images: Map<string, p5.Image>) {
  drawBackground(sketch, game.board, images)

  const messagesToDraw: DrawableMessage[] = []

  for (const visual of game.visuals) {
    const { image, position, message, messageTime, text, textColor } = visual
    const { cellSize } = game.board
    const { x, y } = positionToPixels(position, sketch.height, cellSize)

    if (image !== undefined)
      drawImage(images, image, sketch, x, y)

    if (text)
      drawText(sketch, text, x, y, cellSize, textColor)

    if (message && messageTime! > sketch.millis()) // Collect the messages to be draw NOW
      messagesToDraw.push(newMessage(message, x, y, pathToImage(images, image)?.height))
  }

  // Draw the messages last (on top of the visuals)
  messagesToDraw.forEach(drawMessage(sketch))
}