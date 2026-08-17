import { describe, expect, it } from 'vitest'
import { LEVELS, rankFor } from '../../src/client/levels.ts'

describe('rankFor', () => {
  it('picks the highest level whose floor the total meets', () => {
    expect(rankFor(0).level).toBe(LEVELS[0])
    expect(rankFor(9_999).level).toBe(LEVELS[0])
    expect(rankFor(10_000).level).toBe(LEVELS[1])
    expect(rankFor(10_000_000).level.zh).toBe('万词王')
    expect(rankFor(299_999_999).level).toBe(LEVELS[5])
  })

  it('exposes the next level or null at max', () => {
    expect(rankFor(0).next).toBe(LEVELS[1])
    expect(rankFor(1_000_000_000_000).next).toBeNull()
  })
})
