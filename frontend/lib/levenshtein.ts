/* ═══════════════════════════════════════════════════════════════════════════
   Levenshtein distance – for fuzzy string similarity in speech recognition
   ═══════════════════════════════════════════════════════════════════════════ */

export function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;

  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];

  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Returns a similarity score between 0 and 1.
 * 1 = identical, 0 = completely different.
 */
export function similarity(a: string, b: string): number {
  const cleanA = a.toLowerCase().trim().replace(/[.,!?¿¡]/g, "");
  const cleanB = b.toLowerCase().trim().replace(/[.,!?¿¡]/g, "");

  if (cleanA === cleanB) return 1;

  const maxLen = Math.max(cleanA.length, cleanB.length);
  if (maxLen === 0) return 1;

  const dist = levenshtein(cleanA, cleanB);
  return 1 - dist / maxLen;
}
