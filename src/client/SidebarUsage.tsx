import { useEffect, useRef, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'
import { NS, type RichKey } from './locales.ts'
import { estimateCost } from './pricing.ts'

/** Structural view of the connection client this entry consumes. */
interface HistoryValue {
  events: readonly { event: unknown }[]
}
interface ConnectionLike {
  sessions: {
    history(payload: { sessionId: string; maxMessages?: number }):
    Promise<{ result: { ok: boolean; value?: HistoryValue } }>
  }
}

export type SidebarUsageProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<typeof NS> & {
  api: ConnectionLike
}

/** Fold assistant/chunk usage events into per-turn output tokens. */
function foldTurnOutput(entries: readonly { event: unknown }[]): { turn: number; tokens: number }[] {
  const perTurn = new Map<number, number>()
  for (const entry of entries) {
    const event = entry.event as {
      type?: string
      data?: { turn?: number; chunk?: { type?: string; usage?: { outputTokens?: number } } }
    }
    if (event?.type !== 'assistant/chunk') continue
    const chunk = event.data?.chunk
    if (chunk?.type !== 'usage') continue
    const turn = event.data?.turn
    const out = chunk.usage?.outputTokens
    if (turn === undefined || typeof out !== 'number') continue
    perTurn.set(turn, (perTurn.get(turn) ?? 0) + out)
  }
  return [...perTurn.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([turn, tokens]) => ({ turn, tokens }))
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${Math.round(n / 100) / 10}K`
  return `${Math.round(n / 100_000) / 10}M`
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

function Sparkline({ data }: { data: readonly { turn: number; tokens: number }[] }): JSX.Element | null {
  const last = data.slice(-24)
  if (last.length === 0) return null
  const max = Math.max(1, ...last.map(item => item.tokens))
  const width = last.length * 8 - 2
  return (
    <svg className="dsh-rich-spark" viewBox={`0 0 ${width} 28`} width={width} height={28} aria-hidden>
      {last.map((item, index) => {
        const height = Math.max(2, Math.round(item.tokens / max * 26))
        return (
          <rect
            key={item.turn}
            x={index * 8}
            y={28 - height}
            width={6}
            height={height}
            rx={2}
            className={index === last.length - 1 ? 'dsh-rich-spark-last' : 'dsh-rich-spark-bar'}
          >
            <title>{`第 ${item.turn} 轮 · ${item.tokens} tok`}</title>
          </rect>
        )
      })}
    </svg>
  )
}

/**
 * Sidebar foot entry: a live cost trigger next to Settings. Clicking opens
 * the usage panel — estimated cost, token breakdown, and a per-turn output
 * sparkline — anchored above the sidebar foot. Root scope: reads the current
 * session's projections from the session-list store and folds recent turns
 * from the history RPC.
 */
export function SidebarUsage({ wide, useSessions, api, t }: SidebarUsageProps): JSX.Element {
  const current = useSessions(s => s.current)
  const summary = useSessions(s => s.current === undefined ? undefined : s.byId[s.current])
  const usage = summary?.projectionValues?.tokenUsage as TokenUsageProjection | undefined
  const steps = (summary?.projectionValues?.sessionStats as { steps?: number } | undefined)?.steps
  const [open, setOpen] = useState(false)
  const [series, setSeries] = useState<{ turn: number; tokens: number }[]>([])
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (current === undefined) return
    let cancelled = false
    void (async () => {
      try {
        const res = await api.sessions.history({ sessionId: current, maxMessages: 60 })
        if (cancelled || !res.result.ok || res.result.value === undefined) return
        setSeries(foldTurnOutput(res.result.value.events))
      } catch {
        // History unavailable — keep whatever series we had.
      }
    })()
    return () => { cancelled = true }
  }, [current, api, open, steps])

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

  const cost = usage === undefined ? 0 : estimateCost(usage)
  const costText = cost <= 0 ? '¥0' : cost < 0.01 ? `¥${cost.toFixed(4)}` : `¥${cost.toFixed(2)}`
  const totalIn = usage === undefined ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
  const totalTokens = totalIn + (usage?.outputTokens ?? 0)
  const cacheHitPercent = totalIn === 0
    ? null
    : Math.round((usage?.cacheReadTokens ?? 0) / totalIn * 100)

  return (
    <div ref={rootRef} className="dsh-rich-foot">
      <button
        type="button"
        className="dsh-rich-trigger"
        aria-expanded={open}
        title={t('panel.title')}
        onClick={() => setOpen(value => !value)}
      >
        <span className="dsh-rich-trigger-label">{wide ? t('trigger.wide', { cost: costText }) : '¥'}</span>
      </button>
      {open
        ? (
          <div className="dsh-rich-panel">
            <div className="dsh-rich-panel-title">{t('panel.title')} · {t('panel.session')}</div>
            <div className="dsh-rich-hero">
              <span className="dsh-rich-hero-value">{costText}</span>
              <span className="dsh-rich-hero-note">{t('panel.estimate')}</span>
            </div>
            {usage === undefined
              ? null
              : (
                <div className="dsh-rich-rows">
                  <Row
                    label={t('tokens.in')}
                    value={formatTokens(totalIn)}
                    sub={cacheHitPercent === null ? undefined : t('tokens.cache', { percent: cacheHitPercent })}
                  />
                  <Row label={t('tokens.out')} value={formatTokens(usage.outputTokens)} />
                  <Row label={t('tokens.total')} value={formatTokens(totalTokens)} />
                </div>
              )}
            <div className="dsh-rich-spark-title">{t('spark.title')}</div>
            {series.length === 0
              ? <div className="dsh-rich-spark-empty">{t('spark.empty')}</div>
              : <Sparkline data={series} />}
            <div className="dsh-rich-note">{t('note.pricing')}</div>
          </div>
        )
        : null}
    </div>
  )
}
