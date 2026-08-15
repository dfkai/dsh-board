import { useEffect, useMemo, useRef, useState } from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import { NS, type RichKey } from './locales.ts'
import { estimateCost, isPeakHour, priceFor } from './pricing.ts'
import { foldHistory, formatCost, formatTokens, type HistoryFold, type TurnUsage } from './fold.ts'
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

function SectionTitle({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="dsh-rich-sec">{children}</div>
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
            <span className="dsh-rich-model-name" title={item.model}>{item.model}</span>
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
    <svg className="dsh-rich-heatmap" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      {Array.from({ length: weeks * rows }, (_, i) => {
        const day = start + i * 86_400_000
        const tokens = byDay.get(day) ?? 0
        const level = tokens === 0 ? 0 : Math.max(1, Math.min(5, Math.ceil(tokens / max * 5)))
        const x = Math.floor(i / rows) * (cell + gap)
        const y = (i % rows) * (cell + gap)
        return (
          <rect key={day} className={`dsh-rich-heat-l${level}`} x={x} y={y} width={cell} height={cell} rx={2}>
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

  // Level-up celebration: persisted last level, flash once on promotion.
  const LEVEL_KEY = 'dsh-rich.level'
  const lastIndexRef = useRef(-1)
  const [celebrating, setCelebrating] = useState(false)
  useEffect(() => {
    let last = lastIndexRef.current
    if (last === -1) {
      try {
        const stored = localStorage.getItem(LEVEL_KEY)
        if (stored !== null) last = Number(stored)
      } catch { /* ignore */ }
    }
    if (last !== -1 && index > last) {
      setCelebrating(true)
      const timer = setTimeout(() => setCelebrating(false), 2400)
      lastIndexRef.current = index
      try { localStorage.setItem(LEVEL_KEY, String(index)) } catch { /* ignore */ }
      return () => clearTimeout(timer)
    }
    lastIndexRef.current = index
    try { localStorage.setItem(LEVEL_KEY, String(index)) } catch { /* ignore */ }
    return undefined
  }, [index])

  return (
    <div className={celebrating ? 'dsh-rich-card dsh-rich-levelup' : 'dsh-rich-card'}>
      <div className="dsh-rich-card-head">
        <span>{t('rank.title')}</span>
        <span className="dsh-rich-card-lv">{t('rank.lv', { n: index + 1 })}</span>
      </div>
      <div className="dsh-rich-card-body">
        {prev === null
          ? <div className="dsh-rich-card-step dsh-rich-card-prev-empty" />
          : (
            <div className="dsh-rich-card-step dsh-rich-card-prev" title={t(`rank.${index - 1}` as RichKey)}>
              <span className="dsh-rich-card-step-emoji">{prev.emoji}</span>
              <span className="dsh-rich-card-step-name">{t(`rank.${index - 1}` as RichKey)}</span>
              <span className="dsh-rich-card-step-status">✓ {t('rank.unlocked')}</span>
            </div>
          )}
        <div className="dsh-rich-card-current">
          <span className="dsh-rich-card-current-emoji">{rank.level.emoji}</span>
          <span className="dsh-rich-card-current-name">{t(`rank.${index}` as RichKey)}</span>
          <span className="dsh-rich-card-current-tag">{t('rank.current')}</span>
        </div>
        {next === null
          ? <div className="dsh-rich-card-step dsh-rich-card-max">👑 MAX</div>
          : (
            <div className="dsh-rich-card-step dsh-rich-card-next" title={t(`rank.${index + 1}` as RichKey)}>
              <span className="dsh-rich-card-step-emoji">{next.emoji}</span>
              <span className="dsh-rich-card-step-name">{t(`rank.${index + 1}` as RichKey)}</span>
              <span className="dsh-rich-card-step-status">🔒 {t('rank.locked')}</span>
            </div>
          )}
      </div>
      <div className="dsh-rich-card-bar">
        <div className="dsh-rich-card-bar-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <div className="dsh-rich-card-next-line">
        {next === null
          ? t('rank.max')
          : `${t('rank.next', {
            name: t(`rank.${index + 1}` as RichKey),
            count: formatTokens(next.floor - total),
          })} · ${t('rank.percent', { percent: Math.round(progress * 100) })}`}
      </div>
      {next !== null && daysToNext !== null
        ? (
          <div className="dsh-rich-card-eta">
            {daysToNext < 1 ? t('rank.eta.today') : t('rank.eta', { days: daysToNext })}
          </div>
        )
        : null}
      <div className="dsh-rich-card-perks">
        <div className="dsh-rich-card-perk">
          <span className="dsh-rich-card-perk-label">✦ {t('rank.perk.current')}</span>
          <span className="dsh-rich-card-perk-value">{t(`perk.${index}` as RichKey)}</span>
        </div>
        {next === null
          ? null
          : (
            <div className="dsh-rich-card-perk dsh-rich-card-perk-locked">
              <span className="dsh-rich-card-perk-label">🔒 {t('rank.perk.next')}</span>
              <span className="dsh-rich-card-perk-value">{t(`perk.${index + 1}` as RichKey)}</span>
            </div>
          )}
      </div>
      <div className="dsh-rich-card-ladder">
        {LEVELS.map((level, i) => (
          <span
            key={level.floor}
            className={[
              'dsh-rich-card-rung',
              i < index ? 'dsh-rich-card-rung-done' : '',
              i === index ? 'dsh-rich-card-rung-now' : '',
              i > index ? 'dsh-rich-card-rung-locked' : '',
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
    <div className="dsh-rich-achievements">
      {ACHIEVEMENTS.map(achievement => {
        const got = achievement.test(stats)
        const nameKey = `ach.${achievement.id}` as RichKey
        const condKey = `ach.${achievement.id}.cond` as RichKey
        return (
          <span
            key={achievement.id}
            className={got ? 'dsh-rich-ach dsh-rich-ach-got' : 'dsh-rich-ach'}
            title={got ? t(nameKey) : `${t(nameKey)} · ${t(condKey)}`}
          >
            <span className="dsh-rich-ach-emoji">{achievement.emoji}</span>
            <span className="dsh-rich-ach-name">{t(nameKey)}</span>
          </span>
        )
      })}
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
    const daily = new Map<number, number>()
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
      if (Number.isFinite(row.updatedAt) && row.updatedAt > 0) {
        const day = new Date(row.updatedAt).setHours(0, 0, 0, 0)
        daily.set(day, (daily.get(day) ?? 0) + i + o)
      }
    }
    sessions.sort((left, right) => right.tokens - left.tokens)
    return {
      input,
      output,
      cost,
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

  const hero = useCountUp(lifetime.total)
  const rank = rankFor(lifetime.total)
  const rankName = t(`rank.${LEVELS.indexOf(rank.level)}` as RichKey)
  const usageStats = useMemo(() => computeStats(lifetime.daily, ids.length), [lifetime.daily, ids.length])

  // Refresh feel: a visible 5s pulse on the trigger, plus a blue flash
  // whenever the session cost actually changes (data itself arrives through
  // live push frames — this is the presentation refresh).
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(value => value + 1), 5000)
    return () => clearInterval(timer)
  }, [])
  const [flash, setFlash] = useState(false)
  const prevCostRef = useRef(sessionCost)
  useEffect(() => {
    if (prevCostRef.current !== sessionCost) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 700)
      prevCostRef.current = sessionCost
      return () => clearTimeout(timer)
    }
    prevCostRef.current = sessionCost
    return undefined
  }, [sessionCost])

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
        <span>{t('panel.title')}</span>
        <span className="dsh-rich-title-right">
          {running
            ? <span className="dsh-rich-live"><StateDot state="ongoing" className="dsh-rich-dot" />{t('live')}</span>
            : null}
          <button
            type="button"
            className="dsh-rich-close"
            aria-label={t('panel.collapse.aria')}
            onClick={() => { if (wide) setCollapsed(true); else setOpen(false) }}
          >
            ✕
          </button>
        </span>
      </div>
      <div className="dsh-rich-hero">
        <div className="dsh-rich-hero-value">{formatTokens(hero)}</div>
        <div className="dsh-rich-hero-label">{t('global.tokens')}</div>
      </div>
      <div className="dsh-rich-hero-sub">
        {t('hero.streak', { n: usageStats.streak })} · {t('hero.sessions', { n: ids.length })} · {t('global.cost')} {formatCost(lifetime.cost)} · {t('hero.thisCost', { cost: formatCost(sessionCost) })}
      </div>
      {fold.perTurn.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.trend')}</SectionTitle>
            <TrendBars data={fold.perTurn.slice(-24)} />
            <div className="dsh-rich-legend">
              <span><i className="dsh-rich-legend-in" />{t('legend.in')}</span>
              <span><i className="dsh-rich-legend-out" />{t('legend.out')}</span>
            </div>
          </>
        )}
      {fold.cumulative.length < 2
        ? null
        : (
          <>
            <SectionTitle>{t('sec.cumulative')}</SectionTitle>
            <CumulativeArea values={fold.cumulative.slice(-60)} />
          </>
        )}
      {lifetime.daily.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.heat')}</SectionTitle>
            <Heatmap daily={lifetime.daily} />
            <div className="dsh-rich-heat-note">{t('heat.note')}</div>
          </>
        )}
      <MembershipCard total={lifetime.total} daily={lifetime.daily} t={t} />
      {models.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.model')}</SectionTitle>
            <ModelRows models={models} t={t} />
          </>
        )}
      <SectionTitle>{t('sec.achievements')}</SectionTitle>
      <Achievements stats={usageStats} t={t} />
      {lifetime.sessions.length === 0
        ? null
        : (
          <>
            <SectionTitle>{t('sec.global')}</SectionTitle>
            <SessionRows sessions={lifetime.sessions} />
          </>
        )}
      <div className="dsh-rich-note">
        {t('note.pricing')} · {isPeakHour() ? t('window.peak') : t('window.offpeak')}
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className="dsh-rich-foot">
      <button
        type="button"
        className={wide ? 'dsh-rich-trigger' : 'dsh-rich-trigger dsh-rich-orb'}
        aria-expanded={wide ? !collapsed : open}
        title={rankName}
        onClick={toggle}
      >
        {wide
          ? null
          : <span className="dsh-rich-orb-emoji">{rank.level.emoji}</span>}
        {wide
          ? (
            <>
              <span key={tick} className={flash ? 'dsh-rich-trigger-metrics dsh-rich-flash' : 'dsh-rich-trigger-metrics'}>
                <span className="dsh-rich-trigger-name">{rankName}</span>
                <span className="dsh-rich-trigger-tokens">{formatTokens(lifetime.total)}</span>
                <span className="dsh-rich-trigger-cost">{formatCost(sessionCost)}</span>
              </span>
              {running ? <StateDot state="ongoing" className="dsh-rich-dot" /> : null}
              <span className="dsh-rich-chevron">{collapsed ? '▸' : '▾'}</span>
            </>
          )
          : null}
      </button>
      {wide
        ? (collapsed ? null : <div className="dsh-rich-inline">{panel}</div>)
        : open
          ? <div className="dsh-rich-float">{panel}</div>
          : null}
    </div>
  )
}
