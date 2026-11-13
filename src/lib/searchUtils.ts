/**
 * searchUtils.ts
 * Utility for Vietnamese diacritic-insensitive search and text normalization.
 */

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Checks if search query matches any of the candidate strings,
 * case-insensitive and Vietnamese diacritic-insensitive.
 */
export function matchesQuery(query: string, ...candidates: (string | undefined | null)[]): boolean {
  if (!query || !query.trim()) return true;
  const normalizedQuery = removeVietnameseTones(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTokens.every((token) =>
    candidates.some((candidate) => {
      if (!candidate) return false;
      const normalizedCandidate = removeVietnameseTones(candidate);
      return normalizedCandidate.includes(token);
    })
  );
}
