// Returns "morning" | "afternoon" | "evening" | "night" based on IST hour

export function getTimeOfDay(): string {
  // Convert to IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5 * 60 + 30; // minutes
  const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istHour = Math.floor((utcMin + istOffset) % (24 * 60) / 60);

  if (istHour < 12) return "morning";
  if (istHour < 17) return "afternoon";
  if (istHour < 21) return "evening";
  return "night";
}

// Returns today's date string as YYYY-MM-DD in IST
export function todayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60_000);
  return ist.toISOString().split("T")[0];
}

// Normalise a score 0-1 into an integer 1-10
export function scoreTo10(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value * 10)));
}

// Pick the key with the largest value from a plain object
export function maxKey(obj: Record<string, number>): string {
  return Object.keys(obj).reduce((a, b) => (obj[a] >= obj[b] ? a : b));
}