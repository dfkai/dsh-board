import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ContextPressureProjection, TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import type { ConversationSnapshot, JobView, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import { NS, type RichKey } from './locales.ts'

/** Mirrors the `sessionStats` projection fields this strip uses. */
interface SessionStats {
  turns: number
  steps: number
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

export type RichStripProps = PropsRuntime<'conversation.input.dock'> & PropsLocale<typeof NS>

const NO_JOBS: readonly JobView[] = []
const NO_SUBS: SubSnapshot = { entries: [] }

/** Rough mixed-text heuristic (CJK ≈ 1 token/char, latin ≈ 4 chars/token). */
const TOKENS_PER_CHAR = 0.55

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

/** Total text characters of the in-flight partial assistant message. */
function partialTextLength(partial: ConversationSnapshot['partial']): number {
  if (partial === null) return 0
  let total = 0
  for (const block of partial.blocks) {
    if ('text' in block) total += String(block.text).length
  }
  return total
}

function Cell({ label, value, sub, bar }: {
  label: string
  value: ReactNode
  sub?: string
  bar?: { percent: number }
}): ReactNode {
  return (
    <div className="dsh-rich-cell">
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
 * The monitor strip: a bottom panel above the composer. Deliberately shows
 * only what the shipped stats line does NOT: context budget projection,
 * per-turn (not whole-log) figures, a live streaming rate, and live task
 * timers. Whole-session stats stay with the built-in strip.
 */
export const RichStrip = memo(function RichStrip({ useProjection, useSessions, useSession, sessionId, t }: RichStripProps) {
  const usage = useProjection('tokenUsage') as TokenUsageProjection | undefined
  const pressure = useProjection('contextPressure') as ContextPressureProjection | undefined
  const stats = useProjection('sessionStats') as SessionStats | undefined
  const jobs = (useSessions((s: SessionListState) => s.jobsBySession[sessionId]) ?? NO_JOBS) as readonly JobView[]
  const subs = (useSessions((s: SessionListState) => s.subagentsByParent[sessionId]) ?? NO_SUBS) as SubSnapshot
  const nodes = useSession(s => s.nodes) as ConversationSnapshot['nodes']
  const turnTimings = useSession(s => s.turnTimings) as ConversationSnapshot['turnTimings']
  const partialLen = useSession(s => partialTextLength(s.partial)) as number
  const running = useSession(s => s.running) as boolean

  const inputTokens = usage === undefined
    ? 0
    : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens

  const occupancy = (() => {
    const used = pressure?.projectedTokens ?? pressure?.pressureTokens
    if (used === undefined || pressure?.contextWindow === undefined) return null
    return {
      percent: Math.min(100, Math.round(used / pressure.contextWindow * 100)),
      used,
      window: pressure.contextWindow,
    }
  })()

  const latestTurn = useMemo(() => {
    let turn = -1
    for (const node of nodes) {
      if (node.kind === 'assistant' && node.turn > turn) turn = node.turn
    }
    if (turn < 0) return null
    let steps = 0
    let outTokens = 0
    for (const node of nodes) {
      if (node.kind !== 'assistant' || node.turn !== turn) continue
      steps += 1
      const usageOf = (node as { usage?: { outputTokens?: number } }).usage
      if (typeof usageOf?.outputTokens === 'number' && Number.isFinite(usageOf.outputTokens)) {
        outTokens += usageOf.outputTokens
      }
    }
    const timing = turnTimings.get(turn)
    const durationMs = timing !== undefined && timing.endTime !== undefined
      ? Math.max(0, timing.endTime - timing.startTime)
      : null
    return { turn, steps, outTokens, durationMs }
  }, [nodes, turnTimings])

  // --- live stream rate sampler (1 Hz; samples partial text growth) ---
  const lenRef = useRef(partialLen)
  lenRef.current = partialLen
  const sampleRef = useRef<{ at: number; chars: number; startedAt: number | null }>({
    at: 0,
    chars: 0,
    startedAt: null,
  })
  const [rate, setRate] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)
  const streaming = running || partialLen > 0
  useEffect(() => {
    if (!streaming) {
      setRate(0)
      setElapsedSec(0)
      return
    }
    if (sampleRef.current.startedAt === null) {
      sampleRef.current.startedAt = Date.now()
      sampleRef.current.chars = lenRef.current
      sampleRef.current.at = Date.now()
    }
    const timer = setInterval(() => {
      const now = Date.now()
      const dt = (now - sampleRef.current.at) / 1000
      const dChars = Math.max(0, lenRef.current - sampleRef.current.chars)
      if (dt >= 0.5) {
        setRate(dChars / dt * TOKENS_PER_CHAR)
        sampleRef.current.chars = lenRef.current
        sampleRef.current.at = now
      }
      setElapsedSec((now - (sampleRef.current.startedAt ?? now)) / 1000)
    }, 1000)
    return () => {
      clearInterval(timer)
      sampleRef.current.startedAt = null
    }
  }, [streaming])

  // --- live job ticker (1 Hz while anything runs) ---
  const liveJobs = jobs.filter(job => job.status === 'running' || job.status === 'stopping')
  const firstLiveJob = liveJobs[0]
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (liveJobs.length === 0) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [liveJobs.length])

  const children = subs.entries.filter(entry => entry.kind === 'child')
  const runningSubs = children.filter(entry => entry.activity === 'running')

  const hasActivity = occupancy !== null
    || (stats !== undefined && stats.turns > 0)
    || jobs.length > 0
    || children.length > 0
    || streaming
    || nodes.length > 0
  if (!hasActivity) {
    return (
      <div className="dsh-rich-strip dsh-rich-empty" data-dsh-rich-session={sessionId}>
        <span className="dsh-rich-empty-text">{t('empty')}</span>
      </div>
    )
  }

  const remaining = occupancy === null ? null : occupancy.window - occupancy.used
  const avgInputPerTurn = stats !== undefined && stats.turns > 0 ? inputTokens / stats.turns : null
  const projectedTurns = remaining !== null && avgInputPerTurn !== null && avgInputPerTurn > 0
    ? Math.floor(remaining / avgInputPerTurn)
    : null

  return (
    <div className="dsh-rich-strip" data-dsh-rich-session={sessionId}>
      <div className="dsh-rich-cells">
        <Cell
          label={t('label.budget')}
          value={occupancy === null
            ? '—'
            : (
              <>
                {occupancy.percent >= 90 ? <StateDot state="warning" className="dsh-rich-dot" /> : null}
                {formatTokens(remaining ?? 0)}
              </>
            )}
          sub={occupancy === null
            ? undefined
            : projectedTurns !== null
              ? t('budget.sub', { percent: occupancy.percent, turns: projectedTurns })
              : t('budget.subNoTurns', { percent: occupancy.percent })}
          bar={occupancy === null ? undefined : { percent: occupancy.percent }}
        />
        <Cell
          label={t('label.turn')}
          value={latestTurn === null ? '—' : `${formatTokens(latestTurn.outTokens)} tok`}
          sub={latestTurn === null
            ? undefined
            : latestTurn.durationMs !== null
              ? t('turn.sub', { steps: latestTurn.steps, duration: formatDuration(latestTurn.durationMs) })
              : t('turn.subLive', { steps: latestTurn.steps })}
        />
        <Cell
          label={t('label.rate')}
          value={streaming
            ? (
              <>
                <StateDot state="ongoing" className="dsh-rich-dot" />
                {rate > 0 ? `≈${Math.round(rate)} tok/s` : '…'}
              </>
            )
            : t('rate.idle')}
          sub={streaming ? t('rate.elapsed', { elapsed: formatDuration(elapsedSec * 1000) }) : undefined}
        />
        <Cell
          label={t('label.jobs')}
          value={liveJobs.length > 0
            ? (
              <>
                <StateDot state="ongoing" className="dsh-rich-dot" />
                {t('value.jobs.running', { n: liveJobs.length })}
              </>
            )
            : jobs.length > 0
              ? t('value.jobs.count', { n: jobs.length })
              : t('value.none')}
          sub={firstLiveJob === undefined
            ? undefined
            : `${truncate(firstLiveJob.label, 24)} · ${formatDuration(Math.max(0, now - firstLiveJob.startedAt))}`}
        />
        <Cell
          label={t('label.subagents')}
          value={children.length === 0
            ? t('value.none')
            : runningSubs.length > 0
              ? (
                <>
                  <StateDot state="ongoing" className="dsh-rich-dot" />
                  {t('value.subs.running', { running: runningSubs.length, total: children.length })}
                </>
              )
              : t('value.subs.idle', { total: children.length })}
          sub={runningSubs[0]?.label === undefined ? undefined : truncate(runningSubs[0].label, 24)}
        />
      </div>
    </div>
  )
})
