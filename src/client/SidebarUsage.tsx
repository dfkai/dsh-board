import { useEffect, useMemo, useRef, useState } from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import { NS, type RichKey } from './locales.ts'
import { estimateCost } from './pricing.ts'
import { foldHistory, formatCost, formatTokens, type HistoryFold, type TurnUsage } from './fold.ts'
import { LEVELS, rankFor } from './levels.ts'

/** Structural view of the api client this entry consumes. */
interface HistoryValue {
  events: readonly { event: unknown }[]
}
interface ApiLike {
  sessions: {
    history(payload: { sessionId: string; maxMessages?: number }):
    Promise<{ result: { ok: boolean; value?: HistoryValue } }>
  }
}

export type SidebarUsageProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<typeof NS> & {
  api: ApiLike
}

const COLLAPSE_KEY = 'dsh-rich.collapsed'

function readCollapsed(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

/** Ease-out count-up toward `target` — the hero number "rolls". */
function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)
  useEffect(() => {
    const from = valueRef.current
    if (from === target) return
    const start = Date.now()
    let frame = 0
    const tick = (): void => {
      const t = Math.min(1, (Date.now() - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (target - from) * eased
      valueRef.current = next
      setValue(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

function SectionTitle({ emoji, children }: { emoji: string; children: React.ReactNode }): JSX.Element {
  return <div className="dsh-rich-sec"><span className="dsh-rich-sec-emoji">{emoji}</span>{children}</div>
}

function MiniEmpty({ text }: { text: string }): JSX.Element {
  return <div className="dsh-rich-mini">{text}</div>
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }): JSX.Element {
  return (
    <div className="dsh-rich-row">
      <span className="dsh-rich-row-label">{label}</span>
      <span className="dsh-rich-row-end">
        <span className="dsh-rich-row-value">{value}</span>
        {sub === undefined ? null : <span className="dsh-rich-row-sub">{sub}</span>}
      </span>
    </div>
  )
}

/** Stacked per-turn input/output bars. */
function TrendBars({ data }: { data: readonly TurnUsage[] }): JSX.Element {
  const max = Math.max(1, ...data.map(item => item.input + item.output))
  const width = data.length * 10 - 4
  return (
    <svg className="dsh-rich-chart" viewBox={`0 0 ${width} 36`} width="100%" height={36} aria-hidden>
      {data.map((item, index) => {
        const inH = Math.max(0, Math.round(item.input / max * 34))
        const outH = Math.max(0, Math.round(item.output / max * 34))
        const x = index * 10
        return (
          <g key={item.turn}>
            <rect className="dsh-rich-bar-in" x={x} y={36 - inH} width={6} height={inH} rx={2} />
            <rect className="dsh-rich-bar-out" x={x} y={36 - inH - outH} width={6} height={outH} rx={2} />
            <title>{`第 ${item.turn} 轮 · 入 ${item.input} · 出 ${item.output}`}</title>
          </g>
        )
      })}
    </svg>
  )
}

/** Cumulative output area chart. */
function CumulativeArea({ values }: { values: readonly number[] }): JSX.Element {
  const w = 236
  const h = 36
  const n = values.length
  const max = Math.max(1, ...values)
  const step = n > 1 ? w / (n - 1) : 0
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - (v / max) * (h - 8)).toFixed(1)}`)
  const area = `M 0,${h} L ${points.join(' L ')} L ${(n - 1) * step},${h} Z`
  return (
    <svg className="dsh-rich-chart" viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden>
      <defs>
        <linearGradient id="dsh-rich-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="dsh-rich-area-top" />
          <stop offset="100%" className="dsh-rich-area-bottom" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#dsh-rich-area)" />
      <polyline points={points.join(' ')} className="dsh-rich-line" fill="none" />
    </svg>
  )
}

function ModelRows({ models, t }: {
  models: readonly { model: string; input: number; output: number }[]
  t: PropsLocale<typeof NS>['t']
}): JSX.Element {
  const max = Math.max(1, ...models.map(item => item.output))
  return (
    <div className="dsh-rich-models">
      {models.map(item => (
        <div className="dsh-rich-model" key={item.model}>
          <div className="dsh-rich-model-head">
            <span className="dsh-rich-model-name" title={item.model}>🤖 {item.model}</span>
            <span className="dsh-rich-model-value">{t('model.value', { out: formatTokens(item.output), in: formatTokens(item.input) })}</span>
          </div>
          <div className="dsh-rich-model-bar">
            <div className="dsh-rich-model-fill" style={{ width: `${item.output / max * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionRows({ sessions }: {
  sessions: readonly { id: string; title: string; tokens: number }[]
}): JSX.Element {
  const max = Math.max(1, ...sessions.map(item => item.tokens))
  return (
    <div className="dsh-rich-sessions">
      {sessions.map(item => (
        <div className="dsh-rich-session" key={item.id}>
          <div className="dsh-rich-session-head">
            <span className="dsh-rich-session-title" title={item.title}>{item.title}</span>
            <span className="dsh-rich-session-value">{formatTokens(item.tokens)}</span>
          </div>
          <div className="dsh-rich-session-bar">
            <div className="dsh-rich-session-fill" style={{ width: `${item.tokens / max * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Sidebar foot entry: a live usage console next to Settings. Wide sidebar:
 * inline panel, expanded by default, collapsible (persisted). Rail: icon +
 * floating popup. Data: current-session projections from the session-list
 * store, per-turn/per-model series folded from the history RPC, and a
 * lifetime aggregate across every session row.
 */
export function SidebarUsage({ wide, useSessions, api, t }: SidebarUsageProps): JSX.Element {
  const current = useSessions(s => s.current)
  const ids = useSessions(s => s.ids)
  const byId = useSessions(s => s.byId)
  const summary = current === undefined ? undefined : byId[current]
  const usage = summary?.projectionValues?.tokenUsage as TokenUsageProjection | undefined
  const steps = (summary?.projectionValues?.sessionStats as { steps?: number } | undefined)?.steps
  const running = summary?.running ?? false
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [fold, setFold] = useState<HistoryFold>({ perTurn: [], perModel: new Map(), cumulative: [] })
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (current === undefined) return
    let cancelled = false
    void (async () => {
      try {
        const res = await api.sessions.history({ sessionId: current, maxMessages: 120 })
        if (cancelled || !res.result.ok || res.result.value === undefined) return
        setFold(foldHistory(res.result.value.events))
      } catch {
        // History unavailable — keep the previous fold.
      }
    })()
    return () => { cancelled = true }
  }, [current, api, open, collapsed, steps])

  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && rootRef.current !== null && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const lifetime = useMemo(() => {
    let input = 0
    let output = 0
    let cost = 0
    const sessions: { id: string; title: string; tokens: number }[] = []
    for (const id of ids) {
      const row = byId[id]
      const u = row?.projectionValues?.tokenUsage
      if (u === undefined) continue
      const i = u.uncachedInputTokens + u.cacheReadTokens + u.cacheWriteTokens
      const o = u.outputTokens
      input += i
      output += o
      cost += estimateCost(u)
      sessions.push({ id, title: row.displayTitle ?? row.title ?? String(id).slice(0, 8), tokens: i + o })
    }
    sessions.sort((left, right) => right.tokens - left.tokens)
    return { input, output, cost, total: input + output, sessions: sessions.slice(0, 8) }
  }, [ids, byId])

  const models = useMemo(() => [...fold.perModel.entries()]
    .map(([model, m]) => ({ model, input: m.input, output: m.output }))
    .sort((left, right) => right.output - left.output)
    .slice(0, 5), [fold])

  const sessionCost = usage === undefined ? 0 : estimateCost(usage)
  const totalIn = usage === undefined ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
  const totalTokens = totalIn + (usage?.outputTokens ?? 0)
  const cacheHitPercent = totalIn === 0 ? null : Math.round((usage?.cacheReadTokens ?? 0) / totalIn * 100)

  const hero = useCountUp(lifetime.total)
  const rank = rankFor(lifetime.total)
  const rankKey = `rank.${LEVELS.indexOf(rank.level)}` as RichKey
  const rankName = t(rankKey)
  const rankProgress = rank.next === null
    ? 1
    : (lifetime.total - rank.level.floor) / (rank.next.floor - rank.level.floor)
  const rankSub = rank.next === null
    ? t('rank.max')
    : t('rank.next', {
      name: t(`rank.${LEVELS.indexOf(rank.next)}` as RichKey),
      count: formatTokens(rank.next.floor - lifetime.total),
    })

  const toggle = (): void => {
    if (wide) {
      const next = !collapsed
      setCollapsed(next)
      try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0') } catch { /* ignore */ }
    } else {
      setOpen(value => !value)
    }
  }

  const panel = (
    <div className="dsh-rich-panel">
      <div className="dsh-rich-panel-title">
        <span>⚡ {t('panel.title')}</span>
        {running
          ? <span className="dsh-rich-live"><StateDot state="ongoing" className="dsh-rich-dot" />{t('live')}</span>
          : null}
      </div>
      <SectionTitle emoji="🏆">{t('rank.title')}</SectionTitle>
      <div className="dsh-rich-rank">
        <span className="dsh-rich-rank-emoji">{rank.level.emoji}</span>
        <div className="dsh-rich-rank-body">
          <div className="dsh-rich-rank-name">{rankName}</div>
          <div className="dsh-rich-rank-bar">
            <div className="dsh-rich-rank-fill" style={{ width: `${Math.min(100, rankProgress * 100)}%` }} />
          </div>
          <div className="dsh-rich-rank-next">{rankSub}</div>
        </div>
      </div>
      <div className="dsh-rich-hero">
        <div className="dsh-rich-hero-value">{formatTokens(hero)}</div>
        <div className="dsh-rich-hero-label">{t('global.tokens')}</div>
      </div>
      <div className="dsh-rich-hero-sub">
        {t('hero.sessions', { n: ids.length })} · {t('global.cost')} {formatCost(lifetime.cost)}
      </div>
      <SectionTitle emoji="💰">{t('sec.session')}</SectionTitle>
      {usage === undefined
        ? <MiniEmpty text={t('spark.empty')} />
        : (
          <div className="dsh-rich-rows">
            <Row label={t('tokens.cost')} value={formatCost(sessionCost)} />
            <Row
              label={t('tokens.in')}
              value={formatTokens(totalIn)}
              sub={cacheHitPercent === null ? undefined : t('tokens.cache', { percent: cacheHitPercent })}
            />
            <Row label={t('tokens.out')} value={formatTokens(usage.outputTokens)} />
            <Row label={t('tokens.total')} value={formatTokens(totalTokens)} />
          </div>
        )}
      <SectionTitle emoji="🧮">{t('sec.model')}</SectionTitle>
      {models.length === 0 ? <MiniEmpty text={t('spark.empty')} /> : <ModelRows models={models} t={t} />}
      <SectionTitle emoji="📈">{t('sec.trend')}</SectionTitle>
      {fold.perTurn.length === 0
        ? <MiniEmpty text={t('spark.empty')} />
        : (
          <>
            <TrendBars data={fold.perTurn.slice(-24)} />
            <div className="dsh-rich-legend">
              <span><i className="dsh-rich-legend-in" />{t('legend.in')}</span>
              <span><i className="dsh-rich-legend-out" />{t('legend.out')}</span>
            </div>
          </>
        )}
      <SectionTitle emoji="📉">{t('sec.cumulative')}</SectionTitle>
      {fold.cumulative.length < 2
        ? <MiniEmpty text={t('spark.empty')} />
        : <CumulativeArea values={fold.cumulative.slice(-60)} />}
      <SectionTitle emoji="🌌">{t('sec.global')}</SectionTitle>
      {lifetime.sessions.length === 0
        ? <MiniEmpty text={t('spark.empty')} />
        : <SessionRows sessions={lifetime.sessions} />}
      <div className="dsh-rich-note">{t('note.pricing')}</div>
    </div>
  )

  return (
    <div ref={rootRef} className="dsh-rich-foot">
      <button
        type="button"
        className="dsh-rich-trigger"
        aria-expanded={wide ? !collapsed : open}
        title={t('panel.title')}
        onClick={toggle}
      >
        <span className="dsh-rich-trigger-emoji">⚡</span>
        {wide ? <span className="dsh-rich-trigger-label">{t('trigger.wide', { cost: formatCost(sessionCost) })}</span> : null}
        {running ? <StateDot state="ongoing" className="dsh-rich-dot" /> : null}
        {wide ? <span className="dsh-rich-chevron">{collapsed ? '▸' : '▾'}</span> : null}
      </button>
      {wide
        ? (collapsed ? null : <div className="dsh-rich-inline">{panel}</div>)
        : open
          ? <div className="dsh-rich-float">{panel}</div>
          : null}
    </div>
  )
}
