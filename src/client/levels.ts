/**
 * 「词勋」membership ladder over lifetime tokens (all sessions).
 * Names are word-puns (谐音梗) on household names — 万词王 at ten million.
 * Each tier carries its own theme color, like a VIP membership system.
 * Thresholds are cumulative totals; rankFor picks the highest level whose
 * floor the total meets.
 */
export interface RankLevel {
  floor: number
  emoji: string
  zh: string
  en: string
  /** Membership tier color (bronze/silver/gold/diamond...). */
  color: string
}

export const LEVELS: readonly RankLevel[] = [
  { floor: 0, emoji: '🌱', zh: '未醒词芽', en: 'the Unawakened Sprout', color: '#9b96b8' },
  { floor: 10_000, emoji: '🥉', zh: '词途学徒', en: 'Apprentice of the Word-Path', color: '#cd7f32' },
  { floor: 100_000, emoji: '💬', zh: '白银之舌', en: 'the Silver Tongue', color: '#8b95a1' },
  { floor: 1_000_000, emoji: '💰', zh: '一词千金', en: 'One Word, A Thousand Gold', color: '#d4a017' },
  { floor: 10_000_000, emoji: '🧲', zh: '万词王', en: 'Wordlord', color: '#7c3aed' },
  { floor: 100_000_000, emoji: '🎯', zh: '亿词逐梦者', en: 'the Billion-Dream Chaser', color: '#ef4444' },
  { floor: 1_000_000_000, emoji: '👑', zh: '十亿词霸', en: 'Billion-Token Wordmaster', color: '#f97316' },
  { floor: 10_000_000_000, emoji: '📜', zh: '词林盟主', en: 'the Wordwood Overlord', color: '#0891b2' },
  { floor: 100_000_000_000, emoji: '🧚', zh: '词高八斗', en: 'the Eight-Bushel Wordsmith', color: '#a855f7' },
  { floor: 1_000_000_000_000, emoji: '⚡', zh: '万亿词神', en: 'Ten-Trillion Word God', color: '#ca8a04' },
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
