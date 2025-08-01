import p5 from 'p5'
import { Socket } from 'socket.io'
import { Environment, Id, Interpreter, WRENatives, buildEnvironment, interpret } from 'wollok-ts'
import { GameProject, MediaFile, getProgramIn } from './gameProject'
import { GameSound } from './gameSound'
import { step } from './render'
import sketch from './sketch'
import { Asset, BoardState, Resolution, SoundState, VisualState, boardState, buildKeyPressEvent, canvasResolution, flushEvents, queueEvent, soundState, visualState } from './utils'

const { round } = Math

interface GameState {
  images: Map<string, p5.Image>
  sounds: Map<Id, Howl>
  currentSounds: Map<Id, GameSound>
  gamePaused: boolean
  audioMuted: boolean
}

export interface Game {
  start(canvasParent?: Element): void
  get running(): boolean
  get board(): BoardState
  get visuals(): VisualState[]
  get canvasResolution(): Resolution
  get soundStates(): SoundState[]
  queueEvent(...events: string[]): void
  flushEvents(ms: number): void
  step(sketch: p5, gameState: GameState): void
}

export class LocalGame implements Game {
  environment: Environment
  project: GameProject
  interpreter: Interpreter

  constructor(project: GameProject) {
    this.project = project
    this.environment = buildEnvironment(project.sources)
    this.interpreter = interpret(this.environment, WRENatives)
  }

  start(canvasParent?: Element): p5 {
    this.interpreter.exec(getProgramIn(this.project.main, this.environment))
    return new p5(sketch(this, this.project.images, this.project.sounds, canvasParent))
  }

  get running(): boolean { return this.gameObject.get('running')!.innerBoolean! }

  get board(): BoardState { return boardState(this.gameObject) }

  get visuals(): VisualState[] {
    const visuals = this.gameObject.get('visuals')?.innerCollection ?? []
    return visuals.map(visual => visualState(this.interpreter, visual))
  }

  get canvasResolution(): Resolution { return canvasResolution(this.interpreter) }

  get soundStates(): SoundState[] {
    const soundInstances = this.interpreter.object('wollok.game.game').get('sounds')?.innerCollection ?? []
    return soundInstances.map(soundState)
  }

  queueEvent(...events: string[]): void {
    queueEvent(this.interpreter, ...events.map(code => buildKeyPressEvent(this.interpreter, code)))
  }

  flushEvents(ms: number): void{
    flushEvents(this.interpreter, ms)
  }

  step(sketch: p5, gameState: GameState): void {
    step({ ...gameState, sketch, game: this })
  }

  private get gameObject() { return this.interpreter.object('wollok.game.game') }
}

export class SocketGame implements Game {
  socket: Socket

  board: BoardState
  images: MediaFile[] = []
  sounds: MediaFile[] = []

  visuals: VisualState[] = []
  soundStates: SoundState[] = []

  running = false

  constructor(socket: Socket) {
    this.socket = socket

    this.socket.emit('ready')

    socket.on('board', data => this.board = data)
    socket.on('visuals', data => this.visuals = data)
    socket.on('sounds', data => this.soundStates = data)

    socket.on('images', (imgs: Asset[]) => {
      imgs.forEach(({ name, url }) =>
        this.images.push({ possiblePaths: [name], url })
      )
    })
    socket.on('music', (sounds: Asset[]) => {
      sounds.forEach(({ name, url }) =>
        this.sounds.push({ possiblePaths: [name], url })
      )
    })

    // eslint-disable-next-line no-console
    socket.on('error', data => console.log(data))
  }

  start(canvasParent?: Element): p5 {
    this.running = true
    return new p5(sketch(this, this.images, this.sounds, canvasParent))
  }

  get canvasResolution(): Resolution {
    const { cellSize, width, height } = this.board
    return {
      width: round(width) * cellSize,
      height: round(height) * cellSize,
    }
  }

  queueEvent(...events: string[]): void {
    this.socket.emit('keyPressed', events)
  }

  flushEvents(_ms: number): void {
    // Do nothing, already managed by the server
  }

  step(sketch: p5, gameState: GameState): void {
    step({ ...gameState, sketch, game: this })
  }

}

export default Game