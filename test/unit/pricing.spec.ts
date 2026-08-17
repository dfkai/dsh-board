import { describe, expect, it } from 'vitest'
import { currentRate, DEFAULT_MODEL, MODEL_PRICES, OFF_PEAK_PRICES, PEAK_PRICES, estimateCost, isPeakHour, priceFor } from '../../src/client/pricing.ts'

// EFFECTIVE_AT_MS = 2026-08-17 00:00 Beijing = 2026-08-16T16:00Z
const BEFORE = Date.UTC(2026, 7, 16, 15, 59)
const AFTER_OFFPEAK = Date.UTC(2026, 7, 16, 20, 0) // 北京 04:00
const AFTER_PEAK = Date.UTC(2026, 7, 17, 1, 30) // 北京 09:30

describe('priceFor', () => {
  it('uses standard prices before the effective moment', () => {
    expect(priceFor('deepseek-v4-pro', BEFORE)).toEqual(MODEL_PRICES['deepseek-v4-pro'])
    expect(priceFor('deepseek-v4-flash', BEFORE)).toEqual(MODEL_PRICES['deepseek-v4-flash'])
  })

  it('switches to peak/off-peak after the effective moment', () => {
    expect(priceFor('deepseek-v4-pro', AFTER_OFFPEAK)).toEqual(OFF_PEAK_PRICES['deepseek-v4-pro'])
    expect(priceFor('deepseek-v4-pro', AFTER_PEAK)).toEqual(PEAK_PRICES['deepseek-v4-pro'])
    expect(priceFor('deepseek-v4-flash', AFTER_OFFPEAK)).toEqual(OFF_PEAK_PRICES['deepseek-v4-flash'])
    expect(priceFor('deepseek-v4-flash', AFTER_PEAK)).toEqual(PEAK_PRICES['deepseek-v4-flash'])
  })

  it('off-peak is exactly half of peak (official scheme)', () => {
    for (const model of ['deepseek-v4-pro', 'deepseek-v4-flash'] as const) {
      expect(OFF_PEAK_PRICES[model].cacheHitPerM).toBeCloseTo(PEAK_PRICES[model].cacheHitPerM / 2)
      expect(OFF_PEAK_PRICES[model].cacheMissPerM).toBeCloseTo(PEAK_PRICES[model].cacheMissPerM / 2)
      expect(OFF_PEAK_PRICES[model].outputPerM).toBeCloseTo(PEAK_PRICES[model].outputPerM / 2)
    }
  })

  it('unknown models follow the DEFAULT_MODEL rate of the same moment table', () => {
    expect(priceFor('some-unknown-model', BEFORE)).toEqual(MODEL_PRICES[DEFAULT_MODEL])
    expect(priceFor('some-unknown-model', AFTER_PEAK)).toEqual(PEAK_PRICES[DEFAULT_MODEL])
  })
})

describe('isPeakHour', () => {
  it('maps Beijing windows from UTC', () => {
    expect(isPeakHour(Date.UTC(2026, 7, 17, 1, 30))).toBe(true) // 09:30
    expect(isPeakHour(Date.UTC(2026, 7, 17, 4, 0))).toBe(false) // 12:00
    expect(isPeakHour(Date.UTC(2026, 7, 17, 7, 0))).toBe(true) // 15:00
    expect(isPeakHour(Date.UTC(2026, 7, 17, 10, 0))).toBe(false) // 18:00
    expect(isPeakHour(Date.UTC(2026, 7, 16, 20, 0))).toBe(false) // 04:00
  })
})

describe('estimateCost', () => {
  const usage = { uncachedInputTokens: 1_000_000, cacheWriteTokens: 500_000, cacheReadTokens: 10_000_000, outputTokens: 2_000_000 }
  const price = { cacheHitPerM: 0.1, cacheMissPerM: 1, outputPerM: 2 }

  it('bills miss+write at miss rate, reads at hit rate, output at output rate', () => {
    expect(estimateCost(usage, price)).toBeCloseTo(1.5 * 1 + 10 * 0.1 + 2 * 2)
  })

  it('guards NaN/Infinity buckets as zero', () => {
    expect(estimateCost({ uncachedInputTokens: NaN, cacheWriteTokens: Infinity, cacheReadTokens: 0, outputTokens: 0 } as never, price)).toBe(0)
  })
})

describe('currentRate', () => {
  it('reports the flat rate before the effective moment', () => {
    const r = currentRate('deepseek-v4-pro', Date.UTC(2026, 7, 16, 12, 0))
    expect(r.window).toBe('standard')
    expect(r.price).toEqual(MODEL_PRICES['deepseek-v4-pro'])
  })

  it('reports peak/off-peak with the right table after it', () => {
    expect(currentRate('deepseek-v4-pro', Date.UTC(2026, 7, 17, 1, 30)).window).toBe('peak')
    expect(currentRate('deepseek-v4-pro', Date.UTC(2026, 7, 17, 1, 30)).price).toEqual(PEAK_PRICES['deepseek-v4-pro'])
    expect(currentRate('deepseek-v4-flash', Date.UTC(2026, 7, 16, 20, 0)).window).toBe('offpeak')
    expect(currentRate('deepseek-v4-flash', Date.UTC(2026, 7, 16, 20, 0)).price).toEqual(OFF_PEAK_PRICES['deepseek-v4-flash'])
  })
})
