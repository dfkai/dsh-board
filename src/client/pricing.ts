/**
 * Price tables — ¥ per 1M tokens, from the official price list
 * https://api-docs.deepseek.com/zh-cn/quick_start/pricing
 * (fetched 2026-08-15; re-checked 2026-08-17 — the page now lists the
 * peak/off-peak tables as the primary price list, numbers unchanged).
 *
 * - MODEL_PRICES: standard prices, in force until the peak/off-peak scheme
 *   activates (2026-08-17 00:00 Beijing) and still needed for older usage.
 * - PEAK_PRICES / OFF_PEAK_PRICES: effective 2026-08-17 00:00 Beijing time;
 *   peak windows are 09:00–12:00 and 14:00–18:00 Beijing time, off-peak is
 *   half of peak. `priceFor(model, now)` picks the right table automatically.
 *
 * Estimates only — not a billing source.
 */
export interface ModelPrice {
  cacheHitPerM: number
  cacheMissPerM: number
  outputPerM: number
}

export const MODEL_PRICES: Record<string, ModelPrice> = {
  'deepseek-v4-pro': { cacheHitPerM: 0.025, cacheMissPerM: 3, outputPerM: 6 },
  'deepseek-v4-flash': { cacheHitPerM: 0.02, cacheMissPerM: 1, outputPerM: 2 },
  // Legacy list prices, kept for older sessions.
  'deepseek-chat': { cacheHitPerM: 0.5, cacheMissPerM: 2, outputPerM: 8 },
  'deepseek-reasoner': { cacheHitPerM: 1, cacheMissPerM: 4, outputPerM: 16 },
}

/** Effective 2026-08-17: peak/off-peak scheme (off-peak is half of peak). */
export const PEAK_PRICES: Record<string, ModelPrice> = {
  'deepseek-v4-pro': { cacheHitPerM: 0.3, cacheMissPerM: 9, outputPerM: 27 },
  'deepseek-v4-flash': { cacheHitPerM: 0.1, cacheMissPerM: 3, outputPerM: 9 },
}

export const OFF_PEAK_PRICES: Record<string, ModelPrice> = {
  'deepseek-v4-pro': { cacheHitPerM: 0.15, cacheMissPerM: 4.5, outputPerM: 13.5 },
  'deepseek-v4-flash': { cacheHitPerM: 0.05, cacheMissPerM: 1.5, outputPerM: 4.5 },
}

/** Fallback model when a session's model is unknown. */
export const DEFAULT_MODEL = 'deepseek-v4-pro'

/** Effective moment of the peak/off-peak scheme: 2026-08-17 00:00 Beijing time. */
const EFFECTIVE_AT_MS = Date.UTC(2026, 7, 16, 16)

/** Peak windows in Beijing time: 09:00–12:00 and 14:00–18:00 (rest = off-peak). */
export function isPeakHour(nowMs = Date.now()): boolean {
  const beijingHour = (new Date(nowMs).getUTCHours() + 8) % 24
  return (beijingHour >= 9 && beijingHour < 12) || (beijingHour >= 14 && beijingHour < 18)
}

/** The price table for a model id at a given moment (peak/off-peak aware). */
export function priceFor(model: string | undefined, nowMs = Date.now()): ModelPrice {
  const modelId = model ?? DEFAULT_MODEL
  if (nowMs >= EFFECTIVE_AT_MS) {
    const table = isPeakHour(nowMs) ? PEAK_PRICES : OFF_PEAK_PRICES
    // Unknown models follow the DEFAULT_MODEL rate of the SAME moment's table,
    // never the pre-2026-08-17 standard prices.
    return table[modelId] ?? table[DEFAULT_MODEL]
  }
  return MODEL_PRICES[modelId] ?? MODEL_PRICES[DEFAULT_MODEL]
}

export interface BillingUsage {
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

/** Number.isFinite guard for wire counts that may be missing or corrupt. */
function finite(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

/** Estimate a session's cost from its durable tokenUsage projection. */
export function estimateCost(usage: BillingUsage, price: ModelPrice = priceFor(undefined)): number {
  const miss = finite(usage.uncachedInputTokens) + finite(usage.cacheWriteTokens)
  return miss * price.cacheMissPerM / 1_000_000
    + finite(usage.cacheReadTokens) * price.cacheHitPerM / 1_000_000
    + finite(usage.outputTokens) * price.outputPerM / 1_000_000
}
