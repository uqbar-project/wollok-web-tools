import { should, use } from 'chai'
import { buildEnvironment, DynamicDiagramElement, Evaluation, getDynamicDiagramData, interprete, Interpreter, REPL, WRENatives } from 'wollok-ts'
import { diagramAssertions } from './diagram-assertions'
import { getDataDiagram } from '../../src/dynamicDiagram/diagram-generator'

use(diagramAssertions)
should()

describe('Dynamic diagram', () => {
  let interpreter: Interpreter
  let objects: DynamicDiagramElement[]

  describe('basic definition without imports', () => {

    beforeEach(async () => {
      const replEnvironment = buildEnvironment([{
        name: REPL, content: `
  object bobbyTheShark {
    const fixedValue = "Fixed"
    var name = "Bobby"
    var age = 5
    var property friend = george
    var property born = new Date(day = 14, month = 2, year = 1971)
    var property isHappy = true
    var property range1 = new Range(start = 2, end = 11)
    var property range2 = new Range(start = 2, end = 14, step = 5)
    var property aClosure = { 5 + 2 }
    var property someObject =  object { var property j = 1 }
    var property aPair = new Pair(x = 2, y = 1)
    var property dictionary = new Dictionary()
    var property bird = new Bird()
  
    method label() = fixedValue + " " + name
  
    method restart() {
        name = ""
        age = 0
    }
  }
  
  object george {
    var property colors = ["blue", "orange", "grey"]
    var property colorsAsSet = #{"blue", "orange", "grey"}
  }
  
  class Bird {
    var property energy = 100
    var property friend = bobbyTheShark
  }
        `,
      }])
      interpreter = new Interpreter(Evaluation.build(replEnvironment, WRENatives))
      objects = getDynamicDiagramData(interpreter)
    })

    it('should include WKOs', () => {
      getDataDiagram(objects).should
        .include.nodeWith({ type: 'object', label: 'george' }).and.to
        .include.nodeWith({ type: 'object', label: 'bobbyTheShark' })
    })

    it('should include edges between WKOs', () => {
      getDataDiagram(objects).should.connect('friend', 'bobbyTheShark', 'george')
    })

    it('should include edges between WKOs and custom classes', () => {
      getDataDiagram(objects).should.connect('bird', 'bobbyTheShark', 'Bird')
    })

    it('should include edges between WKOs and literal attributes', () => {
      getDataDiagram(objects).should.connect('age', 'bobbyTheShark', '5')
        .and.to.connect('name', 'bobbyTheShark', '"Bobby"')
        .and.to.connect('born', 'bobbyTheShark', '2/14/1971')
        .and.to.connect('isHappy', 'bobbyTheShark', 'true')
        .and.to.connect('range1', 'bobbyTheShark', '2..11')
        .and.to.connect('range2', 'bobbyTheShark', '[2, 7, 12]')
        .and.to.connect('aClosure', 'bobbyTheShark', '{ 5 + 2 }')
        .and.to.connect('someObject', 'bobbyTheShark', 'Object')
        .and.to.connect('dictionary', 'bobbyTheShark', 'a Dictionary []')
    })

    it('should include edges with extra info for constants', () => {
      getDataDiagram(objects).should.connect('fixedValue🔒', 'bobbyTheShark', '"Fixed"')
    })

    it('should include edges between classes and literal attributes', () => {
      getDataDiagram(objects).should.connect('energy', 'Bird', '100')
    })

    it('should resolve circular references successfully', () => {
      getDataDiagram(objects).should.connect('friend', 'Bird', 'bobbyTheShark')
        .and.to.connect('bird', 'bobbyTheShark', 'Bird')
    })

    it('should include the REPL object', () => {
      interprete(interpreter, 'var x')
      objects = getDynamicDiagramData(interpreter)
      getDataDiagram(objects).should.include.nodeWith({ label: 'REPL', type: 'REPL' })
    })

    it('should include edges between REPL and WKOs', () => {
      interprete(interpreter, 'var x')
      objects = getDynamicDiagramData(interpreter)
      getDataDiagram(objects).should.connect('x', 'REPL', 'null', 1.5)
    })

    it('should include constant edges between REPL and WKOs', () => {
      interprete(interpreter, 'const x = 7')
      objects = getDynamicDiagramData(interpreter)
      getDataDiagram(objects).should.connect('x🔒', 'REPL', '7', 1.5)
    })

    it('should have a specific type for null object', () => {
      interprete(interpreter, 'var x')
      objects = getDynamicDiagramData(interpreter)
      getDataDiagram(objects).should.include.nodeWith({ label: 'null', type: 'null' })
    })

    it('should include lists and their elements', () => {
      getDataDiagram(objects).should
        .include.nodeWith({ type: 'literal', label: 'List' }).and.to
        .include.nodeWith({ type: 'literal', label: '"blue"' }).and.to
        .include.nodeWith({ type: 'literal', label: '"orange"' }).and.to
        .include.nodeWith({ type: 'literal', label: '"grey"' }).and.to
        .connect('0', 'List', '"blue"', 1, 'dotted').and.to
        .connect('1', 'List', '"orange"', 1, 'dotted').and.to
        .connect('2', 'List', '"grey"', 1, 'dotted')
    })

    it('should include sets and their elements', () => {
      getDataDiagram(objects).should
        .include.nodeWith({ type: 'literal', label: 'Set' }).and.to
        .include.nodeWith({ type: 'literal', label: '"blue"' }).and.to
        .include.nodeWith({ type: 'literal', label: '"orange"' }).and.to
        .include.nodeWith({ type: 'literal', label: '"grey"' }).and.to
        .connect('', 'Set', '"blue"', 1, 'dotted').and.to
        .connect('', 'Set', '"orange"', 1, 'dotted').and.to
        .connect('', 'Set', '"grey"', 1, 'dotted')
    })

  })

  describe('definition with imports', () => {

    beforeEach(async () => {
      const replEnvironment = buildEnvironment([{
        name: 'imported/partially', content: `
  object d { }

  object e { }`,
      }, {
        name: 'imported/fully', content: `
  import partially.* // should be ignored in the tests
  
  object b { }
  
  object c { }`,
      }, {
        name: REPL, content: `
  import imported.fully.*
  import imported.partially.d

  object a { }
        `,
      }])
      interpreter = new Interpreter(Evaluation.build(replEnvironment, WRENatives))
      objects = getDynamicDiagramData(interpreter)
    })


    it('should only include imported WKOs', async () => {
      const dataDiagram = getDataDiagram(objects)
      dataDiagram.should
        .include.nodeWith({ type: 'object', label: 'a' }).and.to
        .include.nodeWith({ type: 'object', label: 'b' }).and.to
        .include.nodeWith({ type: 'object', label: 'c' }).and.to
        .include.nodeWith({ type: 'object', label: 'd' })
      dataDiagram.filter(_ => _.data.type == 'object' ).should.have.length(4)
    })

  })

})