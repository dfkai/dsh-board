/** `rich` namespace dictionaries (zh is the key-set source of truth). */

/** Dictionary namespace owned by this plugin. */
export const NS = 'rich'

export const zh = {
  'label.budget': '剩余预算',
  'label.turn': '本轮',
  'label.rate': '流式速率',
  'label.jobs': '后台任务',
  'label.subagents': '子代理',
  'budget.sub': '{percent}% 已用 · 约 {turns} 轮',
  'budget.subNoTurns': '{percent}% 已用',
  'turn.sub': '{steps} 步 · {duration}',
  'turn.subLive': '{steps} 步 · 进行中',
  'rate.idle': '空闲',
  'rate.elapsed': '已流式 {elapsed}',
  'value.none': '无',
  'value.jobs.running': '{n} 运行中',
  'value.jobs.count': '{n} 条',
  'value.subs.running': '{running} / {total} 运行中',
  'value.subs.idle': '{total} 个空闲',
  'empty': 'dsh-rich · 发一句话后，这里会显示本轮 token、流式速率与任务状态',
} as const

export const en: Record<RichKey, string> = {
  'label.budget': 'Budget left',
  'label.turn': 'This turn',
  'label.rate': 'Stream rate',
  'label.jobs': 'Jobs',
  'label.subagents': 'Subagents',
  'budget.sub': '{percent}% used · ~{turns} turns',
  'budget.subNoTurns': '{percent}% used',
  'turn.sub': '{steps} steps · {duration}',
  'turn.subLive': '{steps} steps · streaming',
  'rate.idle': 'idle',
  'rate.elapsed': 'streamed {elapsed}',
  'value.none': 'none',
  'value.jobs.running': '{n} running',
  'value.jobs.count': '{n} total',
  'value.subs.running': '{running} / {total} running',
  'value.subs.idle': '{total} idle',
  'empty': 'dsh-rich · send a message and this spot shows per-turn tokens, stream rate, and task state',
}

/** Key domain of the `rich` namespace. */
export type RichKey = keyof typeof zh
