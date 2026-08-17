import { describe, expect, it } from 'vitest'
import { foldHistory, formatCost, formatTokens } from '../../src/client/fold.ts'

describe('formatTokens', () => {
  it('zh: 万/亿 with boundary-safe re-scaling', () => {
    expect(formatTokens(999, 'zh')).toBe('999')
    expect(formatTokens(999_949, 'zh')).toBe('999.9K')
    expect(formatTokens(999_950, 'zh')).toBe('100万') // not "1000K"
    expect(formatTokens(64_116_908, 'zh')).toBe('6411.7万')
    expect(formatTokens(99_999_999, 'zh')).toBe('1亿') // not "10000万"
    expect(formatTokens(1_000_000_000, 'zh')).toBe('10亿')
  })

  it('en: K/M/B', () => {
    expect(formatTokens(999_949, 'en')).toBe('999.9K')
    expect(formatTokens(1_000_000, 'en')).toBe('1M')
    expect(formatTokens(2_900_000_000, 'en')).toBe('2.9B')
  })

  it('guards NaN/negative as zero', () => {
    expect(formatTokens(NaN)).toBe('0')
    expect(formatTokens(-5)).toBe('0')
  })
})

describe('formatCost', () => {
  it('compact tiers', () => {
    expect(formatCost(0)).toBe('¥0')
    expect(formatCost(-1)).toBe('¥0')
    expect(formatCost(0.00005)).toBe('¥<0.0001')
    expect(formatCost(0.005)).toBe('¥0.0050')
    expect(formatCost(12.345)).toBe('¥12.35')
    expect(formatCost(NaN)).toBe('¥0')
  })
})

describe('foldHistory', () => {
  const ev = (type: string, data: unknown) => ({ event: { type, data } })

  it('folds cache writes into input and reasoning into output, once per step', () => {
    const fold = foldHistory([
      ev('request/header', { header: { config: { model: 'deepseek-v4-pro' } } }),
      ev('assistant/chunk', { turn: 1, chunk: { type: 'usage', usage: { inputTokens: 10, outputTokens: 4, reasoningTokens: 3, cacheReadTokens: 7, cacheWriteTokens: 2 } } }),
      ev('assistant/message', { turn: 1, usage: { inputTokens: 10, outputTokens: 4, reasoningTokens: 3, cacheReadTokens: 7, cacheWriteTokens: 2 } }),
    ])
    expect(fold.perTurn).toEqual([{ turn: 1, input: 12, output: 7, cacheRead: 7 }])
    expect(fold.perModel.get('deepseek-v4-pro')).toEqual({ input: 12, output: 7, cacheRead: 7 })
    expect(fold.cumulative).toEqual([7])
  })

  it('guards NaN wire values as zero', () => {
    const fold = foldHistory([
      ev('assistant/chunk', { turn: 1, chunk: { type: 'usage', usage: { inputTokens: NaN, outputTokens: Infinity } } }),
    ])
    expect(fold.perTurn[0]).toEqual({ turn: 1, input: 0, output: 0, cacheRead: 0 })
  })
})
