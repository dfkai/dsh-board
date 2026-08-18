/**
 * Host-side session projection: the estimated cost of the session, priced
 * per usage event at THAT event's own moment.
 *
 * The platform bills each request at its request time; a client that prices
 * a whole session at its last-activity moment re-prices history whenever the
 * peak/off-peak window flips. Every session event carries `time` (Unix ms),
 * so this fold accumulates each usage sample at the rate table in force at
 * its own timestamp — the same per-request口径 as the official bill.
 */
import { z } from 'zod'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { estimateCost, priceFor } from '../pricing.ts'

export interface CostState {
  cost: number
  model: string
  last: { turn: number; step: number; delta: number } | null
}

interface UsageEventLike {
  type?: string
  time?: number
  data?: {
    turn?: number
    step?: number
    header?: { config?: { model?: string } }
    chunk?: { type?: string; usage?: UsageBucketsLike }
    usage?: UsageBucketsLike
  }
}
interface UsageBucketsLike {
  inputTokens?: number
  outputTokens?: number
  reasoningTokens?: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}

function finite(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

/** Cost of one usage sample at one moment, for one model. */
export function costOf(usage: UsageBucketsLike | undefined, model: string, timeMs: number): number {
  if (usage === undefined) return 0
  // DeepSeek bills reasoning at the output rate — fold it into output.
  return estimateCost({
    uncachedInputTokens: finite(usage.inputTokens),
    cacheReadTokens: finite(usage.cacheReadTokens),
    cacheWriteTokens: finite(usage.cacheWriteTokens),
    outputTokens: finite(usage.outputTokens) + finite(usage.reasoningTokens),
  }, priceFor(model === '' ? undefined : model, timeMs))
}

/** Pure transition over one committed event. */
export function applyCostProjection(state: CostState, event: UsageEventLike): CostState {
  if (event?.type === 'request/header') {
    const model = event.data?.header?.config?.model
    if (typeof model === 'string' && model !== '' && model !== state.model) {
      return { ...state, model }
    }
    return state
  }
  const chunk = event?.type === 'assistant/chunk' ? event.data?.chunk : undefined
  const usage = event?.type === 'assistant/chunk'
    ? chunk?.type === 'usage' ? chunk.usage : undefined
    : event?.type === 'assistant/message' ? event.data?.usage : undefined
  if (usage === undefined) return state
  const turn = event.data?.turn
  const step = event.data?.step
  if (turn === undefined || step === undefined) return state
  const delta = costOf(usage, state.model, finite(event.time))
  if (state.last !== null && state.last.turn === turn && state.last.step === step) {
    // The final message replaces the same-step chunk sample.
    return { ...state, cost: state.cost - state.last.delta + delta, last: { turn, step, delta } }
  }
  return { ...state, cost: state.cost + delta, last: { turn, step, delta } }
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Estimated billed cost, accumulated per usage event at its own moment. */
    sessionCost: number
  }
}

export const sessionCostProjectionDefinition: ProjectionDefinition<'sessionCost', CostState> = {
  key: 'sessionCost',
  schema: z.number(),
  init: () => ({ cost: 0, model: '', last: null }),
  apply: applyCostProjection,
  view: state => state.cost,
  stateVersion: 1,
}
