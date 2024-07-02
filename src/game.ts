import p5 from "p5"
import { Environment, Id, Interpreter, WRENatives, buildEnvironment, interpret } from 'wollok-ts'
import { GameProject, getProgramIn } from "./gameProject"
import { GameSound } from "./gameSound"
import { step } from "./render"
import sketch from "./sketch"
import { VisualState, buildKeyPressEvent, canvasResolution, queueEvent, visualState } from "./utils"

interface GameState {
    images: Map<string, p5.Image>
    sounds: Map<Id, GameSound>
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

class Game {
    environment: Environment
    project: GameProject
    interpreter: Interpreter

    constructor(project: GameProject) {
        this.project = project
        this.environment = buildEnvironment(project.sources)
        this.interpreter = interpret(this.environment, WRENatives)
    }

    get images() { return this.project.images }
    get running() { return this.gameObject.get('running')!.innerBoolean! }

    board(): BoardState {
        const game = this.gameObject
        const cellSize = game.get('cellSize')!.innerNumber
        const boardGround = game.get('boardGround')?.innerString
        const ground = game.get('ground')!.innerString
        const width = game.get('width')!.innerNumber
        const height = game.get('height')!.innerNumber
        return { cellSize, boardGround, ground, width, height }
    }

    visuals(): VisualState[] {
        const visuals = this.gameObject.get('visuals')?.innerCollection ?? []
        return visuals.map(visual => visualState(this.interpreter, visual))
    }

    start(canvasParent?: Element) {
        this.interpreter.exec(getProgramIn(this.project.main, this.environment))
        return new p5(sketch(this, canvasParent))
    }

    canvasResolution() { return canvasResolution(this.interpreter) }
    queueEvent(...events: string[]) {
        queueEvent(this.interpreter, ...events.map(code => buildKeyPressEvent(this.interpreter, code)))
    }
    step(sketch: p5, gameState: GameState) {
        step({ ...gameState, sketch, game: this })
    }

    private get gameObject() { return this.interpreter.object('wollok.game.game') }
}

export default Game