/**
 * Pain Point Matcher
 * 
 * Mendeteksi dan memetakan query user ke pain point yang relevan
 * Contoh: "bunyi gludak-gluduk pada saat mobil jalan" -> "masalah suspensi"
 */

// Mapping keywords ke pain point
export const PAIN_POINT_KEYWORDS: Record<string, string[]> = {
  // Masalah Suspensi
  'suspensi': ['bunyi', 'gludak', 'gluduk', 'berbunyi', 'berisik', 'suspensi', 'shock', 'absorber', 'per', 'pegas'],
  'rem': ['rem', 'brake', 'bunyi rem', 'rem bunyi', 'rem blong', 'rem tidak pakem', 'rem tidak berfungsi'],
  'ac': ['ac', 'air conditioner', 'tidak dingin', 'ac tidak dingin', 'ac panas', 'ac bocor', 'ac berbau'],
  'mesin': ['mesin', 'engine', 'mesin mati', 'mesin tidak nyala', 'mesin kasar', 'mesin berisik', 'knocking'],
  'transmisi': ['transmisi', 'transmission', 'gigi susah masuk', 'transmisi kasar', 'kopling', 'clutch'],
  'kelistrikan': ['lampu', 'lampu mati', 'aki', 'baterai', 'starter', 'alternator', 'dinamo', 'kelistrikan'],
  'oli': ['oli', 'oil', 'ganti oli', 'service berkala', 'tune up', 'perawatan'],
  'ban': ['ban', 'tire', 'ban bocor', 'ban gundul', 'ban aus', 'ban kempes'],
  'body': ['body', 'cat', 'dempul', 'body repair', 'ketok magic', 'cat ulang'],
};

// Mapping pain point ke service types yang relevan
export const PAIN_POINT_TO_SERVICE_TYPES: Record<string, string[]> = {
  'suspensi': [
    'Perbaikan Suspensi',
    'Ganti Shock Absorber',
    'Service Suspensi',
    'Perbaikan Per',
    'Ganti Bushing Suspensi',
    'Perbaikan Stabilizer',
  ],
  'rem': [
    'Perbaikan Rem',
    'Ganti Kampas Rem',
    'Service Rem',
    'Bleeding Rem',
    'Ganti Disc Brake',
    'Perbaikan Master Rem',
  ],
  'ac': [
    'Service AC',
    'Isi Freon AC',
    'Perbaikan AC',
    'Ganti Kompresor AC',
    'Bersihkan AC',
    'Perbaikan Kondensor AC',
  ],
  'mesin': [
    'Perbaikan Mesin',
    'Service Mesin',
    'Tune Up',
    'Ganti Timing Belt',
    'Perbaikan Radiator',
    'Service Karburator',
  ],
  'transmisi': [
    'Service Transmisi',
    'Perbaikan Transmisi',
    'Ganti Kopling',
    'Service Kopling',
    'Perbaikan Gearbox',
  ],
  'kelistrikan': [
    'Perbaikan Kelistrikan',
    'Service Aki',
    'Perbaikan Lampu',
    'Perbaikan Starter',
    'Perbaikan Alternator',
  ],
  'oli': [
    'Ganti Oli',
    'Service Berkala',
    'Tune Up',
    'Service Rutin',
  ],
  'ban': [
    'Ganti Ban',
    'Tambal Ban',
    'Service Ban',
    'Spooring & Balancing',
  ],
  'body': [
    'Body Repair',
    'Cat Ulang',
    'Ketok Magic',
    'Dempul',
  ],
};

export interface MatchedPainPoint {
  painPointId: string;
  painPointName: string;
  confidence: number; // 0-1, seberapa yakin match ini
  matchedKeywords: string[];
  serviceTypes: string[];
}

/**
 * Extract keywords dari query user
 */
function extractKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery
    .replace(/[^\w\s]/g, ' ') // Hapus tanda baca
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter kata terlalu pendek
  
  return words;
}

