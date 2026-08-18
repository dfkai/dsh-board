import { describe, expect, it } from 'vitest'
import { applyCostProjection, costOf } from '../../src/host/cost-projection.ts'

const BEFORE = Date.UTC(2026, 7, 16, 12, 0) // 标准价
const OFFPEAK = Date.UTC(2026, 7, 17, 0, 30) // 北京 08:30 闲时
const PEAK = Date.UTC(2026, 7, 17, 1, 30) // 北京 09:30 高峰
const usage = { inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 0, cacheWriteTokens: 0 }

describe('applyCostProjection', () => {
  it('prices each event at its own moment (standard vs peak)', () => {
    const s0 = applyCostProjection({ cost: 0, model: 'deepseek-v4-pro', last: null }, {
      type: 'assistant/chunk', time: BEFORE, data: { turn: 1, step: 1, chunk: { type: 'usage', usage } },
    })
    const s1 = applyCostProjection(s0, {
      type: 'assistant/chunk', time: PEAK, data: { turn: 2, step: 1, chunk: { type: 'usage', usage } },
    })
    // 标准: (1M miss ×3 + 1M out ×6)/1M = 9；高峰: (9 + 27) = 36
    expect(s1.cost).toBeCloseTo(45)
  })

  it('replaces the same-step chunk with the final message', () => {
    const s0 = applyCostProjection({ cost: 0, model: 'deepseek-v4-pro', last: null }, {
      type: 'assistant/chunk', time: PEAK, data: { turn: 1, step: 1, chunk: { type: 'usage', usage } },
    })
    const s1 = applyCostProjection(s0, {
      type: 'assistant/message', time: PEAK, data: { turn: 1, step: 1, usage },
    })
    expect(s1.cost).toBeCloseTo(36) // 只计一次
  })

  it('follows the model from request headers', () => {
    let s = { cost: 0, model: '', last: null as null | { turn: number; step: number; delta: number } }
    s = applyCostProjection(s, { type: 'request/header', data: { header: { config: { model: 'deepseek-v4-flash' } } } })
    s = applyCostProjection(s, { type: 'assistant/chunk', time: OFFPEAK, data: { turn: 1, step: 1, chunk: { type: 'usage', usage } } })
    // flash 闲时: (1.5 + 4.5) = 6
    expect(s.cost).toBeCloseTo(6)
  })

  it('folds reasoning into output', () => {
    expect(costOf({ outputTokens: 100, reasoningTokens: 50 }, 'deepseek-v4-pro', BEFORE)).toBeCloseTo((150 * 6) / 1_000_000)
  })
})
