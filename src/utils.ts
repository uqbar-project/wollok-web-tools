import { Id, Interpreter, RuntimeObject } from 'wollok-ts'

export const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
export const VALID_SOUND_EXTENSIONS = ['mp3', 'ogg', 'wav']
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'

const { round } = Math

export const defaultImgs = [
  'ground.png',
  'wko.png',
  'speech.png',
  'speech2.png',
  'speech3.png',
  'speech4.png',
]

function invokeMethod(interpreter: Interpreter, visual: RuntimeObject, method: string) {
  const lookedUpMethod = visual.module.lookupMethod(method, 0)
  return lookedUpMethod && interpreter.invoke(lookedUpMethod, visual)!.innerString
}

export function wKeyCode(keyName: string, keyCode: number): string { //These keyCodes correspond to http://keycode.info/
  if (keyCode >= 48 && keyCode <= 57) return `Digit${keyName}` //Numbers (non numpad)
  if (keyCode >= 65 && keyCode <= 90) return `Key${keyName.toUpperCase()}` //Letters
  if (keyCode === 18) return 'AltLeft'
  if (keyCode === 225) return 'AltRight'
  if (keyCode === 8) return 'Backspace'
  if (keyCode === 17) return 'Control'
  if (keyCode === 46) return 'Delete'
  if (keyCode >= 37 && keyCode <= 40) return keyName //Arrows
  if (keyCode === 13) return 'Enter'
  if (keyCode === 189) return 'Minus'
  if (keyCode === 187) return 'Plus'
  if (keyCode === 191) return 'Slash'
  if (keyCode === 32) return 'Space'
  if (keyCode === 16) return 'Shift'
  return '' //If an unknown key is pressed, a string should be returned
}

export function buildKeyPressEvent(interpreter: Interpreter, keyCode: string): RuntimeObject {
  return interpreter.list(
    interpreter.reify('keypress'),
    interpreter.reify(keyCode)
  )
}

export interface VisualState {
  image?: string
  position: Position
  message?: string
  messageTime?: number
  text?: string
  textColor?: string
}
export interface Position {
  x: number
  y: number
}
export interface Asset {
  name: string
  url: string
}
export interface Resolution {
  width: number;
  height: number;
}


export function hexaToColor(textColor?: string): string | undefined { return !textColor ? undefined : '#' + textColor }

export function visualState(interpreter: Interpreter, visual: RuntimeObject): VisualState {
  const image = invokeMethod(interpreter, visual, 'image')
  const text = invokeMethod(interpreter, visual, 'text')
  const textColor = invokeMethod(interpreter, visual, 'textColor')
  const position = interpreter.send('position', visual)
  const roundedPosition = interpreter.send('round', position)
  const x = roundedPosition.get('x')!.innerNumber
  const y = roundedPosition.get('y')!.innerNumber
  const message = visual.get('message')?.innerString
  const messageTime = visual.get('messageTime')?.innerNumber
  return { image, position: { x, y }, text, textColor, message, messageTime }
}

export function flushEvents(interpreter: Interpreter, ms: number): void {
  interpreter.send(
    'flushEvents',
    interpreter.object('wollok.game.game'),
    interpreter.reify(ms),
  )
}

export function canvasResolution(interpreter: Interpreter): Resolution {
  const game = interpreter.object('wollok.game.game')
  const cellPixelSize = game.get('cellSize')!.innerNumber!
  const width = round(game.get('width')!.innerNumber!) * cellPixelSize
  const height = round(game.get('height')!.innerNumber!) * cellPixelSize
  return { width, height }
}

export function queueEvent(interpreter: Interpreter, ...events: RuntimeObject[]): void {
  const io = interpreter.object('wollok.lang.io')
  events.forEach(e => interpreter.send('queueEvent', io, e))
}

export interface BoardState {
  cellSize: number
  boardGround?: string
  ground: string
  width: number
  height: number
}

export function boardState(game: RuntimeObject): BoardState {
  const cellSize = game.get('cellSize')!.innerNumber
  const boardGround = game.get('boardGround')?.innerString
  const ground = game.get('ground')!.innerString
  const width = game.get('width')!.innerNumber
  const height = game.get('height')!.innerNumber
  return { cellSize, boardGround, ground, width, height }
}

export type SoundStatus = 'played' | 'paused' | 'stopped'
export interface SoundState {
  id: Id;
  file: string;
  status: SoundStatus;
  volume: number;
  loop: boolean;
}

export function soundState(soundInstance: RuntimeObject): SoundState {
  return {
    id: soundInstance.id,
    file: soundInstance.get('file')!.innerString!,
    status: soundInstance.get('status')!.innerString! as SoundStatus,
    volume: soundInstance.get('volume')!.innerNumber!,
    loop: soundInstance.get('loop')!.innerBoolean!,
  }
}