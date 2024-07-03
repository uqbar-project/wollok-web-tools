import p5 from "p5"
import { Socket } from "socket.io"
import { Environment, Id, Interpreter, WRENatives, buildEnvironment, interpret } from 'wollok-ts'
import { GameProject, MediaFile, getProgramIn } from "./gameProject"
import { GameSound, SoundState, SoundStatus } from "./gameSound"
import { step } from "./render"
import sketch from "./sketch"
import { Asset, Resolution, VisualState, buildKeyPressEvent, canvasResolution, flushEvents, queueEvent, visualState } from "./utils"

const { round } = Math

interface GameState {
    images: Map<string, p5.Image>
    sounds: Map<Id, p5.SoundFile>
    currentSounds: Map<Id, GameSound>
    // stop: boolean
    gamePaused: boolean
    audioMuted: boolean
}

interface BoardState {
    cellSize: number
    boardGround?: string
    ground: string
    width: number
    height: number
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

    start(canvasParent?: Element) {
        this.interpreter.exec(getProgramIn(this.project.main, this.environment))
        return new p5(sketch(this, this.project.images, this.project.sounds, canvasParent))
    }

    get running() { return this.gameObject.get('running')!.innerBoolean! }

    get board(): BoardState {
        const game = this.gameObject
        const cellSize = game.get('cellSize')!.innerNumber
        const boardGround = game.get('boardGround')?.innerString
        const ground = game.get('ground')!.innerString
        const width = game.get('width')!.innerNumber
        const height = game.get('height')!.innerNumber
        return { cellSize, boardGround, ground, width, height }
    }

    get visuals(): VisualState[] {
        const visuals = this.gameObject.get('visuals')?.innerCollection ?? []
        return visuals.map(visual => visualState(this.interpreter, visual))
    }

    get canvasResolution() { return canvasResolution(this.interpreter) }

    get soundStates() {
        const soundInstances = this.interpreter.object('wollok.game.game').get('sounds')?.innerCollection ?? []
        return soundInstances.map(soundInstance => ({
            id: soundInstance.id,
            file: soundInstance.get('file')!.innerString!,
            status: soundInstance.get('status')!.innerString! as SoundStatus,
            volume: soundInstance.get('volume')!.innerNumber!,
            loop: soundInstance.get('loop')!.innerBoolean!,
        })
        )
    }

    queueEvent(...events: string[]) {
        queueEvent(this.interpreter, ...events.map(code => buildKeyPressEvent(this.interpreter, code)))
    }
    flushEvents(ms: number) {
        flushEvents(this.interpreter, ms)
    }
    step(sketch: p5, gameState: GameState) {
        step({ ...gameState, sketch, game: this })
    }

    private get gameObject() { return this.interpreter.object('wollok.game.game') }
}

export class SocketGame implements Game {
    socket: Socket

    board: BoardState
    images: MediaFile[];
    sounds: MediaFile[];

    visuals: VisualState[] = []
    soundStates: SoundState[] = []

    running = false

    constructor(socket: Socket) {
        this.socket = socket

        socket.on('board', data => this.board = data)
        socket.on('visuals', data => this.visuals = data)
        socket.on('soundStates', data => this.soundStates = data)

        socket.on("images", (imgs: Asset[]) => {
            imgs.forEach(({ name, url }) =>
                this.images.push({ possiblePaths: [name], url })
            )
        })
        socket.on("sounds", (sounds: Asset[]) => {
            sounds.forEach(({ name, url }) =>
                this.sounds.push({ possiblePaths: [name], url })
            )
        })

        socket.on("error", data => console.log(data))
    }

    start(canvasParent?: Element) {
        this.socket.emit("start")
        this.running = true
        return new p5(sketch(this, this.images, this.sounds, canvasParent))
    }

    get canvasResolution() {
        const { cellSize, width, height } = this.board
        return {
            width: round(width) * cellSize,
            height: round(height) * cellSize,
        }
    }

    queueEvent(...events: string[]) {
        this.socket.emit("keyPressed", events)
    }
    flushEvents(ms: number): void {
        // Do nothing, already managed by the server
    }
    step(sketch: p5, gameState: GameState) {
        step({ ...gameState, sketch, game: this })
    }

}

export default Game