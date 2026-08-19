/**
 * Host-side session projection: token usage per local calendar day.
 *
 * The client used to attribute a session's WHOLE lifetime total to the day
 * of its last activity — so "today" swallowed the full history of any
 * session touched today. Every event carries `time`, so this fold buckets
 * each usage sample into the local-midnight key of its own day; the client
 * then sums across sessions for 本日/本周 and the heatmap.
 */
import { z } from 'zod'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'

export interface TokenDaysState {
  days: Record<string, number>
  last: { turn: number; step: number; day: string; delta: number } | null
}

interface UsageEventLike {
  type?: string
  time?: number
  data?: {
    turn?: number
    step?: number
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

/** Total tokens (input + output incl. reasoning) of one usage sample. */
export function tokenDeltaOf(usage: UsageBucketsLike | undefined): number {
  if (usage === undefined) return 0
  return finite(usage.inputTokens) + finite(usage.cacheReadTokens) + finite(usage.cacheWriteTokens)
    + finite(usage.outputTokens) + finite(usage.reasoningTokens)
}

/** Local-midnight key of a Unix-ms timestamp (same口径 as the client's today/week). */
export function dayKeyOf(timeMs: number): string {
  return String(new Date(timeMs).setHours(0, 0, 0, 0))
}

/** Pure transition over one committed event. */
export function applyTokenDays(state: TokenDaysState, event: UsageEventLike): TokenDaysState {
  const chunk = event?.type === 'assistant/chunk' ? event.data?.chunk : undefined
  const usage = event?.type === 'assistant/chunk'
    ? chunk?.type === 'usage' ? chunk.usage : undefined
    : event?.type === 'assistant/message' ? event.data?.usage : undefined
  if (usage === undefined) return state
  const turn = event.data?.turn
  const step = event.data?.step
  if (turn === undefined || step === undefined) return state
  const delta = tokenDeltaOf(usage)
  const day = dayKeyOf(finite(event.time))
  const days = { ...state.days }
  if (state.last !== null && state.last.turn === turn && state.last.step === step) {
    // The final message replaces the same-step chunk sample — move the delta.
    days[state.last.day] = (days[state.last.day] ?? 0) - state.last.delta
  }
  days[day] = (days[day] ?? 0) + delta
  return { days, last: { turn, step, day, delta } }
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Token totals keyed by local-midnight ms (stringified JSON keys). */
    tokenDays: Record<string, number>
  }
}

export const tokenDaysProjectionDefinition: ProjectionDefinition<'tokenDays', TokenDaysState> = {
  key: 'tokenDays',
  schema: z.record(z.string(), z.number()),
  init: () => ({ days: {}, last: null }),
  apply: applyTokenDays,
  view: state => state.days,
  stateVersion: 1,
}