/**
 * Match query ke pain point berdasarkan keywords
 */
export function matchPainPoint(query: string): MatchedPainPoint | null {
  if (!query || query.trim().length < 3) {
    return null;
  }

  const lowerQuery = query.toLowerCase().trim();
  const keywords = extractKeywords(lowerQuery);
  
  // Score untuk setiap pain point
  const scores: Record<string, { count: number; matchedKeywords: string[] }> = {};

  // Check setiap pain point
  for (const [painPointId, painPointKeywords] of Object.entries(PAIN_POINT_KEYWORDS)) {
    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      // Exact match
      if (painPointKeywords.some(k => k === keyword)) {
        matchCount += 2; // Exact match lebih tinggi score
        matchedKeywords.push(keyword);
      }
      // Partial match (keyword ada di pain point keywords)
      else if (painPointKeywords.some(k => k.includes(keyword) || keyword.includes(k))) {
        matchCount += 1;
        matchedKeywords.push(keyword);
      }
    }

    // Check full phrase match (untuk kasus seperti "bunyi gludak-gluduk")
    for (const painPointKeyword of painPointKeywords) {
      if (lowerQuery.includes(painPointKeyword)) {
        matchCount += 3; // Full phrase match score tertinggi
        if (!matchedKeywords.includes(painPointKeyword)) {
          matchedKeywords.push(painPointKeyword);
        }
      }
    }

    if (matchCount > 0) {
      scores[painPointId] = {
        count: matchCount,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      };
    }
  }

  // Cari pain point dengan score tertinggi
  let bestMatch: { id: string; score: number; matchedKeywords: string[] } | null = null;
  
  for (const [painPointId, scoreData] of Object.entries(scores)) {
    if (!bestMatch || scoreData.count > bestMatch.score) {
      bestMatch = {
        id: painPointId,
        score: scoreData.count,
        matchedKeywords: scoreData.matchedKeywords,
      };
    }
  }

  if (!bestMatch || bestMatch.score < 2) {
    // Score terlalu rendah, tidak confident
    return null;
  }

  // Calculate confidence (0-1)
  const confidence = Math.min(bestMatch.score / 10, 1); // Max score ~10 = confidence 1.0

  const serviceTypes = PAIN_POINT_TO_SERVICE_TYPES[bestMatch.id] || [];

  return {
    painPointId: bestMatch.id,
    painPointName: getPainPointName(bestMatch.id),
    confidence,
    matchedKeywords: bestMatch.matchedKeywords,
    serviceTypes,
  };
}

/**
 * Get human-readable pain point name
 */
function getPainPointName(painPointId: string): string {
  const names: Record<string, string> = {
    'suspensi': 'Masalah Suspensi',
    'rem': 'Masalah Rem',
    'ac': 'Masalah AC',
    'mesin': 'Masalah Mesin',
    'transmisi': 'Masalah Transmisi',
    'kelistrikan': 'Masalah Kelistrikan',
    'oli': 'Service Berkala',
    'ban': 'Masalah Ban',
    'body': 'Body Repair',
  };
  return names[painPointId] || painPointId;
}

/**
 * Check if query looks like a pain point (vs location/name search)
 */
export function isPainPointQuery(query: string): boolean {
  const matched = matchPainPoint(query);
  return matched !== null && matched.confidence > 0.3;
}

/**
 * Get search suggestions based on query
 */
export function getSearchSuggestions(query: string): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const suggestions: string[] = [];

  // Suggest pain points yang match
  for (const [painPointId, keywords] of Object.entries(PAIN_POINT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (keyword.includes(lowerQuery) || lowerQuery.includes(keyword)) {
        const name = getPainPointName(painPointId);
        if (!suggestions.includes(name)) {
          suggestions.push(name);
        }
      }
    }
  }

  return suggestions.slice(0, 5); // Max 5 suggestions
}


