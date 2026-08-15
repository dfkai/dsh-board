import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import { NS, type RichKey } from './locales.ts'
import { estimateCost, isPeakHour, priceFor } from './pricing.ts'
import { foldHistory, formatCost, formatDuration, formatTokens, type HistoryFold, type TurnUsage } from './fold.ts'
import { LEVELS, rankFor } from './levels.ts'
import { ACHIEVEMENTS, computeStats, type UsageStats } from './achievements.ts'

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

const COLLAPSE_KEY = 'dsh-board.collapsed'

function readCollapsed(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function SectionTitle({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="dsh-board-sec">{children}</div>
}

interface PressureView {
  pressureTokens?: number
  projectedTokens?: number
  contextWindow?: number
}
interface BreakdownView {
  systemTokens?: number
  toolsTokens?: number
  messageTokens?: number
}

/** The 1M-context window: occupancy, remaining budget, and what eats it. */
function ContextBlock({ pressure, breakdown, subagentMs, t }: {
  pressure: PressureView | undefined
  breakdown: BreakdownView | undefined
  subagentMs: number | undefined
  t: PropsLocale<typeof NS>['t']
}): JSX.Element | null {
  if (pressure === undefined && breakdown === undefined) return null
  const used = pressure?.projectedTokens ?? pressure?.pressureTokens
  const window = pressure?.contextWindow
  const percent = used !== undefined && window !== undefined
    ? Math.min(100, Math.round(used / window * 100))
    : null
  const remaining = used !== undefined && window !== undefined ? window - used : null
  const parts = breakdown === undefined
    ? null
    : [
      { key: 'system', label: t('ctx.legend.system'), tokens: breakdown.systemTokens ?? 0 },
      { key: 'tools', label: t('ctx.legend.tools'), tokens: breakdown.toolsTokens ?? 0 },
      { key: 'messages', label: t('ctx.legend.messages'), tokens: breakdown.messageTokens ?? 0 },
    ]
  const totalParts = parts === null ? 0 : parts.reduce((sum, part) => sum + part.tokens, 0)
  return (
    <div className="dsh-board-context">
      <div className="dsh-board-context-head">
        <span className="dsh-board-context-title">{t('sec.context')}</span>
        <span className="dsh-board-context-value">{percent === null ? '—' : `${percent}%`}</span>
      </div>
      {percent === null
        ? null
        : (
          <div className="dsh-board-context-bar">
            <div className="dsh-board-context-fill" style={{ width: `${percent}%` }} />
          </div>
        )}
      {used !== undefined && window !== undefined
        ? (
          <div className="dsh-board-context-sub">
            {formatTokens(used)} / {formatTokens(window)} · {t('ctx.remaining', { count: formatTokens(remaining ?? 0) })}
          </div>
        )
        : null}
      {parts !== null && totalParts > 0
        ? (
          <>
            <div className="dsh-board-context-stack">
              {parts.filter(part => part.tokens > 0).map(part => (
                <span
                  key={part.key}
                  className={`dsh-board-context-part dsh-board-context-part-${part.key}`}
                  style={{ width: `${part.tokens / totalParts * 100}%` }}
                  title={`${part.label} ${formatTokens(part.tokens)}`}
                />
              ))}
            </div>
            <div className="dsh-board-context-legend">
              {parts.filter(part => part.tokens > 0).map(part => (
                <span key={part.key} className="dsh-board-context-legend-item">
                  <i className={`dsh-board-context-dot dsh-board-context-dot-${part.key}`} />
                  {part.label} {formatTokens(part.tokens)}
                </span>
              ))}
            </div>
          </>
        )
        : null}
      {subagentMs !== undefined && subagentMs > 0
        ? <div className="dsh-board-context-sub">{t('ctx.subagent', { duration: formatDuration(subagentMs) })}</div>
        : null}
    </div>
  )
}

/** Stacked per-turn input/output bars. */
function TrendBars({ data }: { data: readonly TurnUsage[] }): JSX.Element {
  const max = Math.max(1, ...data.map(item => item.input + item.output))
  const width = data.length * 10 - 4
  return (
    <svg className="dsh-board-chart" viewBox={`0 0 ${width} 36`} width="100%" height={36} aria-hidden>
      {data.map((item, index) => {
        const inH = Math.max(0, Math.round(item.input / max * 34))
        const outH = Math.max(0, Math.round(item.output / max * 34))
        const x = index * 10
        return (
          <g key={item.turn}>
            <rect className="dsh-board-bar-in" x={x} y={36 - inH} width={6} height={inH} rx={2} />
            <rect className="dsh-board-bar-out" x={x} y={36 - inH - outH} width={6} height={outH} rx={2} />
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
    <svg className="dsh-board-chart" viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden>
      <defs>
        <linearGradient id="dsh-board-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="dsh-board-area-top" />
          <stop offset="100%" className="dsh-board-area-bottom" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#dsh-board-area)" />
      <polyline points={points.join(' ')} className="dsh-board-line" fill="none" />
    </svg>
  )
}

function ModelRows({ models, t }: {
  models: readonly { model: string; input: number; output: number }[]
  t: PropsLocale<typeof NS>['t']
}): JSX.Element {
  const max = Math.max(1, ...models.map(item => item.output))
  return (
    <div className="dsh-board-models">
      {models.map(item => (
        <div className="dsh-board-model" key={item.model}>
          <div className="dsh-board-model-head">
            <span className="dsh-board-model-name" title={item.model}>{item.model}</span>
            <span className="dsh-board-model-value">{t('model.value', { out: formatTokens(item.output), in: formatTokens(item.input) })}</span>
          </div>
          <div className="dsh-board-model-bar">
            <div className="dsh-board-model-fill" style={{ width: `${item.output / max * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** GitHub-style daily token heatmap: 12 weeks × 7 days. */
function Heatmap({ daily }: { daily: readonly { day: number; tokens: number }[] }): JSX.Element {
  const weeks = 12
  const rows = 7
  const cell = 8
  const gap = 2
  const now = new Date()
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const start = todayMid - (weeks * rows - 1) * 86_400_000
  const byDay = new Map(daily.map(item => [item.day, item.tokens]))
  const max = Math.max(1, ...daily.map(item => item.tokens))
  const width = weeks * (cell + gap) - gap
  const height = rows * (cell + gap) - gap
  return (
    <svg className="dsh-board-heatmap" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      {Array.from({ length: weeks * rows }, (_, i) => {
        const day = start + i * 86_400_000
        const tokens = byDay.get(day) ?? 0
        const level = tokens === 0 ? 0 : Math.max(1, Math.min(5, Math.ceil(tokens / max * 5)))
        const x = Math.floor(i / rows) * (cell + gap)
        const y = (i % rows) * (cell + gap)
        return (
          <rect key={day} className={`dsh-board-heat-l${level}`} x={x} y={y} width={cell} height={cell} rx={2}>
            <title>{`${new Date(day).toLocaleDateString()} · ${tokens} token`}</title>
          </rect>
        )
      })}
    </svg>
  )
}

function SessionRows({ sessions }: {
  sessions: readonly { id: string; title: string; tokens: number }[]
}): JSX.Element {
  const max = Math.max(1, ...sessions.map(item => item.tokens))
  return (
    <div className="dsh-board-sessions">
      {sessions.map(item => (
        <div className="dsh-board-session" key={item.id}>
          <div className="dsh-board-session-head">
            <span className="dsh-board-session-title" title={item.title}>{item.title}</span>
            <span className="dsh-board-session-value">{formatTokens(item.tokens)}</span>
          </div>
          <div className="dsh-board-session-bar">
            <div className="dsh-board-session-fill" style={{ width: `${item.tokens / max * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * VIP-style membership card: previous tier (unlocked) → current tier
 * (glowing, tier-colored) → next tier (locked), a flowing progress bar with
 * percentage, an unlock ETA at the user's current pace, per-tier perks, a
 * level-up celebration flash, and the full ten-rung ladder.
 */
function MembershipCard({ total, daily, t }: {
  total: number
  daily: readonly { day: number; tokens: number }[]
  t: PropsLocale<typeof NS>['t']
}): JSX.Element {
  const rank = rankFor(total)
  const index = LEVELS.indexOf(rank.level)
  const prev = index > 0 ? LEVELS[index - 1] : null
  const next = rank.next
  const progress = next === null ? 1 : (total - rank.level.floor) / (next.floor - rank.level.floor)

  // Unlock ETA: lifetime pace over active days.
  const activeTokens = daily.reduce((sum, item) => sum + item.tokens, 0)
  const activeDays = Math.max(1, daily.filter(item => item.tokens > 0).length)
  const avgPerDay = activeTokens / activeDays
  const daysToNext = next === null
    ? null
    : Math.ceil((next.floor - total) / Math.max(1, avgPerDay))

  return (
    <div className="dsh-board-card">
      <div className="dsh-board-card-head">
        <span>{t('rank.title')}</span>
        <span className="dsh-board-card-lv">{t('rank.lv', { n: index + 1 })}</span>
      </div>
      <div className="dsh-board-card-body">
        {prev === null
          ? <div className="dsh-board-card-step dsh-board-card-prev-empty" />
          : (
            <div className="dsh-board-card-step dsh-board-card-prev" title={t(`rank.${index - 1}` as RichKey)}>
              <span className="dsh-board-card-step-emoji">{prev.emoji}</span>
              <span className="dsh-board-card-step-name">{t(`rank.${index - 1}` as RichKey)}</span>
              <span className="dsh-board-card-step-status">✓ {t('rank.unlocked')}</span>
            </div>
          )}
        <div className="dsh-board-card-current">
          <span className="dsh-board-card-current-emoji">{rank.level.emoji}</span>
          <span className="dsh-board-card-current-name">{t(`rank.${index}` as RichKey)}</span>
          <span className="dsh-board-card-current-tag">{t('rank.current')}</span>
        </div>
        {next === null
          ? <div className="dsh-board-card-step dsh-board-card-max">👑 MAX</div>
          : (
            <div className="dsh-board-card-step dsh-board-card-next" title={t(`rank.${index + 1}` as RichKey)}>
              <span className="dsh-board-card-step-emoji">{next.emoji}</span>
              <span className="dsh-board-card-step-name">{t(`rank.${index + 1}` as RichKey)}</span>
              <span className="dsh-board-card-step-status">🔒 {t('rank.locked')}</span>
            </div>
          )}
      </div>
      <div className="dsh-board-card-bar">
        <div className="dsh-board-card-bar-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <div className="dsh-board-card-next-line">
        {next === null
          ? t('rank.max')
          : `${t('rank.next', {
            name: t(`rank.${index + 1}` as RichKey),
            count: formatTokens(next.floor - total),
          })} · ${t('rank.percent', { percent: Math.round(progress * 100) })}`}
      </div>
      {next !== null && daysToNext !== null
        ? (
          <div className="dsh-board-card-eta">
            {daysToNext < 1 ? t('rank.eta.today') : t('rank.eta', { days: daysToNext })}
          </div>
        )
        : null}
      <div className="dsh-board-card-perks">
        <div className="dsh-board-card-perk">
          <span className="dsh-board-card-perk-label">✦ {t('rank.perk.current')}</span>
          <span className="dsh-board-card-perk-value">{t(`perk.${index}` as RichKey)}</span>
        </div>
        {next === null
          ? null
          : (
            <div className="dsh-board-card-perk dsh-board-card-perk-locked">
              <span className="dsh-board-card-perk-label">🔒 {t('rank.perk.next')}</span>
              <span className="dsh-board-card-perk-value">{t(`perk.${index + 1}` as RichKey)}</span>
            </div>
          )}
      </div>
      <div className="dsh-board-card-ladder">
        {LEVELS.map((level, i) => (
          <span
            key={level.floor}
            className={[
              'dsh-board-card-rung',
              i < index ? 'dsh-board-card-rung-done' : '',
              i === index ? 'dsh-board-card-rung-now' : '',
              i > index ? 'dsh-board-card-rung-locked' : '',
            ].filter(Boolean).join(' ')}
            title={`LV.${i + 1} ${level.zh}`}
          >
            {level.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}

function Achievements({ stats, t }: {
  stats: UsageStats
  t: PropsLocale<typeof NS>['t']
}): JSX.Element {
  return (
    <div className="dsh-board-achievements">
      {ACHIEVEMENTS.map(achievement => {
        const got = achievement.test(stats)
        const nameKey = `ach.${achievement.id}` as RichKey
        const condKey = `ach.${achievement.id}.cond` as RichKey
        return (
          <span
            key={achievement.id}
            className={got ? 'dsh-board-ach dsh-board-ach-got' : 'dsh-board-ach'}
            title={got ? t(nameKey) : `${t(nameKey)} · ${t(condKey)}`}
          >
            <span className="dsh-board-ach-emoji">{achievement.emoji}</span>
            <span className="dsh-board-ach-name">{t(nameKey)}</span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * Sidebar foot entry: a live usage console next to Settings. Wide sidebar:
 * panel floats upward above the badge (height-capped, scrolls internally),
 * expanded by default, collapsible (persisted). Rail: icon + popup. Data: current-session projections from the session-list
 * store, per-turn/per-model series folded from the history RPC, and a
 * lifetime aggregate across every session row.
 */
const MemoMembershipCard = memo(MembershipCard)
const MemoContextBlock = memo(ContextBlock)
const MemoHeatmap = memo(Heatmap)
const MemoCumulativeArea = memo(CumulativeArea)
const MemoTrendBars = memo(TrendBars)
const MemoModelRows = memo(ModelRows)
const MemoSessionRows = memo(SessionRows)
const MemoAchievements = memo(Achievements)

export const SidebarUsage = memo(function SidebarUsage({ wide, useSessions, api, t }: SidebarUsageProps): JSX.Element {
  const current = useSessions(s => s.current)
  const ids = useSessions(s => s.ids)
  const byId = useSessions(s => s.byId)
  const summary = current === undefined ? undefined : byId[current]
  const usage = summary?.projectionValues?.tokenUsage as TokenUsageProjection | undefined
  const projectionValues = summary?.projectionValues
  const pressure = projectionValues?.contextPressure as PressureView | undefined
  const breakdown = projectionValues?.contextBreakdown as BreakdownView | undefined
  const subagentMs = (projectionValues?.subagentTiming as { settledMs?: number } | undefined)?.settledMs
  const ctxPercent = (() => {
    const used = pressure?.projectedTokens ?? pressure?.pressureTokens
    const window = pressure?.contextWindow
    if (used === undefined || window === undefined || window <= 0) return null
    return Math.min(100, Math.round(used / window * 100))
  })()
  const steps = (summary?.projectionValues?.sessionStats as { steps?: number } | undefined)?.steps
  const running = summary?.running ?? false
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [fold, setFold] = useState<HistoryFold>({ perTurn: [], perModel: new Map(), cumulative: [] })
  const rootRef = useRef<HTMLDivElement | null>(null)
  const panelVisible = wide ? !collapsed : open

  useEffect(() => {
    if (current === undefined || !panelVisible) return
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
  }, [current, api, panelVisible, steps])

  const panelOpen = wide ? !collapsed : open
  useEffect(() => {
    if (!panelOpen) return
    const onDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && rootRef.current !== null && !rootRef.current.contains(event.target)) {
        if (wide) setCollapsed(true)
        else setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [panelOpen, wide])

  const lifetime = useMemo(() => {
    let input = 0
    let output = 0
    let cost = 0
    let hit = 0
    const sessions: { id: string; title: string; tokens: number }[] = []
    const daily = new Map<number, number>()
    for (const id of ids) {
      const row = byId[id]
      const u = row?.projectionValues?.tokenUsage
      if (u === undefined) continue
      const i = u.uncachedInputTokens + u.cacheReadTokens + u.cacheWriteTokens
      const o = u.outputTokens
      input += i
      output += o
      hit += u.cacheReadTokens
      cost += estimateCost(u)
      sessions.push({ id, title: row.displayTitle ?? row.title ?? String(id).slice(0, 8), tokens: i + o })
      if (Number.isFinite(row.updatedAt) && row.updatedAt > 0) {
        const day = new Date(row.updatedAt).setHours(0, 0, 0, 0)
        daily.set(day, (daily.get(day) ?? 0) + i + o)
      }
    }
    sessions.sort((left, right) => right.tokens - left.tokens)
    const now = new Date()
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime()
    let today = 0
    let week = 0
    for (const [day, tokens] of daily) {
      if (day === todayMid) today += tokens
      if (day >= weekStart && day <= todayMid) week += tokens
    }
    return {
      today,
      week,
      input,
      output,
      cost,
      hit,
      total: input + output,
      sessions: sessions.slice(0, 8),
      daily: [...daily.entries()].map(([day, tokens]) => ({ day, tokens })),
    }
  }, [ids, byId])

  const models = useMemo(() => [...fold.perModel.entries()]
    .map(([model, m]) => ({ model, input: m.input, output: m.output }))
    .sort((left, right) => right.output - left.output)
    .slice(0, 5), [fold])

  /** The model with the most output this session — prices its billing. */
  const dominantModel = useMemo(() => {
    let best: string | undefined
    let bestOutput = -1
    for (const [model, m] of fold.perModel) {
      if (m.output > bestOutput) {
        bestOutput = m.output
        best = model
      }
    }
    return best
  }, [fold])

  const sessionCost = usage === undefined ? 0 : estimateCost(usage, priceFor(dominantModel))

  const hero = lifetime.total
  const rank = rankFor(lifetime.total)
  const rankName = t(`rank.${LEVELS.indexOf(rank.level)}` as RichKey)
  const usageStats = useMemo(() => computeStats(lifetime.daily, ids.length), [lifetime.daily, ids.length])

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
    <div className="dsh-board-panel">
      <div className="dsh-board-panel-title">
        <span>{t('panel.title')}</span>
        <span className="dsh-board-title-right">
          {running
            ? <span className="dsh-board-live"><StateDot state="ongoing" className="dsh-board-dot" />{t('live')}</span>
            : null}
          <button
            type="button"
            className="dsh-board-close"
            aria-label={t('panel.collapse.aria')}
            onClick={() => { if (wide) setCollapsed(true); else setOpen(false) }}
          >
            ✕
          </button>
        </span>
      </div>
      <div className="dsh-board-hero">
        <div className="dsh-board-hero-value">{formatTokens(hero)}</div>
        <div className="dsh-board-hero-label">{t('global.tokens')}</div>
      </div>
      <div className="dsh-board-hero-sub">
        {t('hero.streak', { n: usageStats.streak })} · {t('hero.sessions', { n: ids.length })} · {t('hero.cache', { percent: lifetime.input === 0 ? 0 : Math.round(lifetime.hit / lifetime.input * 100) })} · {t('global.cost')} {formatCost(lifetime.cost)} · {t('hero.thisCost', { cost: formatCost(sessionCost) })}
      </div>
      <div className="dsh-board-usage">
        <div className="dsh-board-usage-item">
          <span className="dsh-board-usage-label">{t('usage.total')}</span>
          <span className="dsh-board-usage-value">{formatTokens(lifetime.total)}</span>
        </div>
        <div className="dsh-board-usage-item">
          <span className="dsh-board-usage-label">{t('usage.today')}</span>
          <span className="dsh-board-usage-value">{formatTokens(lifetime.today)}</span>
        </div>
        <div className="dsh-board-usage-item">
          <span className="dsh-board-usage-label">{t('usage.week')}</span>
          <span className="dsh-board-usage-value">{formatTokens(lifetime.week)}</span>
        </div>
      </div>
      <MemoContextBlock pressure={pressure} breakdown={breakdown} subagentMs={subagentMs} t={t} />
      {fold.perTurn.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.trend')}</SectionTitle>
            <MemoTrendBars data={fold.perTurn.slice(-24)} />
            <div className="dsh-board-legend">
              <span><i className="dsh-board-legend-in" />{t('legend.in')}</span>
              <span><i className="dsh-board-legend-out" />{t('legend.out')}</span>
            </div>
          </>
        )}
      {fold.cumulative.length < 2
        ? null
        : (
          <>
            <SectionTitle>{t('sec.cumulative')}</SectionTitle>
            <MemoCumulativeArea values={fold.cumulative.slice(-60)} />
          </>
        )}
      {lifetime.daily.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.heat')}</SectionTitle>
            <MemoHeatmap daily={lifetime.daily} />
            <div className="dsh-board-heat-note">{t('heat.note')}</div>
          </>
        )}
      <MemoMembershipCard total={lifetime.total} daily={lifetime.daily} t={t} />
      {models.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.model')}</SectionTitle>
            <MemoModelRows models={models} t={t} />
          </>
        )}
      <SectionTitle>{t('sec.achievements')}</SectionTitle>
      <MemoAchievements stats={usageStats} t={t} />
      {lifetime.sessions.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.global')}</SectionTitle>
            <MemoSessionRows sessions={lifetime.sessions} />
          </>
        )}
      <div className="dsh-board-note">
        {t('note.pricing')} · {isPeakHour() ? t('window.peak') : t('window.offpeak')}
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className={wide ? 'dsh-board-foot dsh-board-wide' : 'dsh-board-foot'}>
      <button
        type="button"
        className={wide ? 'dsh-board-trigger' : 'dsh-board-trigger dsh-board-orb'}
        style={{ '--tier': rank.level.color } as never}
        aria-expanded={wide ? !collapsed : open}
        title={rankName}
        onClick={toggle}
      >
        {wide
          ? (
            <>
              <span className="dsh-board-badge">
                <span className="dsh-board-tag" style={{ background: rank.level.color }}>{rankName}</span>
                <span className="dsh-board-badge-nums">
                  <span className="dsh-board-badge-cost">{formatCost(lifetime.cost)}</span>
                  <span className="dsh-board-badge-tokens">{formatTokens(lifetime.total)} token</span>
                </span>
                <span className="dsh-board-badge-sub">{t('usage.today')} {formatTokens(lifetime.today)} · {t('usage.week')} {formatTokens(lifetime.week)}</span>
                <span className="dsh-board-chevron">{collapsed ? '▸' : '▾'}</span>
              </span>
              {running ? <StateDot state="ongoing" className="dsh-board-live-dot" /> : null}
            </>
          )
          : <span className="dsh-board-orb-emoji">{rank.level.emoji}</span>}
      </button>
      {panelVisible ? <div className="dsh-board-float">{panel}</div> : null}
    </div>
  )
})
