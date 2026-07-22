import { should } from 'chai'
import { buildEnvironment, interpret, Interpreter, WRENatives } from 'wollok-ts'
import { buildDoubleClickedEvent, buildKeyPressEvent, buildKeyReleaseEvent, buildMouseClickedEvent, pixelsToPosition, positionToPixels } from '../../src/game/utils.js'

should()

describe('Game', () => {
  
  it('converts board-cell positions back into pixel coordinates', () => {
    const pixels = positionToPixels({ x: 2, y: 0 }, 100, 10)
    pixels.should.deep.equal({ x: 20, y: 90 })
  })

  it('converts cursor pixels into board-cell positions', () => {
    const board = { cellSize: 10, width: 10, height: 10 }
    pixelsToPosition(0, 1, board, 100).should.deep.equal({ x: 0, y: 9 })
    pixelsToPosition(10, 1, board, 100).should.deep.equal({ x: 1, y: 9 })
    pixelsToPosition(10, 11, board, 100).should.deep.equal({ x: 1, y: 8 })
    pixelsToPosition(0, 11, board, 100).should.deep.equal({ x: 0, y: 8 })
  })

  describe("events", () => {
    let interpreter: Interpreter

    beforeEach(() => {
      const environment = buildEnvironment([{ name: 'main.wlk', content: 'object a {}' }])
      interpreter = interpret(environment, WRENatives)
    })

    it('builds a mouse clicked event with a board-cell position', () => {
      const event = buildMouseClickedEvent(interpreter, { x: 2, y: 0 })
      const values = event.innerCollection!.map(entry => entry.innerString ?? entry.innerNumber)

      values.should.deep.equal(['mouseclick', 2, 0])
    })

    it('builds a double clicked event with a board-cell position', () => {
      const event = buildDoubleClickedEvent(interpreter, { x: 1, y: 3 })
      const values = event.innerCollection!.map(entry => entry.innerNumber ?? entry.innerString)

      values.should.deep.equal(['doubleclick', 1, 3])
    })


    it('builds a key press event with the pressed key', () => {
      const event = buildKeyPressEvent(interpreter, 'KeyA')
      const values = event.innerCollection!.map(entry => entry.innerString)
      values.should.deep.equal(['keypress', 'KeyA'])
    })

    it('builds a key release event with the released key', () => {
      const event = buildKeyReleaseEvent(interpreter, 'KeyA')
      const values = event.innerCollection!.map(entry => entry.innerString)
      values.should.deep.equal(['keyrelease', 'KeyA'])
    })
  })
})