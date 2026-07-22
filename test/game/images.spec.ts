import { expect } from 'chai'
import BASE64_IMAGES from '../../src/game/images.js'

describe('Built-in game images', () => {
  it('uses extensionless names', () => {
    expect([...BASE64_IMAGES.keys()], 'built-in image keys must not include .png').to.deep.equal([
      'wko',
      'ground',
      'speech',
      'speech2',
      'speech3',
      'speech4',
    ])
  })
})
