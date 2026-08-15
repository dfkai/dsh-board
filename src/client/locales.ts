/** `rich` namespace dictionaries (zh is the key-set source of truth). */

/** Dictionary namespace owned by this plugin. */
export const NS = 'rich'

export const zh = {
  'panel.title': '用量统计',
  'panel.session': '本会话',
  'panel.estimate': '估算',
  'trigger.wide': '用量 {cost}',
  'tokens.in': '输入',
  'tokens.out': '输出',
  'tokens.total': '合计',
  'tokens.cache': '缓存命中 {percent}%',
  'spark.title': '每轮输出走势',
  'spark.empty': '暂无数据',
  'note.pricing': '按 deepseek-chat 公开价估算，可在 pricing.ts 调整',
} as const

export const en: Record<RichKey, string> = {
  'panel.title': 'Usage',
  'panel.session': 'this session',
  'panel.estimate': 'est.',
  'trigger.wide': 'Usage {cost}',
  'tokens.in': 'Input',
  'tokens.out': 'Output',
  'tokens.total': 'Total',
  'tokens.cache': 'cache hit {percent}%',
  'spark.title': 'Output per turn',
  'spark.empty': 'No data yet',
  'note.pricing': 'Estimated from public deepseek-chat prices; edit pricing.ts',
}

/** Key domain of the `rich` namespace. */
export type RichKey = keyof typeof zh
