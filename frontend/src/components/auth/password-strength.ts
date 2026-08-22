/** Scores a password 0–4 using the project's auth rules. */
export function scorePassword(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;
  return Math.min(score, 4);
}
