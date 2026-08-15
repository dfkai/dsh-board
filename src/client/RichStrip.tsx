import { memo, type ReactNode } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ContextPressureProjection, TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import type { JobView, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'

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

/** Structural view of the subagent catalog rows this strip reads. */
interface SubEntry {
  kind: 'child' | 'diagnostic'
  id: string
  activity?: 'running' | 'inactive'
  mode?: 'one-shot' | 'continuable'
  label?: string
  hasChildren?: boolean
}
interface SubSnapshot {
  entries: SubEntry[]
}

export type RichStripProps = PropsRuntime<'conversation.input.dock'>

const NO_JOBS: readonly JobView[] = []
const NO_SUBS: SubSnapshot = { entries: [] }

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

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}

function Cell({ label, value, sub, accent, bar }: {
  label: string
  value: ReactNode
  sub?: string
  accent?: string
  bar?: { percent: number }
}): ReactNode {
  return (
    <div className="dsh-rich-cell" style={accent === undefined ? undefined : { '--accent': accent } as never}>
      <div className="dsh-rich-label">{label}</div>
      <div className="dsh-rich-value">{value}</div>
      {sub === undefined ? null : <div className="dsh-rich-sub">{sub}</div>}
      {bar === undefined ? null : (
        <div className="dsh-rich-bar">
          <div className="dsh-rich-bar-fill" style={{ width: `${bar.percent}%` }} />
        </div>
      )}
    </div>
  )
}

/**
 * The monitor strip: a bottom panel above the composer, reading the durable
 * session projections (tokenUsage / contextPressure / sessionStats) through
 * the framework's per-session projection seat, plus the jobs and subagent
 * mirrors from the runtime's session-list store.
 */
export const RichStrip = memo(function RichStrip({ useProjection, useSessions, sessionId }: RichStripProps) {
  const usage = useProjection('tokenUsage') as TokenUsageProjection | undefined
  const pressure = useProjection('contextPressure') as ContextPressureProjection | undefined
  const stats = useProjection('sessionStats') as SessionStats | undefined
  const jobs = (useSessions((s: SessionListState) => s.jobsBySession[sessionId]) ?? NO_JOBS) as readonly JobView[]
  const subs = (useSessions((s: SessionListState) => s.subagentsByParent[sessionId]) ?? NO_SUBS) as SubSnapshot

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

  const liveJobs = jobs.filter(job => job.status === 'running' || job.status === 'stopping')
  const firstLiveJob = liveJobs[0]
  const children = subs.entries.filter(entry => entry.kind === 'child')
  const runningSubs = children.filter(entry => entry.activity === 'running')

  // A session with no activity yet collapses to one slim placeholder line;
  // the full grid appears with the first real datum.
  const hasActivity = occupancy !== null
    || showTokens
    || (stats !== undefined && stats.steps > 0)
    || jobs.length > 0
    || children.length > 0
  if (!hasActivity) {
    return (
      <div className="dsh-rich-strip dsh-rich-empty" data-dsh-rich-session={sessionId}>
        <span className="dsh-rich-empty-text">dsh-rich · 等待会话活动（token / 任务 / 子代理出现后展开）</span>
      </div>
    )
  }

  return (
    <div className="dsh-rich-strip" data-dsh-rich-session={sessionId}>
      <div className="dsh-rich-cells">
        <Cell
          label="上下文占用"
          value={occupancy === null ? '—' : `${occupancy.percent}%`}
          sub={occupancy === null ? undefined : `${formatTokens(occupancy.used)} / ${formatTokens(occupancy.window)}`}
          accent={occupancy !== null && occupancy.percent >= 90 ? '#ff5c7a' : '#7c5cff'}
          bar={occupancy === null ? undefined : { percent: occupancy.percent }}
        />
        <Cell
          label="Token 消耗"
          value={showTokens ? `↑${formatTokens(inputTokens)} · ↓${formatTokens(outputTokens)}` : '—'}
          sub={stats !== undefined && stats.decodeMs > 0 ? `解码 ${formatDuration(stats.decodeMs)}` : undefined}
        />
        <Cell
          label="后台任务"
          value={liveJobs.length > 0 ? `${liveJobs.length} 运行中` : jobs.length > 0 ? `${jobs.length} 条` : '无'}
          sub={firstLiveJob === undefined ? undefined : truncate(firstLiveJob.label, 36)}
          accent={liveJobs.length > 0 ? '#00e5ff' : undefined}
        />
        <Cell
          label="子代理"
          value={children.length === 0
            ? '无'
            : runningSubs.length > 0
              ? `${runningSubs.length} / ${children.length} 运行中`
              : `${children.length} 个空闲`}
          sub={runningSubs[0]?.label === undefined ? undefined : truncate(runningSubs[0].label, 36)}
          accent={runningSubs.length > 0 ? '#7c5cff' : undefined}
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
