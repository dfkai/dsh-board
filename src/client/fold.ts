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
        chunk?: { type?: string; usage?: { inputTokens?: number; outputTokens?: number; cacheReadTokens?: number } }
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
    const input = chunk.usage?.inputTokens ?? 0
    const output = chunk.usage?.outputTokens ?? 0
    const cacheRead = chunk.usage?.cacheReadTokens ?? 0

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

/** Compact token count with 万/亿 for the big numbers, K/M below. */
export function formatTokens(n: number): string {
  if (n < 1000) return String(Math.round(n))
  if (n < 1_000_000) return `${Math.round(n / 100) / 10}K`
  if (n < 100_000_000) return `${Math.round(n / 100) / 10}万`
  return `${Math.round(n / 10_000_000) / 10}亿`
}

/** Compact cost display. */
export function formatCost(cost: number): string {
  if (cost <= 0) return '¥0'
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
