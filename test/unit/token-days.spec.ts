import { describe, expect, it } from 'vitest'
import { applyTokenDays, dayKeyOf, tokenDeltaOf } from '../../src/host/token-days-projection.ts'

const D1 = new Date(2026, 7, 16, 12, 0).getTime() // 本地 8-16 中午
const D2 = new Date(2026, 7, 17, 3, 0).getTime() // 本地 8-17 凌晨（跨天）

describe('tokenDeltaOf', () => {
  it('sums input, cache, output and reasoning', () => {
    expect(tokenDeltaOf({ inputTokens: 10, cacheReadTokens: 5, cacheWriteTokens: 2, outputTokens: 4, reasoningTokens: 3 })).toBe(24)
  })
  it('guards NaN as zero', () => {
    expect(tokenDeltaOf({ inputTokens: NaN })).toBe(0)
  })
})

describe('applyTokenDays', () => {
  const usage = { inputTokens: 100, outputTokens: 20 }

  it('buckets each event into its own local day', () => {
    let s = { days: {} as Record<string, number>, last: null as null | { turn: number; step: number; day: string; delta: number } }
    s = applyTokenDays(s, { type: 'assistant/chunk', time: D1, data: { turn: 1, step: 1, chunk: { type: 'usage', usage } } })
    s = applyTokenDays(s, { type: 'assistant/chunk', time: D2, data: { turn: 2, step: 1, chunk: { type: 'usage', usage } } })
    expect(s.days[dayKeyOf(D1)]).toBe(120)
    expect(s.days[dayKeyOf(D2)]).toBe(120)
  })

  it('replaces the same-step chunk with the final message', () => {
    let s = { days: {} as Record<string, number>, last: null as null | { turn: number; step: number; day: string; delta: number } }
    s = applyTokenDays(s, { type: 'assistant/chunk', time: D1, data: { turn: 1, step: 1, chunk: { type: 'usage', usage } } })
    s = applyTokenDays(s, { type: 'assistant/message', time: D1, data: { turn: 1, step: 1, usage } })
    expect(s.days[dayKeyOf(D1)]).toBe(120) // 只计一次
  })
})
