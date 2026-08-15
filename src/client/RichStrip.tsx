import { memo, type ReactNode } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ContextPressureProjection, TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'

/** Mirrors the `sessionStats` projection fields this strip shows. */
interface SessionStats {
  turns: number
  steps: number
  llmMs: number
  toolMs: number
  ttftMs: number
  ttftSteps: number
  decodeMs: number
  decodeTokens: number
}

export type RichStripProps = PropsRuntime<'conversation.input.dock'>

function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${Math.round(n / 100) / 10}K`
  return `${Math.round(n / 100_000) / 10}M`
}

function formatDuration(ms: number): string {
  const s = ms / 1000
  if (s < 60) return `${Math.round(s * 10) / 10}s`
  const whole = Math.round(s)
  return `${Math.floor(whole / 60)}m${whole % 60}s`
}

function Cell({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: string }): ReactNode {
  return (
    <div className="dsh-rich-cell" style={accent === undefined ? undefined : { '--accent': accent } as never}>
      <div className="dsh-rich-label">{label}</div>
      <div className="dsh-rich-value">{value}</div>
      {sub === undefined ? null : <div className="dsh-rich-sub">{sub}</div>}
    </div>
  )
}

/**
 * The monitor strip: a bottom panel above the composer, reading the durable
 * session projections (tokenUsage / contextPressure / sessionStats) through
 * the framework's per-session projection seat.
 */
export const RichStrip = memo(function RichStrip({ useProjection, sessionId }: RichStripProps) {
  const usage = useProjection('tokenUsage') as TokenUsageProjection | undefined
  const pressure = useProjection('contextPressure') as ContextPressureProjection | undefined
  const stats = useProjection('sessionStats') as SessionStats | undefined

  const inputTokens = usage === undefined
    ? 0
    : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
  const outputTokens = usage?.outputTokens ?? 0
  const showTokens = inputTokens > 0 || outputTokens > 0

  const occupancy = (() => {
    const used = pressure?.projectedTokens ?? pressure?.pressureTokens
    if (used === undefined || pressure?.contextWindow === undefined) return null
    return {
      percent: Math.min(100, Math.round(used / pressure.contextWindow * 100)),
      used,
      window: pressure.contextWindow,
    }
  })()

  return (
    <div className="dsh-rich-strip" data-dsh-rich-session={sessionId}>
      <div className="dsh-rich-cells">
        <Cell
          label="上下文占用"
          value={occupancy === null ? '—' : `${occupancy.percent}%`}
          sub={occupancy === null ? undefined : `${formatTokens(occupancy.used)} / ${formatTokens(occupancy.window)}`}
          accent={occupancy !== null && occupancy.percent >= 90 ? '#ff5c7a' : '#7c5cff'}
        />
        <Cell
          label="Token 消耗"
          value={showTokens ? `↑${formatTokens(inputTokens)} · ↓${formatTokens(outputTokens)}` : '—'}
          sub={stats !== undefined && stats.decodeMs > 0 ? `解码 ${formatDuration(stats.decodeMs)}` : undefined}
        />
        <Cell
          label="轮次 / 步骤"
          value={stats === undefined || stats.steps === 0 ? '—' : `${stats.turns} / ${stats.steps}`}
          sub={stats !== undefined && stats.llmMs > 0 ? `LLM ${formatDuration(stats.llmMs)}` : undefined}
        />
        <Cell
          label="首 token 延迟"
          value={stats !== undefined && stats.ttftSteps > 0 ? formatDuration(stats.ttftMs / stats.ttftSteps) : '—'}
          sub={stats !== undefined && stats.toolMs > 0 ? `工具 ${formatDuration(stats.toolMs)}` : undefined}
        />
      </div>
    </div>
  )
})
