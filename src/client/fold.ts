/**
 * History folding and number formatting for the usage panel.
 *
 * The wire facts this module reads (verified against the live API):
 * - `request/header`: data.header.config.model — the model for subsequent steps
 * - `assistant/chunk` with data.chunk.type === 'usage': per-step
 *   { inputTokens, outputTokens, cacheReadTokens, reasoningTokens }
 */

export interface TurnUsage {
  turn: number
  input: number
  output: number
  cacheRead: number
}

export interface ModelUsage {
  input: number
  output: number
  cacheRead: number
}

/** Number.isFinite guard for optional wire counts. */
function finite(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export interface HistoryFold {
  perTurn: TurnUsage[]
  perModel: Map<string, ModelUsage>
  cumulative: number[]
}

/** Fold history events into per-turn, per-model, and cumulative series. */
export function foldHistory(entries: readonly { event: unknown }[]): HistoryFold {
  const perTurn = new Map<number, TurnUsage>()
  const perModel = new Map<string, ModelUsage>()
  let currentModel: string | null = null

  for (const entry of entries) {
    const event = entry.event as {
      type?: string
      data?: {
        turn?: number
        header?: { config?: { model?: string } }
        chunk?: { type?: string; usage?: { inputTokens?: number; outputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number; reasoningTokens?: number } }
      }
    }
    if (event?.type === 'request/header') {
      const model = event.data?.header?.config?.model
      if (typeof model === 'string' && model !== '') currentModel = model
      continue
    }
    if (event?.type !== 'assistant/chunk') continue
    const chunk = event.data?.chunk
    if (chunk?.type !== 'usage') continue
    const turn = event.data?.turn
    if (turn === undefined) continue
    // Cache writes are billable input — fold them in so per-turn/per-model
    // input matches the lifetime projection's input口径.
    const input = finite(chunk.usage?.inputTokens) + finite(chunk.usage?.cacheWriteTokens)
    // DeepSeek bills reasoning tokens at the OUTPUT rate; the wire reports
    // them separately from completion_tokens, so fold them back in.
    const output = finite(chunk.usage?.outputTokens) + finite(chunk.usage?.reasoningTokens)
    const cacheRead = finite(chunk.usage?.cacheReadTokens)

    const row = perTurn.get(turn) ?? { turn, input: 0, output: 0, cacheRead: 0 }
    row.input += input
    row.output += output
    row.cacheRead += cacheRead
    perTurn.set(turn, row)

    if (currentModel !== null) {
      const model = perModel.get(currentModel) ?? { input: 0, output: 0, cacheRead: 0 }
      model.input += input
      model.output += output
      model.cacheRead += cacheRead
      perModel.set(currentModel, model)
    }
  }

  const turns = [...perTurn.values()].sort((left, right) => left.turn - right.turn)
  const cumulative: number[] = []
  let running = 0
  for (const row of turns) {
    running += row.output
    cumulative.push(running)
  }
  return { perTurn: turns, perModel, cumulative }
}

/** UI language ids the panel formats numbers for. */
export type Lang = 'zh' | 'en'

/** Compact token count: zh uses 万/亿, en uses K/M/B; unit boundaries re-scale
 *  after rounding so 999 950 never renders as "1000K". */
export function formatTokens(n: number, lang: Lang = 'zh'): string {
  if (!Number.isFinite(n) || n < 0) n = 0
  if (n < 1000) return String(Math.round(n))
  if (lang !== 'zh') {
    if (n < 1_000_000) return `${Math.round(n / 100) / 10}K`
    if (n < 1_000_000_000) return `${Math.round(n / 100_000) / 10}M`
    return `${Math.round(n / 100_000_000) / 10}B`
  }
  if (n < 1_000_000) {
    const k = Math.round(n / 100) / 10
    return k >= 1000 ? `${k / 10}万` : `${k}K`
  }
  if (n < 100_000_000) {
    const w = Math.round(n / 1_000) / 10
    return w >= 10_000 ? `${Math.round(w / 1_000) / 10}亿` : `${w}万`
  }
  return `${Math.round(n / 10_000_000) / 10}亿`
}

/** Compact cost display. */
export function formatCost(cost: number): string {
  if (!Number.isFinite(cost) || cost <= 0) return '¥0'
  if (cost < 0.0001) return '¥<0.0001'
  if (cost < 0.01) return `¥${cost.toFixed(4)}`
  return `¥${cost.toFixed(2)}`
}

/** Compact duration display. */
export function formatDuration(ms: number): string {
  const s = ms / 1000
  if (s < 60) return `${Math.round(s * 10) / 10}s`
  const whole = Math.round(s)
  return `${Math.floor(whole / 60)}m${whole % 60}s`
}
