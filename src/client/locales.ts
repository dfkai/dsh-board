/** `rich` namespace dictionaries (zh is the key-set source of truth). */

/** Dictionary namespace owned by this plugin. */
export const NS = 'rich'

export const zh = {
  'label.context': '上下文占用',
  'label.tokens': 'Token 消耗',
  'label.jobs': '后台任务',
  'label.subagents': '子代理',
  'label.turns': '轮次 / 步骤',
  'label.ttft': '首 token 延迟',
  'value.none': '无',
  'value.jobs.running': '{n} 运行中',
  'value.jobs.count': '{n} 条',
  'value.subs.running': '{running} / {total} 运行中',
  'value.subs.idle': '{total} 个空闲',
  'sub.decode': '解码 {duration}',
  'sub.llm': 'LLM {duration}',
  'sub.tools': '工具 {duration}',
  'empty': 'dsh-rich · 等待会话活动（token / 任务 / 子代理出现后展开）',
} as const

export const en: Record<RichKey, string> = {
  'label.context': 'Context',
  'label.tokens': 'Tokens',
  'label.jobs': 'Jobs',
  'label.subagents': 'Subagents',
  'label.turns': 'Turns / Steps',
  'label.ttft': 'TTFT',
  'value.none': 'none',
  'value.jobs.running': '{n} running',
  'value.jobs.count': '{n} total',
  'value.subs.running': '{running} / {total} running',
  'value.subs.idle': '{total} idle',
  'sub.decode': 'decode {duration}',
  'sub.llm': 'LLM {duration}',
  'sub.tools': 'tools {duration}',
  'empty': 'dsh-rich · waiting for session activity (expands with tokens / jobs / subagents)',
}

/** Key domain of the `rich` namespace. */
export type RichKey = keyof typeof zh
