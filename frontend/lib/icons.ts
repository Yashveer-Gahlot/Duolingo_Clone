/* ═══════════════════════════════════════════════════════════════════════════
   Skill icon mapping – returns an emoji for each skill icon_name from the DB.
   ═══════════════════════════════════════════════════════════════════════════ */

const ICON_MAP: Record<string, string> = {
  star: "⭐",
  chat: "💬",
  utensils: "🍽️",
  book: "📖",
  globe: "🌍",
  heart: "❤️",
  music: "🎵",
  camera: "📷",
  flag: "🏁",
  trophy: "🏆",
  lightning: "⚡",
  fire: "🔥",
  gem: "💎",
  crown: "👑",
  lock: "🔒",
};

export function getSkillIcon(iconName: string | null): string {
  if (!iconName) return "⭐";
  return ICON_MAP[iconName] ?? "⭐";
}
