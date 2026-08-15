/**
 * Chuunibyou rank ladder over lifetime tokens (all sessions).
 * Names are word-puns (谐音梗) on household names — 万词王 at ten million.
 * Thresholds are cumulative totals; rankFor picks the highest level whose
 * floor the total meets.
 */
export interface RankLevel {
  floor: number
  emoji: string
  zh: string
  en: string
}

export const LEVELS: readonly RankLevel[] = [
  { floor: 0, emoji: '🐣', zh: '词芽未醒', en: 'Unawakened Sprout' },
  { floor: 10_000, emoji: '🥉', zh: '词徒', en: 'Word Apprentice' },
  { floor: 100_000, emoji: '🥈', zh: '白银话痨', en: 'Silver Chatterbox' },
  { floor: 1_000_000, emoji: '🥇', zh: '百万词翁', en: 'Token Millionaire' },
  { floor: 10_000_000, emoji: '💎', zh: '万词王', en: 'Wordlord' },
  { floor: 100_000_000, emoji: '🚀', zh: '亿词小目标', en: 'The Billion-Token Small Goal' },
  { floor: 1_000_000_000, emoji: '👑', zh: '十亿词霸', en: 'Billion-Token Wordmaster' },
  { floor: 10_000_000_000, emoji: '🐲', zh: '百亿词圣', en: 'Hundred-Billion Word Saint' },
  { floor: 100_000_000_000, emoji: '🌌', zh: '千亿词仙', en: 'Trillion Word Immortal' },
  { floor: 1_000_000_000_000, emoji: '⚡', zh: '万亿词神', en: 'Ten-Trillion Word God' },
]

/** The active level for a lifetime token total. */
export function rankFor(total: number): { level: RankLevel; next: RankLevel | null } {
  let level = LEVELS[0]
  for (const candidate of LEVELS) {
    if (total >= candidate.floor) level = candidate
  }
  const index = LEVELS.indexOf(level)
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null
  return { level, next }
}
