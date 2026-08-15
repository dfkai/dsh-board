/**
 * Price tables — ¥ per 1M tokens, from the official price list
 * https://api-docs.deepseek.com/zh-cn/quick_start/pricing (fetched 2026-08-15).
 *
 * - MODEL_PRICES: the listed standard prices today (thinking-mode inclusive).
 * - PEAK_PRICES / OFF_PEAK_PRICES: the new scheme effective 2026-08-17
 *   (off-peak is half of peak). dsh-rich estimates with the standard table
 *   until the peak-hours window is configured here.
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

export interface BillingUsage {
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

/** The price table for a model id, falling back to the default model. */
export function priceFor(model: string | undefined): ModelPrice {
  return MODEL_PRICES[model ?? ''] ?? MODEL_PRICES[DEFAULT_MODEL]
}

/** Estimate a session's cost from its durable tokenUsage projection. */
export function estimateCost(usage: BillingUsage, price: ModelPrice = priceFor(undefined)): number {
  return (usage.uncachedInputTokens + usage.cacheWriteTokens) * price.cacheMissPerM / 1_000_000
    + usage.cacheReadTokens * price.cacheHitPerM / 1_000_000
    + usage.outputTokens * price.outputPerM / 1_000_000
}
