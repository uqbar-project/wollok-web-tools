import { should } from 'chai'
import { buildEnvironment, interpret, Interpreter, WRENatives } from 'wollok-ts'
import { buildDoubleClickedEvent, buildKeyPressEvent, buildKeyReleaseEvent, buildMouseClickedEvent, pixelsToPosition, positionToPixels, visualState } from '../../src/game/utils.js'

should()

describe('Game', () => {

  it('converts board-cell positions back into pixel coordinates', () => {
    const pixels = positionToPixels({ x: 2, y: 0 }, 100, 10)
    pixels.should.deep.equal({ x: 20, y: 100 })
  })

  it('converts cursor pixels into board-cell positions', () => {
    const board = { cellSize: 10, width: 10, height: 10 }
    pixelsToPosition(0, 1, board, 100).should.deep.equal({ x: 0, y: 9 })
    pixelsToPosition(10, 1, board, 100).should.deep.equal({ x: 1, y: 9 })
    pixelsToPosition(10, 11, board, 100).should.deep.equal({ x: 1, y: 8 })
    pixelsToPosition(0, 11, board, 100).should.deep.equal({ x: 0, y: 8 })
  })

  describe('visual state', () => {
    let interpreter: Interpreter

    beforeEach(() => {
      const environment = buildEnvironment([{
        name: 'main.wlk', content: `
          import wollok.game.*
          object enCelda { method position() = game.at(2, 3)  method image() = "pepita.png" }
          object conDecimales { method position() = game.at(1.4, 2.6) }
          object negativo { method position() = game.at(-1.6, -0.4) }
          object mutable { const property position = new MutablePosition(x = 4.5, y = 1.2) }
          object centrado { method position() = game.center() }
          object conTexto { method position() = game.origin()  method text() = "hola"  method textColor() = "FF0000" }
        `,
      }])
      interpreter = interpret(environment, WRENatives)
    })

    const stateOf = (name: string) => visualState(interpreter, interpreter.object(`main.${name}`))

    it('takes the position and the image of the visual', () => {
      stateOf('enCelda').should.deep.include({ image: 'pepita.png', position: { x: 2, y: 3 } })
    })

    it('rounds the position to a board cell', () => {
      stateOf('conDecimales').position.should.deep.equal({ x: 1, y: 3 })
      stateOf('negativo').position.x.should.equal(-2)
      Math.abs(stateOf('negativo').position.y).should.equal(0)
      stateOf('mutable').position.should.deep.equal({ x: 5, y: 1 })
    })

    it('works with positions whose coordinates are computed by a method', () => {
      const game = interpreter.object('wollok.game.game')
      const xCenter = interpreter.send('xCenter', game)!.innerNumber!
      const yCenter = interpreter.send('yCenter', game)!.innerNumber!
      stateOf('centrado').position.should.deep.equal({ x: Math.round(xCenter), y: Math.round(yCenter) })
    })

    it('takes the text and its color', () => {
      stateOf('conTexto').should.deep.include({ text: 'hola', textColor: 'FF0000', position: { x: 0, y: 0 } })
    })
  })

  describe('events', () => {
    let interpreter: Interpreter

    beforeEach(() => {
      const environment = buildEnvironment([{ name: 'main.wlk', content: 'object a {}' }])
      interpreter = interpret(environment, WRENatives)
    })

    it('builds a mouse clicked event with a board-cell position', () => {
      const [name, position] = buildMouseClickedEvent(interpreter, { x: 2, y: 0 })
      name.innerString!.should.deep.equal('mouseclick')
      position.get('x')!.innerNumber!.should.deep.equal(2)
      position.get('y')!.innerNumber!.should.deep.equal(0)
    })

    it('builds a double clicked event with a board-cell position', () => {
      const [name, position] = buildDoubleClickedEvent(interpreter, { x: 1, y: 3 })
      name.innerString!.should.deep.equal('doubleclick')
      position.get('x')!.innerNumber!.should.deep.equal(1)
      position.get('y')!.innerNumber!.should.deep.equal(3)
    })

    it('builds a key press event with the pressed key', () => {
      const event = buildKeyPressEvent(interpreter, 'KeyA')
      const values = event.map(entry => entry.innerString)
      values.should.deep.equal(['keypress', 'KeyA'])
    })

    it('builds a key release event with the released key', () => {
      const event = buildKeyReleaseEvent(interpreter, 'KeyA')
      const values = event.map(entry => entry.innerString)
      values.should.deep.equal(['keyrelease', 'KeyA'])
    })
  })
})