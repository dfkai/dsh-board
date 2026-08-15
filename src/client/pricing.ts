/**
 * Price table — ¥ per 1M tokens. Defaults mirror DeepSeek's public
 * deepseek-chat list prices; adjust to your plan here. Estimates only —
 * this plugin is not a billing source.
 */
export const PRICING = {
  inputPerM: 2,
  cacheHitPerM: 0.5,
  cacheWritePerM: 2,
  outputPerM: 8,
} as const

export interface BillingUsage {
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

/** Estimate the session cost from the durable tokenUsage projection. */
export function estimateCost(usage: BillingUsage): number {
  return (usage.uncachedInputTokens + usage.cacheWriteTokens) * PRICING.inputPerM / 1_000_000
    + usage.cacheReadTokens * PRICING.cacheHitPerM / 1_000_000
    + usage.outputTokens * PRICING.outputPerM / 1_000_000
}
